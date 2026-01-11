"use strict";
// functions/src/requestMiniBot.ts
// VERSION: 1.3.0 — MiniBot Request Handler (SMTP Gmail + Audit + Safe)
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
// Mail config (Firebase Runtime Config)
// ------------------------------------
function getMailUser() {
    return functions.config()?.mail?.user;
}
function getMailPass() {
    return functions.config()?.mail?.pass;
}
// ------------------------------------
// Function
// ------------------------------------
exports.requestMiniBot = functions.https.onRequest(async (req, res) => {
    // CORS básico
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método no permitido' });
        return;
    }
    const db = getDB();
    const now = admin.firestore.FieldValue.serverTimestamp();
    try {
        const { contact, config } = req.body || {};
        // ------------------------------
        // Validaciones
        // ------------------------------
        if (!contact?.name || !contact?.email) {
            res.status(400).json({ error: 'Información de contacto incompleta' });
            return;
        }
        if (!config?.client?.clientId) {
            res.status(400).json({ error: 'clientId es requerido' });
            return;
        }
        const clientId = String(config.client.clientId);
        // ------------------------------
        // Auditoría en Firestore
        // ------------------------------
        const reqRef = await db.collection('minibot_requests').add({
            contact,
            config,
            clientId,
            status: 'pending',
            createdAt: now,
            updatedAt: now
        });
        // ------------------------------
        // Config SMTP
        // ------------------------------
        const mailUser = getMailUser();
        const mailPass = getMailPass();
        if (!mailUser || !mailPass) {
            await reqRef.update({
                status: 'email_failed',
                error: 'Missing SMTP credentials',
                updatedAt: now
            });
            res.status(500).json({
                error: 'Falta configuración de correo SMTP'
            });
            return;
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: mailUser,
                pass: mailPass
            }
        });
        // ------------------------------
        // Construir correo
        // ------------------------------
        const subject = `🆕 Nueva solicitud MiniBot – ${clientId}`;
        const html = `
        <h3>Nueva solicitud MiniBot</h3>
        <p><strong>Nombre:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Empresa:</strong> ${contact.company || 'N/A'}</p>
        <p><strong>Sitio Web:</strong> ${contact.website || 'N/A'}</p>

        <h4>Mensaje</h4>
        <p>${contact.message || 'Sin mensaje adicional'}</p>

        <hr />

        <p><strong>ClientId:</strong> ${clientId}</p>
        <p><strong>Bot:</strong> ${config.client.name || 'N/A'}</p>
        <p><strong>LLM activo:</strong> ${config.client.llm?.enabled ? 'Sí' : 'No'}</p>
        <p><strong>FAQs registradas:</strong> ${config.chatbot_responses?.length || 0}</p>
      `;
        const jsonAttachment = Buffer.from(JSON.stringify(config, null, 2));
        // ------------------------------
        // Enviar correo
        // ------------------------------
        await transporter.sendMail({
            from: `"SAM MiniBot" <${mailUser}>`,
            to: mailUser, // puedes cambiarlo luego si quieres
            subject,
            html,
            attachments: [
                {
                    filename: `${clientId}.json`,
                    content: jsonAttachment,
                    contentType: 'application/json'
                }
            ]
        });
        await reqRef.update({
            status: 'sent',
            updatedAt: now
        });
        res.status(200).json({
            status: 'ok',
            message: 'Solicitud enviada correctamente'
        });
    }
    catch (error) {
        console.error('[requestMiniBot] FATAL', error);
        res.status(500).json({
            error: 'Error procesando la solicitud'
        });
    }
});
//# sourceMappingURL=requestMiniBot.js.map