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
exports.getDB = getDB;
exports.resolveFAQ = resolveFAQ;
const admin = __importStar(require("firebase-admin"));
function getDB() {
    return admin.firestore();
}
;
/**
 * Busca una respuesta FAQ por similitud
 */
async function resolveFAQ(clientId, message) {
    const db = getDB();
    const snapshot = await db
        .collection('clients')
        .doc(clientId)
        .collection('chatbot_responses')
        .where('active', '==', true)
        .get();
    if (snapshot.empty)
        return null;
    const normalizedMessage = normalize(message);
    let bestMatch = null;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.question || !data.answer)
            return;
        const similarity = similarityScore(normalizedMessage, normalize(data.question));
        if (!bestMatch || similarity > bestMatch.confidence) {
            bestMatch = {
                answer: data.answer,
                confidence: similarity
            };
        }
    });
    return bestMatch;
}
/* ---------------- utils ---------------- */
function normalize(text) {
    return text.toLowerCase().trim().replace(/[^\w\s]/gi, '');
}
function similarityScore(a, b) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0)
        return 1;
    return (longer.length - levenshtein(longer, shorter)) / longer.length;
}
function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++)
        matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            matrix[i][j] =
                b[i - 1] === a[j - 1]
                    ? matrix[i - 1][j - 1]
                    : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[b.length][a.length];
}
//# sourceMappingURL=faq.service.js.map