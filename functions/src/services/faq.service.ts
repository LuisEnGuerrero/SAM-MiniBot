import * as admin from 'firebase-admin';

export function getDB() {
  return admin.firestore();
};



interface FAQMatch {
  answer: string;
  confidence: number;
}

/**
 * Busca una respuesta FAQ por similitud
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

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.question || !data.answer) return;

    const similarity = similarityScore(
      normalizedMessage,
      normalize(data.question)
    );

    if (!bestMatch || similarity > bestMatch.confidence) {
      bestMatch = {
        answer: data.answer,
        confidence: similarity
      };
    }
  });

  return bestMatch;
}

/* ---------------- utils ---------------- */

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
}

function similarityScore(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  return (longer.length - levenshtein(longer, shorter)) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

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
