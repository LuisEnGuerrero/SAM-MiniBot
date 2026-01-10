// src/types/index.ts

// =====================================================
// UI types
// =====================================================

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  meta?: {
    confidence?: number;
    source?: ResponseSource;
  };
}

// =====================================================
// API contract
// =====================================================

export interface ChatRequest {
  clientId: string;
  message: string;
  sessionId?: string;
  channel?: 'web' | 'widget' | 'api';
  locale?: string; // 'es', 'en', etc.
}

/**
 * 🔹 Fuente real de la respuesta
 * - faq      → coincidencia directa
 * - llm      → respuesta generada
 * - default  → fallback configurado por el cliente
 */
export type ResponseSource = 'faq' | 'llm' | 'default';

export interface ChatResponse {
  response: string;
  sessionId: string;

  confidence: number;
  source: ResponseSource;

  // backend devuelve ISO string (estable)
  timestamp: string;

  // FAQs sugeridas cuando source === 'default'
  suggestedFaqs?: string[];

  // opcional: trazabilidad futura del motor
  model?: string; // ej: 'gpt-4o-mini', 'gemini-1.5-flash'
}

// =====================================================
// SaaS runtime config (frontend)
// =====================================================

export interface MiniBotRuntimeConfig {
  clientId: string;
  apiBase?: string; // ej: https://tudominio.com
  mode?: 'faq' | 'hybrid' | 'llm';
}
