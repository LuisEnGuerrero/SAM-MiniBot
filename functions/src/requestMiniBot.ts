// functions/src/requestMiniBot.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { Request, Response } from 'express';

export function getDB() {
  return admin.firestore();
};




// ------------------------------------
// Transporter (correo)
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

      const { contact, config } = req.body;
      const db = getDB();

      if (!contact?.email || !contact?.siteName) {
        res.status(400).json({
          error: 'Datos de contacto incompletos'
        });
        return;
      }

      // ------------------------------
      // Guardar solicitud en Firestore
      // ------------------------------
      await db.collection('minibot_requests').add({
        contact,
        config,
        status: 'pending',
        createdAt: new Date()
      });

      // ------------------------------
      // Enviar correo
      // ------------------------------
      await transporter.sendMail({
        from: `"SAM MiniBot" <${process.env.MAIL_USER}>`,
        to: 'luisenguerrero.cm@gmail.com',
        subject: `Solicito un MiniBot para mi Sitio Web ${contact.siteName}`,
        html: `
          <h2>📩 Nueva solicitud de MiniBot</h2>
          <p><strong>Sitio:</strong> ${contact.siteName}</p>
          <p><strong>Contacto:</strong> ${contact.name} (${contact.email})</p>
          <p><strong>Mensaje:</strong> ${contact.message ?? '—'}</p>
          <pre>${JSON.stringify(config, null, 2)}</pre>
        `
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
