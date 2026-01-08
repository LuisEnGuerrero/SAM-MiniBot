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
exports.chatbot = void 0;
const functions = __importStar(require("firebase-functions"));
const chatbot_1 = require("./chatbot");
// Configuración de CORS para permitir solicitudes desde nuestro frontend
const cors = require('cors')({
    origin: true // En producción, restringe esto a tu dominio: origin: ['https://tudominio.com']
});
// Exportamos la función como una Cloud Function
exports.chatbot = functions.https.onRequest((request, response) => {
    // Aplicamos middleware de CORS
    cors(request, response, () => {
        // Solo permitimos métodos POST
        if (request.method !== 'POST') {
            return response.status(405).json({ error: 'Método no permitido' });
        }
        // Llamamos al manejador del chatbot
        return (0, chatbot_1.chatbotHandler)(request, response);
    });
});
//# sourceMappingURL=index.js.map