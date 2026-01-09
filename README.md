# 🤖 SAM MiniBot — Plataforma Conversacional SaaS

**SAM MiniBot** es una plataforma conversacional **SaaS, multi-cliente y API-first**, diseñada para integrarse fácilmente en **cualquier sitio web o aplicación** mediante un **widget embebible** o consumo directo vía **API REST**.

El sistema permite a cada cliente:

* Tener su **propio bot aislado**
* Configurar **FAQs**, **respuestas por defecto**
* Integrar **LLMs (OpenAI, Gemini, DeepSeek)**
* Cargar **contexto documental (PDF)**
* Usar el bot **sin exponer la base de datos ni claves**

---

## 🧠 Principios de Diseño

* **Multi-tenant real** (aislamiento por `clientId`)
* **Serverless** (Firebase Cloud Functions)
* **API REST** desacoplada del frontend
* **Widget embebible universal**
* **Seguridad por diseño** (Firestore + Storage bloqueados)
* **Escalable y extensible**

---

## 🏗️ Arquitectura General

```
Cliente Web / App / Widget
        |
        | HTTP (POST /chatbot)
        v
Firebase Cloud Functions (API REST)
        |
        | Admin SDK
        v
Cloud Firestore (datos por cliente)
        |
        └── Contexto PDF / Configuración LLM
```

---

## 📦 Estructura del Proyecto

```text
sam-minibot/
│
|-- .firebaserc
|-- .nvmrc
|-- chat-test.json
|-- env.txt
|-- Estructura.md
|-- firebase.json
|-- firestore-debug.log
|-- firestore-seed.json
|-- firestore.indexes.json
|-- firestore.rules
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- test.json
+-- build
|   |-- asset-manifest.json
|   |-- favicon.ico
|   |-- favicon512.ico
|   |-- index.html
|   |-- manifest.json
|   |-- robots.txt
|   +-- static
|   |   +-- css
|   |   |   |-- main.5b6a362d.css
|   |   |   └-- main.5b6a362d.css.map
|   |   └-- js
|   |       |-- main.3fce5ed8.js
|   |       |-- main.3fce5ed8.js.LICENSE.txt
|   |       └-- main.3fce5ed8.js.map
+-- functions
|   |-- package.json
|   |-- tsconfig.json
|   +-- lib
|   |   |-- chatbot.js
|   |   |-- chatbot.js.map
|   |   |-- index.js
|   |   |-- index.js.map
|   |   |-- loadClientConfig.js
|   |   |-- loadClientConfig.js.map
|   |   |-- requestMiniBot.js
|   |   |-- requestMiniBot.js.map
|   |   +-- config
|   |   |   |-- env.js
|   |   |   └-- env.js.map
|   |   +-- providers
|   |   |   |-- deepseek.provider.js
|   |   |   |-- deepseek.provider.js.map
|   |   |   |-- gemini.provider.js
|   |   |   |-- gemini.provider.js.map
|   |   |   |-- llm.types.js
|   |   |   |-- llm.types.js.map
|   |   |   |-- openai.provider.js
|   |   |   └-- openai.provider.js.map
|   |   └-- services
|   |       |-- context.service.js
|   |       |-- context.service.js.map
|   |       |-- faq.service.js
|   |       |-- faq.service.js.map
|   |       |-- llm.service.js
|   |       └-- llm.service.js.map
|   +-- src
|   |   |-- chatbot.ts
|   |   |-- index.ts
|   |   |-- loadClientConfig.ts
|   |   |-- requestMiniBot.ts
|   |   +-- config
|   |   |   └-- env.ts
|   |   +-- providers
|   |   |   |-- deepseek.provider.ts
|   |   |   |-- gemini.provider.ts
|   |   |   |-- llm.types.ts
|   |   |   └-- openai.provider.ts
|   |   └-- services
|   |       |-- context.service.ts
|   |       |-- faq.service.ts
|   |       └-- llm.service.ts
+-- LoadData
|   |-- data-loader.prod.ps1
|   |-- load-client.js
|   |-- sam-minibot.initial.clean.json
|   └-- sam-minibot.initial.json
+-- public                     # Landing + widget hosteado
|   |-- favicon.ico
|   |-- favicon512.ico
|   |-- index.html
|   |-- manifest.json
|   |-- robots.txt
│   └── widget/                 # Widget embebible
|       |-- index.html
│       └── sam-minibot.js
+-- scripts
|   |-- load-gpt-config.prod.ps1
|   |-- load-gpt-config.ps1
|   |-- load-initial-client.prod.ps1
|   |-- load-initial-client.ps1
|   └-- set-firebase-config.ps1
+-- src
|   |-- App.css
|   |-- App.tsx
|   |-- firebase.ts
|   |-- index.css
|   |-- index.tsx
|   |-- setupTests.ts
|   +-- components
|   |   |-- ChatBot.tsx
|   |   |-- ChatInput.tsx
|   |   |-- ChatMessage.tsx
|   |   └-- landing
|   |       |-- Features.tsx
|   |       |-- Footer.tsx
|   |       |-- Hero.tsx
|   |       |-- HowItWorks.tsx
|   |       |-- MinibotForm.tsx
|   |       └-- TechStack.tsx
|   +-- services
|   |   └-- chatService.ts
|   └-- types
|       └-- index.ts
└── README.md
```

