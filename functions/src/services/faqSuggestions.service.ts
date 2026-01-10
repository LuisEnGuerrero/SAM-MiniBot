// functions/src/services/faqSuggestions.service.ts
// VERSION: 1.0.0 — FAQ Suggestions (Safe & Read-Only)

import * as admin from 'firebase-admin';

/**
 * Obtiene sugerencias de preguntas FAQ activas
 * para un cliente específico.
 *
 * @param clientId ID del cliente
 * @param limit Número máximo de preguntas a retornar
 */
export async function getFaqSuggestions(
  clientId: string,
  limit = 5
): Promise<string[]> {
  const db = admin.firestore();

  const snapshot = await db
    .collection('clients')
    .doc(clientId)
    .collection('chatbot_responses')
    .where('active', '==', true)
    .orderBy('order', 'asc')
    .limit(limit)
    .get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs
    .map(doc => doc.data()?.question)
    .filter((q): q is string => typeof q === 'string' && q.trim().length > 0);
}
