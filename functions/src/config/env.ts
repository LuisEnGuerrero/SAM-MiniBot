// functions/src/config/env.ts

import * as functions from 'firebase-functions';

/**
 * Configuración centralizada de variables de entorno
 * (Firebase Functions Config)
 */
const config = functions.config();

export const env = {
  llm: {
    openaiKey: config.llm?.openai_key ?? '',
    geminiKey: config.llm?.gemini_key ?? '',
    deepseekKey: config.llm?.deepseek_key ?? ''
  },

  mail: {
    user: config.mail?.user ?? '',
    pass: config.mail?.pass ?? ''
  },

  admin: {
    superSecret: config.admin?.super_secret ?? ''
  }
};
