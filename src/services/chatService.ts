import { ChatRequest, ChatResponse } from '../types';

// Base de la API:
// - En local/emulador: definida por variable de entorno
// - En producción: usamos rewrite de Firebase Hosting (/chatbot)
const API_BASE = process.env.REACT_APP_API_BASE;
const CHAT_ENDPOINT = API_BASE ? `${API_BASE}/chatbot` : '/chatbot';

/**
 * Envía un mensaje al bot y obtiene una respuesta
 * @param message Mensaje del usuario
 * @param sessionId ID de sesión para mantener contexto (opcional)
 * @returns Respuesta del bot
 */
export const sendMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  try {
    const requestData: ChatRequest = {
      message,
      sessionId: sessionId || generateSessionId()
    };

    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as ChatResponse;
    return data;

  } catch (error) {
    console.error('[ChatService] Error al enviar mensaje:', error);
    throw error;
  }
};

/**
 * Genera un ID de sesión aleatorio
 * @returns ID de sesión
 */
const generateSessionId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
