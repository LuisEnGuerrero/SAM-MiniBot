"use strict";
// functions/src/services/llm.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLLMResponse = generateLLMResponse;
const env_1 = require("../config/env");
const openai_provider_1 = require("../providers/openai.provider");
const gemini_provider_1 = require("../providers/gemini.provider");
const deepseek_provider_1 = require("../providers/deepseek.provider");
const providers = {
    openai: new openai_provider_1.OpenAIProvider(env_1.env.llm.openaiKey),
    gemini: new gemini_provider_1.GeminiProvider(env_1.env.llm.geminiKey),
    deepseek: new deepseek_provider_1.DeepSeekProvider(env_1.env.llm.deepseekKey)
};
async function generateLLMResponse(vendor, req) {
    const provider = providers[vendor];
    if (!provider) {
        throw new Error(`LLM provider no soportado: ${vendor}`);
    }
    return provider.generate(req);
}
//# sourceMappingURL=llm.service.js.map