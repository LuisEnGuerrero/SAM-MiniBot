// src/services/chatService.ts

import { ChatRequest, ChatResponse, MiniBotRuntimeConfig } from '../types';

declare global {
  interface Window {
    __SAM_MINIBOT_CONFIG__?: MiniBotRuntimeConfig;
  }
}

// --------------------------------------------------
// Runtime config (inyectable por widget o script)
// --------------------------------------------------

const runtimeConfig: MiniBotRuntimeConfig =
  window.__SAM_MINIBOT_CONFIG__ || {
    clientId: 'sam-minibot-prototipe'
  };

const CLIENT_ID = runtimeConfig.clientId;

// 🔴 CLAVE: en producción SIEMPRE usamos /chatbot
// Firebase Hosting hace el rewrite al Cloud Function
const CHAT_ENDPOINT = '/chatbot';

// --------------------------------------------------
// Servicio principal
// --------------------------------------------------

export const sendMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  try {
    const requestData: ChatRequest = {
      clientId: CLIENT_ID,
      message,
      sessionId: sessionId || generateSessionId(),
      channel: 'web'
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
      throw new Error(
        `[ChatService] Error ${response.status}: ${errorText}`
      );
    }

    return (await response.json()) as ChatResponse;

  } catch (error) {
    console.error('[ChatService] Error al enviar mensaje:', error);
    throw error;
  }
};

// --------------------------------------------------
// Utils
// --------------------------------------------------

const generateSessionId = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
