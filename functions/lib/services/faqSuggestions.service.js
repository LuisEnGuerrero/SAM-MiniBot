"use strict";
// functions/src/services/faqSuggestions.service.ts
// VERSION: 1.1.1 — FAQ Suggestions (Safe, Read-Only, Index-Free)
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
exports.getFaqSuggestions = getFaqSuggestions;
const admin = __importStar(require("firebase-admin"));
/**
 * Obtiene sugerencias de preguntas FAQ activas
 * para un cliente específico.
 *
 * ✔ Read-only
 * ✔ Defensive
 * ✔ No requiere índices compuestos
 * ✔ Ordena en memoria
 *
 * @param clientId ID del cliente
 * @param limit Número máximo de preguntas a retornar
 */
async function getFaqSuggestions(clientId, limit = 5) {
    try {
        const db = admin.firestore();
        const snapshot = await db
            .collection('clients')
            .doc(clientId)
            .collection('chatbot_responses')
            .where('active', '==', true)
            .get();
        if (snapshot.empty) {
            return [];
        }
        // Normalizar, limpiar, ordenar y evitar duplicados
        const questions = snapshot.docs
            .map(doc => {
            const data = doc.data();
            return {
                question: typeof data?.question === 'string'
                    ? data.question.trim()
                    : '',
                order: typeof data?.order === 'number'
                    ? data.order
                    : Number.MAX_SAFE_INTEGER
            };
        })
            .filter(item => item.question.length > 0)
            .sort((a, b) => a.order - b.order)
            .slice(0, limit)
            .map(item => item.question);
        return Array.from(new Set(questions));
    }
    catch (error) {
        console.error(`[faqSuggestions] Error obteniendo sugerencias para clientId=${clientId}`, error);
        // Falla silenciosa y segura
        return [];
    }
}
//# sourceMappingURL=faqSuggestions.service.js.map