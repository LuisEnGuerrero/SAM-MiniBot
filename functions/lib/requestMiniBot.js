"use strict";
// functions/src/requestMiniBot.ts
// VERSION: 1.1.0 — MiniBot Request Handler (Aligned + Safe)
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
exports.requestMiniBot = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
// ------------------------------------
// Firestore helper
// ------------------------------------
function getDB() {
    return admin.firestore();
}
// ------------------------------------
// Mail transporter
// ------------------------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
// ------------------------------------
// Function
// ------------------------------------
exports.requestMiniBot = functions.https.onRequest(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Método no permitido' });
            return;
        }
        const { contact, config } = req.body || {};
        const db = getDB();
        // ------------------------------
        // Validaciones críticas
        // ------------------------------
        if (!contact?.name || !contact?.email) {
            res.status(400).json({
                error: 'Información de contacto incompleta'
            });
            return;
        }
        if (!config?.client?.clientId) {
            res.status(400).json({
                error: 'clientId es requerido'
            });
            return;
        }
        const clientId = config.client.clientId;
        // ------------------------------
        // Guardar solicitud (auditoría)
        // ------------------------------
        await db.collection('minibot_requests').add({
            contact,
            config,
            clientId,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // ------------------------------
        // Enviar correo
        // ------------------------------
        await transporter.sendMail({
            from: `"SAM MiniBot" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_TO || process.env.MAIL_USER,
            subject: `🆕 Nueva solicitud MiniBot – ${clientId}`,
            text: `
Nueva solicitud de MiniBot

CONTACTO
--------
Nombre: ${contact.name}
Correo: ${contact.email}
Empresa: ${contact.company || 'N/A'}
Sitio Web: ${contact.website || 'N/A'}

MENSAJE
-------
${contact.message || 'Sin mensaje adicional'}

CONFIGURACIÓN
-------------
ClientId: ${clientId}
Nombre del Bot: ${config.client.name || 'N/A'}
LLM activado: ${config.client.llm?.enabled ? 'Sí' : 'No'}

FAQs registradas: ${config.chatbot_responses?.length || 0}

Se adjunta la configuración completa en formato JSON.
        `,
            attachments: [
                {
                    filename: `${clientId}.json`,
                    content: JSON.stringify(config, null, 2),
                    contentType: 'application/json'
                }
            ]
        });
        // ------------------------------
        // Respuesta OK
        // ------------------------------
        res.status(200).json({
            status: 'ok',
            message: 'Solicitud enviada correctamente'
        });
        return;
    }
    catch (error) {
        console.error('[requestMiniBot]', error);
        res.status(500).json({
            error: 'Error procesando la solicitud'
        });
        return;
    }
});
//# sourceMappingURL=requestMiniBot.js.map