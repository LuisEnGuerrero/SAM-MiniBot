// functions/src/providers/deepseek.provider.ts

import OpenAI from 'openai';
import { LLMProvider, LLMRequest } from './llm.types';

export class DeepSeekProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://platform.deepseek.com/'
    });
  }

  async generate(req: LLMRequest): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: req.systemPrompt ?? ''
        },
        {
          role: 'user',
          content: req.context
            ? `${req.context}\n\n${req.message}`
            : req.message
        }
      ]
    });

    return (
      completion.choices[0]?.message?.content ??
      'No se pudo generar respuesta'
    );
  }
}