---

## 🔑 Modelo SaaS (Firestore)

```text
clients (collection)
 └── {clientId}
     ├── name
     ├── domain
     ├── active
     ├── llm
     │    ├── enabled
     │    ├── provider
     │    └── model
     │
     ├── chatbot_config
     │    └── default
     │         └── value
     │
     ├── chatbot_responses   ← FAQs
     │    └── {faqId}
     │
     ├── context
     │    └── pdf
     │
     └── chat_conversations
```

✔ Cada cliente está **aislado**
✔ No existe acceso directo desde frontend
✔ Solo Cloud Functions interactúan con Firestore

---

## 🔐 Seguridad

### Firestore Rules (bloqueo total al frontend)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules (PDFs protegidos)

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

👉 **El frontend nunca toca la base de datos**

---

## 🔌 API REST — Chatbot

### Endpoint

```http
POST /chatbot
```

### Body

```json
{
  "clientId": "sam-minibot-prototipe",
  "message": "Hola",
  "sessionId": "abc123",
  "channel": "web"
}
```

### Response

```json
{
  "response": "Hola, ¿en qué puedo ayudarte?",
  "source": "faq | llm | default",
  "confidence": 0.92,
  "timestamp": "2026-01-09T11:46:44.471Z"
}
```

✔ Funciona desde:

* Widget embebido
* Postman
* curl
* Apps móviles
* Backends externos

---

## 🧩 Widget Embebible (Uso por Clientes)

El cliente **solo debe copiar y pegar**:

```html
<script>
  window.__SAM_MINIBOT_CONFIG__ = {
    clientId: "sam-minibot-prototipe",
    apiBase: "https://mini-bot-7a21d.web.app",
    theme: {
      primaryColor: "#2563eb"
    },
    ui: {
      title: "Asistente SAM",
      welcomeMessage: "Hola 👋 ¿En qué puedo ayudarte?"
    }
  };
</script>

<script src="https://mini-bot-7a21d.web.app/widget/sam-minibot.js" async></script>
```

✔ No instala dependencias
✔ No expone claves
✔ No accede a Firestore
✔ 100% aislado por `clientId`

---

## ⚙️ Carga de Nuevos Clientes (Onboarding)

### Script automático

```bash
node LoadData/load-client.js
```

Este script:

* Lee un JSON de configuración
* Inserta cliente, FAQs, config, LLM y contexto
* Es **idempotente**
* No requiere exponer secretos al frontend

---

## 🚀 Deploy

```bash
npm run build
cd functions
npm run build
firebase deploy --only functions,hosting
```

---

## 📌 Estado del Proyecto

✔ API REST funcional
✔ Widget embebible operativo
✔ Multi-cliente validado
✔ Seguridad aplicada
✔ Listo para producción y escalado

---

## 🧭 Roadmap (opcional)

* Dashboard de clientes
* Gestión visual de FAQs
* Autenticación por dominio
* Analytics por cliente
* Webhooks
* Versionado de bots

---

## 📄 Licencia

MIT License — uso libre con atribución.

---
