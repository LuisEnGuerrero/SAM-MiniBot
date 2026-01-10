"use strict";
// functions/src/chatbot.ts
// VERSION: 4.0.5 — Production Safe
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotHandler = chatbotHandler;
const admin = __importStar(require("firebase-admin"));
const faq_service_1 = require("./services/faq.service");
const context_service_1 = require("./services/context.service");
const llm_service_1 = require("./services/llm.service");
const faqSuggestions_service_1 = require("./services/faqSuggestions.service");
// --------------------
// Firebase DB helper
// --------------------
function getDB() {
    return admin.firestore();
}
// --------------------
// Helper: domain check (SAFE)
// --------------------
function normalizeDomain(value) {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value.map(v => String(v).replace(/^https?:\/\//, ''));
    }
    return [String(value).replace(/^https?:\/\//, '')];
}
function isDomainAllowed(origin, allowed) {
    // Allow Postman / curl
    if (!origin)
        return true;
    const cleanOrigin = origin.replace(/^https?:\/\//, '');
    const domains = normalizeDomain(allowed);
    // No restriction configured → allow
    if (domains.length === 0)
        return true;
    return domains.some(domain => cleanOrigin.includes(domain));
}
// --------------------
// Handler
// --------------------
async function chatbotHandler(request, response) {
    try {
        const { clientId, message, sessionId = 'default' } = request.body;
        if (!clientId || !message) {
            return response.status(400).json({
                error: 'clientId y message son requeridos'
            });
        }
        const db = getDB();
        const clientRef = db.collection('clients').doc(clientId);
        const clientSnap = await clientRef.get();
        if (!clientSnap.exists) {
            return response.status(404).json({
                error: 'Cliente no encontrado'
            });
        }
        const clientData = clientSnap.data() ?? {};
        // --------------------
        // Active check
        // --------------------
        if (clientData.active === false) {
            return response.status(403).json({
                error: 'Cliente inactivo'
            });
        }
        // --------------------
        // Domain guard
        // --------------------
        const origin = request.headers.origin;
        const SAAS_DOMAIN = 'mini-bot-7a21d.web.app';
        const cleanOrigin = origin?.replace(/^https?:\/\//, '');
        // 1️⃣ Permitir siempre llamadas desde el SaaS
        if (cleanOrigin?.includes(SAAS_DOMAIN)) {
            // allow
        }
        // 2️⃣ Validar dominios externos del cliente
        else if (!isDomainAllowed(origin, clientData.domain)) {
            return response.status(403).json({
                error: 'Dominio no autorizado'
            });
        }
        let responseText = '';
        let source = 'default';
        let confidence = 0;
        // --------------------
        // 1️⃣ FAQ
        // --------------------
        try {
            const faqResult = await (0, faq_service_1.resolveFAQ)(clientId, message);
            if (faqResult && faqResult.confidence >= 0.6) {
                responseText = faqResult.answer;
                confidence = faqResult.confidence;
                source = 'faq';
            }
        }
        catch (err) {
            console.warn('[FAQ] skipped:', err);
        }
        // --------------------
        // 2️⃣ LLM
        // --------------------
        if (source === 'default' &&
            clientData.llm?.enabled &&
            clientData.llm?.provider) {
            try {
                const context = await (0, context_service_1.getClientContext)(clientId);
                const llmAnswer = await (0, llm_service_1.generateLLMResponse)(clientData.llm.provider, {
                    message,
                    context: context ?? undefined,
                    systemPrompt: clientData.llm.systemPrompt
                });
                if (llmAnswer?.trim()) {
                    responseText = llmAnswer;
                    source = 'llm';
                    confidence = 1;
                }
            }
            catch (err) {
                console.warn('[LLM] fallback:', err);
            }
        }
        // --------------------
        // 3️⃣ Default
        // --------------------
        if (confidence === 0) {
            const defaultConfig = await clientRef
                .collection('chatbot_config')
                .doc('default')
                .get();
            responseText =
                defaultConfig.exists && defaultConfig.data()?.value
                    ? defaultConfig.data().value
                    : 'Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?';
        }
        // --------------------
        // Persist conversation
        // --------------------
        const now = new Date();
        await clientRef.collection('chat_conversations').add({
            sessionId,
            userMessage: message,
            botResponse: responseText,
            source,
            confidence,
            timestamp: now
        });
        // --------------------
        // FAQ suggestions (SAFE)
        // --------------------
        let suggestedFaqs = [];
        if (confidence === 0) {
            try {
                suggestedFaqs = await (0, faqSuggestions_service_1.getFaqSuggestions)(clientId, 5);
            }
            catch (err) {
                console.warn('[FAQ Suggestions] skipped:', err);
            }
        }
        // --------------------
        // Response
        // --------------------
        return response.status(200).json({
            response: responseText,
            sessionId,
            source,
            confidence,
            suggestedFaqs,
            timestamp: now.toISOString()
        });
    }
    catch (error) {
        console.error('[chatbot] FATAL ERROR:', error);
        return response.status(500).json({
            error: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
        });
    }
}
//# sourceMappingURL=chatbot.js.map