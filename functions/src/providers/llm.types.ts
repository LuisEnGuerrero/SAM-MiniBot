// functions/src/providers/llm.types.ts

export type LLMVendor = 'openai' | 'gemini' | 'deepseek';

export interface LLMRequest {
  message: string;
  systemPrompt?: string;
  context?: string;
}

export interface LLMProvider {
  generate(req: LLMRequest): Promise<string>;
}
