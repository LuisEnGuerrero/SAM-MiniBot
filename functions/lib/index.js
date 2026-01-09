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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMiniBot = exports.loadClientConfigFn = exports.chatbot = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const chatbot_1 = require("./chatbot");
const loadClientConfig_1 = require("./loadClientConfig");
const requestMiniBot_1 = require("./requestMiniBot");
Object.defineProperty(exports, "requestMiniBot", { enumerable: true, get: function () { return requestMiniBot_1.requestMiniBot; } });
admin.initializeApp();
// ==========================
// CORS (abierto por ahora)
// ==========================
const corsHandler = (0, cors_1.default)({ origin: true });
// ==========================
// CHATBOT (API pública)
// ==========================
exports.chatbot = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Método no permitido' });
            return;
        }
        (0, chatbot_1.chatbotHandler)(req, res);
    });
});
// ==========================
// LOAD CLIENT CONFIG (ADMIN)
// ==========================
const loadClientApp = (0, express_1.default)();
// 🔴 ESTO ES CRÍTICO
loadClientApp.use(express_1.default.json({ limit: '2mb' }));
// ❌ NO auth
// ❌ NO headers
// ❌ NO secrets
// ❌ NO OAuth
loadClientApp.post('/', loadClientConfig_1.loadClientConfig);
exports.loadClientConfigFn = functions.https.onRequest(loadClientApp);
//# sourceMappingURL=index.js.map