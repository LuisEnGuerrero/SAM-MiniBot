import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

import { chatbotHandler } from './chatbot';
import { loadClientConfig } from './loadClientConfig';
import { requestMiniBot } from './requestMiniBot';

admin.initializeApp();

// ==========================
// CORS (abierto por ahora)
// ==========================
const corsHandler = cors({ origin: true });

// ==========================
// CHATBOT (API pública)
// ==========================
export const chatbot = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método no permitido' });
      return;
    }
    chatbotHandler(req, res);
  });
});

// ==========================
// LOAD CLIENT CONFIG (ADMIN)
// ==========================
const loadClientApp = express();

// 🔴 ESTO ES CRÍTICO
loadClientApp.use(express.json({ limit: '2mb' }));

// ❌ NO auth
// ❌ NO headers
// ❌ NO secrets
// ❌ NO OAuth
loadClientApp.post('/', loadClientConfig);

export const loadClientConfigFn = functions.https.onRequest(loadClientApp);

// ==========================
// MINI BOT
// ==========================
export { requestMiniBot };
