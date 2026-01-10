// functions/src/requestMiniBot.ts
// VERSION: 1.1.0 — MiniBot Request Handler (Aligned + Safe)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { Request, Response } from 'express';

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
export const requestMiniBot = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
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

    } catch (error) {
      console.error('[requestMiniBot]', error);

      res.status(500).json({
        error: 'Error procesando la solicitud'
      });
      return;
    }
  }
);
