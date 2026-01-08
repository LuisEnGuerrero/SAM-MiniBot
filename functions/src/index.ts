import * as functions from 'firebase-functions';
import { chatbotHandler } from './chatbot';

// Configuración de CORS para permitir solicitudes desde nuestro frontend
const cors = require('cors')({
  origin: true // En producción, restringe esto a tu dominio: origin: ['https://tudominio.com']
});

// Exportamos la función como una Cloud Function
export const chatbot = functions.https.onRequest((request, response) => {
  // Aplicamos middleware de CORS
  cors(request, response, () => {
    // Solo permitimos métodos POST
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Método no permitido' });
    }
    
    // Llamamos al manejador del chatbot
    return chatbotHandler(request, response);
  });
});