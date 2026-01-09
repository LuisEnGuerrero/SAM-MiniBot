import * as admin from 'firebase-admin';

export function getDB() {
  return admin.firestore();
};



/**
 * Obtiene el contexto base del cliente desde PDF procesado
 * (texto plano previamente almacenado)
 */
export async function getClientContext(
  clientId: string
): Promise<string | null> {
  const db = getDB();
  const doc = await db
    .collection('clients')
    .doc(clientId)
    .collection('context')
    .doc('pdf')
    .get();

  if (!doc.exists) return null;

  const data = doc.data();
  return data?.text || null;
}
