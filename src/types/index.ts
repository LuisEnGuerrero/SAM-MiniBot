// src/types/index.ts

// ----------------------------
// UI types
// ----------------------------
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  meta?: {
    confidence?: number;
    matched?: boolean;
    source?: 'faq' | 'llm' | 'system';
  };
}

// ----------------------------
// API contract
// ----------------------------
export interface ChatRequest {
  clientId: string;
  message: string;
  sessionId?: string;
  // Futuro: metadata del canal / widget
  channel?: 'web' | 'widget' | 'api';
  locale?: string; // 'es', 'en', etc.
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  confidence: number;
  matched: boolean;

  // nuestro backend devuelve ISO string (estable)
  timestamp: string;

  // Futuro: trazabilidad del motor
  source?: 'faq' | 'llm';
  model?: string; // ej: 'gpt-4o-mini' / 'gemini-1.5-flash'
}

// ----------------------------
// SaaS runtime config (frontend)
// ----------------------------
export interface MiniBotRuntimeConfig {
  clientId: string;
  apiBase?: string; // ej: https://tudominio.com (si no es mismo origen)
  mode?: 'faq' | 'hybrid' | 'llm';
}
