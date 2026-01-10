// functions/src/services/faq.services.ts

import * as admin from 'firebase-admin';

// ------------------------------------
// Types
// ------------------------------------
interface FAQMatch {
  answer: string;
  confidence: number;
}

// ------------------------------------
// DB helper (local, seguro)
// ------------------------------------
function getDB() {
  return admin.firestore();
}

// ------------------------------------
// FAQ Resolver
// ------------------------------------
/**
 * Busca la mejor coincidencia FAQ por similitud textual.
 * Devuelve null si no hay coincidencias significativas.
 */
export async function resolveFAQ(
  clientId: string,
  message: string
): Promise<FAQMatch | null> {
  const db = getDB();

  const snapshot = await db
    .collection('clients')
    .doc(clientId)
    .collection('chatbot_responses')
    .where('active', '==', true)
    .get();

  if (snapshot.empty) return null;

  const normalizedMessage = normalize(message);

  let bestMatch: FAQMatch | null = null;

  // ✅ for...of evita el bug de "never" y permite break real
  for (const doc of snapshot.docs) {
    const data = doc.data() as { question?: string; answer?: string };

    if (!data.question || !data.answer) continue;

    const similarity = similarityScore(
      normalizedMessage,
      normalize(data.question)
    );

    if (!bestMatch || similarity > bestMatch.confidence) {
      bestMatch = {
        answer: data.answer,
        confidence: similarity
      };

      // Coincidencia perfecta → cortamos
      if (similarity === 1) break;
    }
  }

  // 🔒 Umbral mínimo de calidad (defensa adicional)
  if (bestMatch === null || bestMatch.confidence < 0.3) {
    return null;
  }

  return bestMatch;
}

// ------------------------------------
// Utils
// ------------------------------------
function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
}

function similarityScore(a: string, b: string): number {
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;

  if (longer.length === 0) return 1;

  return (longer.length - levenshtein(longer, shorter)) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from(
    { length: b.length + 1 },
    (_, i) => [i]
  );

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}
