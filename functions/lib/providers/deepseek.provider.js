"use strict";
// functions/src/providers/deepseek.provider.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class DeepSeekProvider {
    constructor(apiKey) {
        this.client = new openai_1.default({
            apiKey,
            baseURL: 'https://platform.deepseek.com/'
        });
    }
    async generate(req) {
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
        return (completion.choices[0]?.message?.content ??
            'No se pudo generar respuesta');
    }
}
exports.DeepSeekProvider = DeepSeekProvider;
//# sourceMappingURL=deepseek.provider.js.map