// functions/src/services/llm.service.ts

import { env } from '../config/env';
import { LLMRequest, LLMVendor } from '../providers/llm.types';
import { OpenAIProvider } from '../providers/openai.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { DeepSeekProvider } from '../providers/deepseek.provider';

const providers: Record<LLMVendor, any> = {
  openai: new OpenAIProvider(env.llm.openaiKey),
  gemini: new GeminiProvider(env.llm.geminiKey),
  deepseek: new DeepSeekProvider(env.llm.deepseekKey)
};

export async function generateLLMResponse(
  vendor: LLMVendor,
  req: LLMRequest
): Promise<string> {
  const provider = providers[vendor];

  if (!provider) {
    throw new Error(`LLM provider no soportado: ${vendor}`);
  }

  return provider.generate(req);
}
