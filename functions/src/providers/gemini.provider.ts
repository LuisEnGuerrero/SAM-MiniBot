// functions/src/providers/gemini.provider.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMRequest } from './llm.types';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(req: LLMRequest): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
${req.systemPrompt ?? ''}

${req.context ?? ''}

Pregunta:
${req.message}
    `.trim();

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
