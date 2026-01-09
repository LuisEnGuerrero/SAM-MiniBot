// functions/src/chatbot.ts
// VERSION: 4.0.0 — SaaS + Domain Guard + FAQ + PDF + Multi-LLM

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { resolveFAQ } from './services/faq.service';
import { getClientContext } from './services/context.service';
import { generateLLMResponse } from './services/llm.service';

// --------------------
// Init Firebase Admin
// --------------------
export function getDB() {
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
// Helper: domain check
// --------------------
function isDomainAllowed(
  origin: string | undefined,
  allowed: string | string[] | undefined
): boolean {
  // Allow non-browser tools (Postman, curl, backend)
  if (!origin) return true;

  if (!allowed) return false;

  const domains = Array.isArray(allowed) ? allowed : [allowed];

  return domains.some(domain =>
    origin.includes(domain)
  );
}

// --------------------
// Handler
// --------------------
export async function chatbotHandler(
  request: Request,
  response: Response
) {
  try {
    const {
      clientId,
      message,
      sessionId = 'default'
    } = request.body as ChatRequest;

    // --------------------
    // Validations
    // --------------------
    if (!clientId) {
      return response.status(400).json({ error: 'clientId es requerido' });
    }

    if (!message) {
      return response.status(400).json({ error: 'El mensaje es requerido' });
    }

    const db = getDB();
    const clientRef = db.collection('clients').doc(clientId);
    const clientSnap = await clientRef.get();

    if (!clientSnap.exists) {
      return response.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    const clientData = clientSnap.data()!;

    // --------------------
    // 🔒 Active check
    // --------------------
    if (clientData.active === false) {
      return response.status(403).json({
        error: 'Cliente inactivo'
      });
    }

    // --------------------
    // 🔒 Domain validation
    // --------------------
    const origin = request.headers.origin;

    const domainAllowed = isDomainAllowed(
      origin,
      clientData.domain
    );

    if (!domainAllowed) {
      return response.status(403).json({
        error: 'Dominio no autorizado'
      });
    }

    let responseText: string;
    let source: ResponseSource;
    let confidence = 0;

    // --------------------
    // 1️⃣ FAQ
    // --------------------
    const faqResult = await resolveFAQ(clientId, message);

    if (faqResult && faqResult.confidence >= 0.6) {
      responseText = faqResult.answer;
      confidence = faqResult.confidence;
      source = 'faq';
    }

    // --------------------
    // 2️⃣ LLM
    // --------------------
    else if (clientData.llm?.enabled && clientData.llm.provider) {
      const context = await getClientContext(clientId);

      const llmAnswer = await generateLLMResponse(
        clientData.llm.provider,
        {
          message,
          context: context ?? undefined,
          systemPrompt: clientData.llm.systemPrompt
        }
      );

      responseText = llmAnswer;
      source = 'llm';
      confidence = 1;
    }

    // --------------------
    // 3️⃣ Default
    // --------------------
    else {
      const defaultConfig = await clientRef
        .collection('chatbot_config')
        .doc('default')
        .get();

      responseText =
        defaultConfig.exists && defaultConfig.data()?.value
          ? defaultConfig.data()!.value
          : 'Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?';

      source = 'default';
      confidence = 0;
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
    // Response
    // --------------------
    return response.status(200).json({
      response: responseText,
      sessionId,
      source,
      confidence,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('[chatbot] Error:', error);

    return response.status(500).json({
      error:
        'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
    });
  }
}
