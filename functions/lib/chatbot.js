"use strict";
// functions/src/chatbot.ts
// VERSION: 4.0.0 — SaaS + Domain Guard + FAQ + PDF + Multi-LLM
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
exports.getDB = getDB;
exports.chatbotHandler = chatbotHandler;
const admin = __importStar(require("firebase-admin"));
const faq_service_1 = require("./services/faq.service");
const context_service_1 = require("./services/context.service");
const llm_service_1 = require("./services/llm.service");
// --------------------
// Init Firebase Admin
// --------------------
function getDB() {
    return admin.firestore();
}
// --------------------
// Helper: domain check
// --------------------
function isDomainAllowed(origin, allowed) {
    // Allow non-browser tools (Postman, curl, backend)
    if (!origin)
        return true;
    if (!allowed)
        return false;
    const domains = Array.isArray(allowed) ? allowed : [allowed];
    return domains.some(domain => origin.includes(domain));
}
// --------------------
// Handler
// --------------------
async function chatbotHandler(request, response) {
    try {
        const { clientId, message, sessionId = 'default' } = request.body;
        // --------------------
        // Validations
        // --------------------
        if (!clientId) {
            return response.status(400).json({ error: 'clientId es requerido' });
        }
        if (!message) {
            return response.status(400).json({ error: 'El mensaje es requerido' });
        }
        const db = getDB();
        const clientRef = db.collection('clients').doc(clientId);
        const clientSnap = await clientRef.get();
        if (!clientSnap.exists) {
            return response.status(404).json({
                error: 'Cliente no encontrado'
            });
        }
        const clientData = clientSnap.data();
        // --------------------
        // 🔒 Active check
        // --------------------
        if (clientData.active === false) {
            return response.status(403).json({
                error: 'Cliente inactivo'
            });
        }
        // --------------------
        // 🔒 Domain validation
        // --------------------
        const origin = request.headers.origin;
        const domainAllowed = isDomainAllowed(origin, clientData.domain);
        if (!domainAllowed) {
            return response.status(403).json({
                error: 'Dominio no autorizado'
            });
        }
        let responseText;
        let source;
        let confidence = 0;
        // --------------------
        // 1️⃣ FAQ
        // --------------------
        const faqResult = await (0, faq_service_1.resolveFAQ)(clientId, message);
        if (faqResult && faqResult.confidence >= 0.6) {
            responseText = faqResult.answer;
            confidence = faqResult.confidence;
            source = 'faq';
        }
        // --------------------
        // 2️⃣ LLM
        // --------------------
        else if (clientData.llm?.enabled && clientData.llm.provider) {
            const context = await (0, context_service_1.getClientContext)(clientId);
            const llmAnswer = await (0, llm_service_1.generateLLMResponse)(clientData.llm.provider, {
                message,
                context: context ?? undefined,
                systemPrompt: clientData.llm.systemPrompt
            });
            responseText = llmAnswer;
            source = 'llm';
            confidence = 1;
        }
        // --------------------
        // 3️⃣ Default
        // --------------------
        else {
            const defaultConfig = await clientRef
                .collection('chatbot_config')
                .doc('default')
                .get();
            responseText =
                defaultConfig.exists && defaultConfig.data()?.value
                    ? defaultConfig.data().value
                    : 'Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?';
            source = 'default';
            confidence = 0;
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
        // Response
        // --------------------
        return response.status(200).json({
            response: responseText,
            sessionId,
            source,
            confidence,
            timestamp: now.toISOString()
        });
    }
    catch (error) {
        console.error('[chatbot] Error:', error);
        return response.status(500).json({
            error: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
        });
    }
}
//# sourceMappingURL=chatbot.js.map