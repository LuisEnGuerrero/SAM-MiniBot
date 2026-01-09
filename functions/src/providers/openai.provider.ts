// functions/src/providers/openai.provider.ts

import OpenAI from 'openai';
import { LLMProvider, LLMRequest } from './llm.types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(req: LLMRequest): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            req.systemPrompt ??
            'Eres un asistente profesional, claro y orientado a ayudar.'
        },
        {
          role: 'user',
          content: req.context
            ? `${req.context}\n\nPregunta:\n${req.message}`
            : req.message
        }
      ]
    });

    return (
      completion.choices[0]?.message?.content ??
      'No fue posible generar respuesta.'
    );
  }
}
