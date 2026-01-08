"use strict";
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
// Inicializamos el SDK de Admin si no está inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Función para calcular similitud entre dos cadenas
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0)
        return 1.0;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}
// Distancia de Levenshtein
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[str2.length][str1.length];
}
// Función principal del chatbot
async function chatbotHandler(request, response) {
    try {
        const { message, sessionId = 'default' } = request.body;
        if (!message) {
            return response.status(400).json({ error: 'El mensaje es requerido' });
        }
        // Normalizamos el mensaje
        const normalizedMessage = message
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/gi, '');
        // Obtenemos respuestas configuradas
        const responsesSnapshot = await db.collection('chatbot_responses').get();
        if (responsesSnapshot.empty) {
            return response.status(500).json({ error: 'No hay respuestas configuradas' });
        }
        // Buscamos la respuesta más similar
        let bestMatch = null;
        let highestSimilarity = 0;
        responsesSnapshot.forEach(doc => {
            const data = doc.data();
            // Protección ante documentos mal formados
            if (!data.question || !data.answer)
                return;
            const normalizedQuestion = data.question
                .toLowerCase()
                .trim()
                .replace(/[^\w\s]/gi, '');
            const similarity = calculateSimilarity(normalizedMessage, normalizedQuestion);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = {
                    question: data.question,
                    answer: data.answer
                };
            }
        });
        // Umbral de coincidencia
        const MATCH_THRESHOLD = 0.6;
        const isMatch = highestSimilarity >= MATCH_THRESHOLD && bestMatch !== null;
        // Respuesta por defecto
        const defaultResponseDoc = await db
            .collection('chatbot_config')
            .doc('default_response')
            .get();
        const defaultResponse = defaultResponseDoc.exists
            ? defaultResponseDoc.data()?.value
            : 'Lo siento, no entiendo tu pregunta.';
        // Respuesta final (segura)
        const responseText = isMatch
            ? bestMatch.answer
            : defaultResponse;
        const now = new Date();
        const chatResponse = {
            response: responseText,
            sessionId,
            confidence: Number(highestSimilarity.toFixed(2)),
            matched: isMatch,
            timestamp: now.toISOString()
        };
        // Guardamos conversación
        await db.collection('chat_conversations').add({
            sessionId,
            userMessage: message,
            botResponse: responseText,
            confidence: Number(highestSimilarity.toFixed(2)),
            matched: isMatch,
            timestamp: now
        });
        return response.status(200).json(chatResponse);
    }
    catch (error) {
        console.error('Error en el chatbot:', error);
        return response.status(500).json({ error: 'Error interno del servidor' });
    }
}
//# sourceMappingURL=chatbot.js.map