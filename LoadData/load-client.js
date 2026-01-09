/**
 * LoadData/load-client.js
 * ---------------------------------------
 * Carga la configuración inicial de un cliente
 * en SAM MiniBot (producción).
 *
 * ✔ NO usa OAuth
 * ✔ NO usa service-account
 * ✔ NO usa secrets
 * ✔ Funciona igual que curl
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// =====================================================
// CONFIG
// =====================================================
const FUNCTION_URL =
  'https://us-central1-mini-bot-7a21d.cloudfunctions.net/loadClientConfigFn';

const JSON_PATH = path.resolve(__dirname, 'sam-minibot.initial.json');

// =====================================================
// MAIN
// =====================================================
async function main() {
  console.log('\n🚀 Cargando configuración del cliente MiniBot...\n');

  if (!fs.existsSync(JSON_PATH)) {
    console.error('❌ No se encuentra el archivo JSON:', JSON_PATH);
    process.exit(1);
  }

  const jsonBody = fs.readFileSync(JSON_PATH, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(jsonBody);
  } catch {
    console.error('❌ JSON inválido');
    process.exit(1);
  }

  if (!parsed.client?.clientId) {
    console.error('❌ Falta client.clientId');
    process.exit(1);
  }

  console.log(`📦 Cliente: ${parsed.client.clientId}`);
  console.log('📨 Enviando configuración...\n');

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonBody
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}`);
    console.error(text);
    process.exit(1);
  }

  console.log('✅ Configuración cargada correctamente:\n');
  console.log(text);
}

main().catch(err => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});
