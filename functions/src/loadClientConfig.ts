// functions/src/loadClientConfig.ts

import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

// ------------------------------------
// Tipos (claridad y robustez)
// ------------------------------------
type ClientPayload = {
  clientId: string;
  name?: string;
  domain?: string;
  active?: boolean;
  llm?: {
    enabled?: boolean;
    provider?: string | null;
    model?: string | null;
    [k: string]: any;
  };
  createdAt?: any;
  [k: string]: any;
};

type Payload = {
  client: ClientPayload;
  chatbot_config?: {
    default?: { value?: string; [k: string]: any };
    [k: string]: any;
  };
  chatbot_responses?: Array<{
    id: string;
    question: string;
    answer: string;
    active?: boolean;
    order?: number;
    [k: string]: any;
  }>;
  llm?: {
    enabled?: boolean;
    provider?: string | null;
    model?: string | null;
    [k: string]: any;
  };
  context?: {
    pdf?: Record<string, any>;
    [k: string]: any;
  };
  [k: string]: any;
};

/**
 * Carga o actualiza la configuración completa de un cliente MiniBot
 * - Cliente (upsert, idempotente)
 * - Configuración default
 * - FAQs
 * - Configuración LLM
 * - Contexto PDF
 *
 * ⚠️ Firebase Admin debe estar inicializado en index.ts
 */
export async function loadClientConfig(
  request: Request,
  response: Response
): Promise<void> {
  try {
    // --------------------
    // Método permitido
    // --------------------
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Método no permitido' });
      return;
    }

    // --------------------
    // Validar body
    // --------------------
    if (!request.is('application/json')) {
      response.status(400).json({
        error: 'Content-Type debe ser application/json'
      });
      return;
    }

    const payload = request.body as Payload;

    if (!payload || typeof payload !== 'object') {
      response.status(400).json({ error: 'Payload inválido' });
      return;
    }

    // --------------------
    // Validaciones críticas
    // --------------------
    if (!payload.client?.clientId) {
      response.status(400).json({
        error: 'client.clientId es requerido'
      });
      return;
    }

    const clientId = String(payload.client.clientId).trim();
    if (!clientId) {
      response.status(400).json({
        error: 'client.clientId inválido'
      });
      return;
    }

    const db = admin.firestore();
    const clientRef = db.collection('clients').doc(clientId);
    const now = admin.firestore.FieldValue.serverTimestamp();

    // --------------------
    // 1) CLIENTE (UPSERT idempotente)
    // --------------------
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(clientRef);

      const existing = snap.exists ? snap.data() : undefined;
      const createdAt =
        existing?.createdAt ??
        payload.client.createdAt ??
        admin.firestore.FieldValue.serverTimestamp();

      tx.set(
        clientRef,
        {
          ...payload.client,
          clientId,
          createdAt,
          updatedAt: now
        },
        { merge: true }
      );
    });

    // --------------------
    // 2) CONFIGURACIÓN DEFAULT
    // --------------------
    const defaultValue = payload.chatbot_config?.default?.value;
    if (typeof defaultValue === 'string' && defaultValue.trim()) {
      await clientRef
        .collection('chatbot_config')
        .doc('default')
        .set(
          {
            value: defaultValue,
            updatedAt: now
          },
          { merge: true }
        );
    }

    // --------------------
    // 3) FAQs / RESPUESTAS
    // --------------------
    if (Array.isArray(payload.chatbot_responses)) {
      for (const faq of payload.chatbot_responses) {
        if (!faq?.id || !faq?.question || !faq?.answer) continue;

        const faqId = String(faq.id).trim();
        if (!faqId) continue;

        await clientRef
          .collection('chatbot_responses')
          .doc(faqId)
          .set(
            {
              question: faq.question,
              answer: faq.answer,
              active: faq.active ?? true,
              order: faq.order ?? 0,
              updatedAt: now
            },
            { merge: true }
          );
      }
    }

    // --------------------
    // 4) CONFIGURACIÓN LLM
    // --------------------
    const llmToSave =
      payload.client.llm && Object.keys(payload.client.llm).length
        ? payload.client.llm
        : payload.llm && Object.keys(payload.llm).length
        ? payload.llm
        : null;

    if (llmToSave) {
      await clientRef.set(
        {
          llm: {
            ...llmToSave,
            updatedAt: now
          },
          updatedAt: now
        },
        { merge: true }
      );
    }

    // --------------------
    // 5) CONTEXTO PDF
    // --------------------
    if (payload.context?.pdf) {
      await clientRef
        .collection('context')
        .doc('pdf')
        .set(
          {
            ...payload.context.pdf,
            updatedAt: now
          },
          { merge: true }
        );
    }

    // --------------------
    // RESPUESTA OK
    // --------------------
    console.log(`[loadClientConfig] Configuración aplicada: ${clientId}`);

    response.status(200).json({
      status: 'ok',
      clientId,
      message: 'Configuración aplicada correctamente'
    });
  } catch (error: any) {
    console.error('[loadClientConfig]', error);

    response.status(500).json({
      error: 'Error cargando configuración del cliente',
      details: error?.message ?? String(error)
    });
  }
}
