"use strict";
// functions/src/providers/gemini.provider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    constructor(apiKey) {
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generate(req) {
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
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.provider.js.map