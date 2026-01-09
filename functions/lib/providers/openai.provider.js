"use strict";
// functions/src/providers/openai.provider.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIProvider {
    constructor(apiKey) {
        this.client = new openai_1.default({ apiKey });
    }
    async generate(req) {
        const completion = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.4,
            messages: [
                {
                    role: 'system',
                    content: req.systemPrompt ??
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
        return (completion.choices[0]?.message?.content ??
            'No fue posible generar respuesta.');
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.provider.js.map