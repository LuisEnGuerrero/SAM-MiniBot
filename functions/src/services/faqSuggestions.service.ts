// functions/src/services/faqSuggestions.service.ts
// VERSION: 1.1.1 — FAQ Suggestions (Safe, Read-Only, Index-Free)

import * as admin from 'firebase-admin';

/**
 * Obtiene sugerencias de preguntas FAQ activas
 * para un cliente específico.
 *
 * ✔ Read-only
 * ✔ Defensive
 * ✔ No requiere índices compuestos
 * ✔ Ordena en memoria
 *
 * @param clientId ID del cliente
 * @param limit Número máximo de preguntas a retornar
 */
export async function getFaqSuggestions(
  clientId: string,
  limit = 5
): Promise<string[]> {
  try {
    const db = admin.firestore();

    const snapshot = await db
      .collection('clients')
      .doc(clientId)
      .collection('chatbot_responses')
      .where('active', '==', true)
      .get();

    if (snapshot.empty) {
      return [];
    }

    // Normalizar, limpiar, ordenar y evitar duplicados
    const questions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          question: typeof data?.question === 'string'
            ? data.question.trim()
            : '',
          order: typeof data?.order === 'number'
            ? data.order
            : Number.MAX_SAFE_INTEGER
        };
      })
      .filter(item => item.question.length > 0)
      .sort((a, b) => a.order - b.order)
      .slice(0, limit)
      .map(item => item.question);

    return Array.from(new Set(questions));

  } catch (error) {
    console.error(
      `[faqSuggestions] Error obteniendo sugerencias para clientId=${clientId}`,
      error
    );

    // Falla silenciosa y segura
    return [];
  }
}
