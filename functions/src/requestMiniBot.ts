// functions/src/requestMiniBot.ts
// VERSION: 1.3.0 — MiniBot Request Handler (SMTP Gmail + Audit + Safe)

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';

// ------------------------------------
// Firestore helper
// ------------------------------------
function getDB() {
  return admin.firestore();
}

// ------------------------------------
// Mail config (Firebase Runtime Config)
// ------------------------------------
function getMailUser(): string | undefined {
  return functions.config()?.mail?.user;
}

function getMailPass(): string | undefined {
  return functions.config()?.mail?.pass;
}

// ------------------------------------
// Function
// ------------------------------------
export const requestMiniBot = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
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

      const clientId: string = String(config.client.clientId);

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

      const jsonAttachment = Buffer.from(
        JSON.stringify(config, null, 2)
      );

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

    } catch (error: any) {
      console.error('[requestMiniBot] FATAL', error);

      res.status(500).json({
        error: 'Error procesando la solicitud'
      });
    }
  }
);
