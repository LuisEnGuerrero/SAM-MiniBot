// functions/src/chatbot.ts
// VERSION: 4.0.3 — Production Safe

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { resolveFAQ } from './services/faq.service';
import { getClientContext } from './services/context.service';
import { generateLLMResponse } from './services/llm.service';
import { getFaqSuggestions } from './services/faqSuggestions.service';

// --------------------
// Firebase DB helper
// --------------------
function getDB() {
  return admin.firestore();
}

// --------------------
// Types
// --------------------
interface ChatRequest {
  clientId: string;
  message: string;
  sessionId?: string;
}

type ResponseSource = 'faq' | 'default' | 'llm';

// --------------------
// Helper: domain check (SAFE)
// --------------------
function normalizeDomain(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => String(v).replace(/^https?:\/\//, ''));
  }
  return [String(value).replace(/^https?:\/\//, '')];
}

function isDomainAllowed(
  origin: string | undefined,
  allowed: unknown
): boolean {
  // Allow Postman / curl
  if (!origin) return true;

  const cleanOrigin = origin.replace(/^https?:\/\//, '');
  const domains = normalizeDomain(allowed);

  // No restriction configured → allow
  if (domains.length === 0) return true;

  return domains.some(domain => cleanOrigin.includes(domain));
}

// --------------------
// Handler
// --------------------
export async function chatbotHandler(
  request: Request,
  response: Response
) {
  try {
    const { clientId, message, sessionId = 'default' } =
      request.body as ChatRequest;

    if (!clientId || !message) {
      return response.status(400).json({
        error: 'clientId y message son requeridos'
      });
    }

    const db = getDB();
    const clientRef = db.collection('clients').doc(clientId);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      return response.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    const clientData = clientSnap.data() ?? {};

    // --------------------
    // Active check
    // --------------------
    if (clientData.active === false) {
      return response.status(403).json({
        error: 'Cliente inactivo'
      });
    }

    // --------------------
    // Domain guard
    // --------------------
    const origin = request.headers.origin as string | undefined;
    const SAAS_DOMAIN = 'mini-bot-7a21d.web.app';
    const cleanOrigin = origin?.replace(/^https?:\/\//, '');

    // 1️⃣ Permitir siempre llamadas desde el SaaS
    if (cleanOrigin?.includes(SAAS_DOMAIN)) {
      // allow
    }
    // 2️⃣ Validar dominios externos del cliente
    else if (!isDomainAllowed(origin, clientData.domain)) {
      return response.status(403).json({
        error: 'Dominio no autorizado'
      });
    }


    let responseText = '';
    let source: ResponseSource = 'default';
    let confidence = 0;

    // --------------------
    // 1️⃣ FAQ
    // --------------------
    try {
      const faqResult = await resolveFAQ(clientId, message);

      if (faqResult && faqResult.confidence >= 0.6) {
        responseText = faqResult.answer;
        confidence = faqResult.confidence;
        source = 'faq';
      }
    } catch (err) {
      console.warn('[FAQ] skipped:', err);
    }

    // --------------------
    // 2️⃣ LLM
    // --------------------
    if (
      source === 'default' &&
      clientData.llm?.enabled &&
      clientData.llm?.provider
    ) {
      try {
        const context = await getClientContext(clientId);

        const llmAnswer = await generateLLMResponse(
          clientData.llm.provider,
          {
            message,
            context: context ?? undefined,
            systemPrompt: clientData.llm.systemPrompt
          }
        );

        if (llmAnswer?.trim()) {
          responseText = llmAnswer;
          source = 'llm';
          confidence = 1;
        }
      } catch (err) {
        console.warn('[LLM] fallback:', err);
      }
    }

    // --------------------
    // 3️⃣ Default
    // --------------------
    if (source === 'default') {
      const defaultConfig = await clientRef
        .collection('chatbot_config')
        .doc('default')
        .get();

      responseText =
        defaultConfig.exists && defaultConfig.data()?.value
          ? defaultConfig.data()!.value
          : 'Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?';
    }

    // --------------------
    // Persist conversation
    // --------------------
    const now = new Date();

    await clientRef.collection('chat_conversations').add({
      sessionId,
      userMessage: message,
      botResponse: responseText,
      source,
      confidence,
      timestamp: now
    });

    // --------------------
    // FAQ suggestions (SAFE)
    // --------------------
    let suggestedFaqs: string[] = [];

    if (source === 'default') {
      try {
        suggestedFaqs = await getFaqSuggestions(clientId, 5);
      } catch (err) {
        console.warn('[FAQ Suggestions] skipped:', err);
      }
    }

    // --------------------
    // Response
    // --------------------
    return response.status(200).json({
      response: responseText,
      sessionId,
      source,
      confidence,
      suggestedFaqs,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('[chatbot] FATAL ERROR:', error);

    return response.status(500).json({
      error:
        'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
    });
  }
}
