// Interfaz para los mensajes del chat
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Interfaz para la respuesta del servicio del chatbot
export interface ChatResponse {
  response: string;
  sessionId: string;
  confidence: number;
  matched: boolean;
  timestamp?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Interfaz para la solicitud al servicio del chatbot
export interface ChatRequest {
  message: string;
  sessionId?: string;
}