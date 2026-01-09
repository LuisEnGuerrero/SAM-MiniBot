# Arquitectura Completa del Proyecto: Mini Bot Conversacional

## Arquitectura General

El proyecto sigue una arquitectura serverless con los siguientes componentes:

1. **Frontend**: Aplicación de una sola página (SPA) construida con React y TypeScript
2. **Backend**: Firebase Cloud Functions que actúan como servicio web tipo REST
3. **Base de Datos**: Cloud Firestore para persistir preguntas y respuestas
4. **Hosting**: Firebase Hosting para servir la aplicación estática

## Estructura Completa del Proyecto

La estructura del proyecto `chatbot-prototype` está organizada de la siguiente manera:

```batch

chatbot-prototype/
├── .firebaserc                    # Configuración del proyecto de Firebase
├── .gitignore                     # Archivos a ignorar en Git
├── firebase.json                  # Configuración de Firebase (hosting, funciones, rewrites)
├── package.json                   # Dependencias y scripts del proyecto raíz
├── README.md                      # Documentación del proyecto
├── firestore-seed.json            # Datos iniciales para Firestore
├── public/                        # Archivos estáticos del frontend
│   ├── index.html                 # Plantilla HTML principal
│   ├── favicon.ico                # Icono de la aplicación
│   ├── manifest.json              # Manifiesto de la aplicación
│   └── robots.txt                 # Instrucciones para motores de búsqueda
├── src/                           # Código fuente del frontend
│   ├── components/                # Componentes de React
│   │   ├── landing/               # Componentes de la landing page
│   │   │   ├── Features.tsx       # Sección de características
│   │   │   ├── Footer.tsx         # Pie de página
│   │   │   ├── Hero.tsx           # Sección principal
│   │   │   ├── HowItWorks.tsx     # Sección de cómo funciona
│   │   │   └── TechStack.tsx      # Sección de tecnología
│   │   ├── ChatBot.tsx            # Componente principal del chatbot
│   │   ├── ChatInput.tsx          # Componente de entrada de mensajes
│   │   └── ChatMessage.tsx        # Componente de mensajes del chat
│   ├── services/                  # Servicios de API
│   │   └── chatService.ts         # Servicio para comunicarse con el backend
│   ├── types/                     # Definiciones de tipos TypeScript
│   │   └── index.ts               # Tipos compartidos
│   ├── App.tsx                    # Componente principal de la aplicación
│   ├── App.css                    # Estilos globales
│   ├── index.css                  # Estilos base
│   ├── index.tsx                  # Punto de entrada de la aplicación
│   └── setupTests.ts              # Configuración de pruebas
├── functions/                     # Código fuente del backend (Cloud Functions)
│   ├── .env.local                 # Variables de entorno locales (no en Git)
│   ├── node_modules/              # Dependencias del backend
│   ├── package.json               # Dependencias del backend
│   ├── tsconfig.json              # Configuración de TypeScript para el backend
│   └── src/                       # Código fuente del backend
│       ├── chatbot.ts             # Lógica del chatbot
│       └── index.ts               # Punto de entrada de las Cloud Functions
└── tailwind.config.js             # Configuración de Tailwind CSS
```

## Instrucciones de Configuración y Ejecución

### 1. Configuración Inicial

1. Crea un nuevo proyecto en la [Consola de Firebase](https://console.firebase.google.com/).
2. Instala la CLI de Firebase: `npm install -g firebase-tools`
3. Autentícate con Firebase: `firebase login`
4. Crea la estructura de carpetas como se describe arriba.
5. Inicializa el proyecto de Firebase: `firebase init`
   - Selecciona tu proyecto existente
   - Habilita Functions y Hosting
   - Configura TypeScript para Functions
   - Establece `public` como directorio público
   - Configura como SPA (Single Page Application)

### 2. Configuración del Backend

1. Navega a la carpeta `functions`: `cd functions`
2. Instala las dependencias: `npm install`
3. Vuelve a la raíz del proyecto: `cd ..`

### 3. Configuración del Frontend

1. Instala las dependencias del frontend: `npm install`
2. Actualiza el archivo `src/services/chatService.ts` con tu ID de proyecto de Firebase en la URL de desarrollo:

   ```typescript
   const CLOUD_FUNCTION_URL = isDevelopment 
     ? 'http://localhost:5001/tu-proyecto-id/us-central1/chatbot' // Reemplaza 'tu-proyecto-id'
     : '/chatbot';
   ```

### 4. Ejecución Local

1. Inicia los emuladores de Firebase: `firebase emulators:start`
2. En otra terminal, inicia el servidor de desarrollo de React: `npm start`
3. Abre la interfaz de usuario del emulador (normalmente en `http://localhost:4000`)
4. Navega a la sección de Firestore y usa la función "Importar" para cargar el archivo `firestore-seed.json`
5. Abre tu navegador en `http://localhost:3000` para ver la aplicación

### 5. Despliegue a Producción

1. Construye la aplicación de React: `npm run build`
2. Construye las Functions tras `cd functions` corre: `npm run build`
3. Habilita temporalmente los comandos legacy en firebase desde la raíz del proyecto: `firebase experiments:enable legacyRuntimeConfigCommands` (Opción que será deprecada en 2026)
4. Lanza el Script para cargar las variables de entorno alojadas en .env: `.\scripts\set-firebase-config.ps1` (ver env.txt de ejemplo)
5. Despliega las Functions: `firebase deploy --only functions`
6. 

## Estructura Firestore

---

### Para un producto SaaS sólido

´´´bash
clients (collection)
 └── {clientId} (document)
     ├── name: string
     ├── domain: string
     ├── active: boolean
     ├── createdAt: timestamp
     ├── llm: {
     │     enabled: boolean
     │     provider: 'openai' | 'gemini' | 'deepseek'
     │     model: string
     │   }
     │
     ├── chatbot_config (subcollection)
     │    └── default (document)
     │         └── value: string
     │
     ├── chatbot_responses (subcollection)   ← FAQs
     │    └── {faqId}
     │         ├── question: string
     │         ├── answer: string
     │         ├── active: boolean
     │         └── order: number
     │
     ├── context (subcollection)
     │    └── pdf (document)
     │         ├── enabled: boolean
     │         ├── source: 'pdf' | 'text'
     │         ├── content: string   ← texto plano extraído
     │         └── updatedAt: timestamp
     │
     └── chat_conversations (subcollection)
          └── {conversationId}
               ├── sessionId: string
               ├── userMessage: string
               ├── botResponse: string
               ├── source: 'faq' | 'default' | 'llm'
               ├── confidence: number
               └── timestamp: timestamp

´´´

---

## SEGURIDAD

### REGLAS DE ACCESO FIRESTORE Y FIREBASE BUCKET

Las siguientes reglas de seguridad de Firestore aseguran que ningún cliente pueda leer o escribir datos directamente en la base de datos. Tampoco el Frontend puede hacerlo solo las Firebase Functions con la dirección del Backend.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ===============================
    // CLIENTES (núcleo SaaS)
    // ===============================
    match /clients/{clientId} {

      // 🔴 El frontend NO puede leer ni escribir clientes
      allow read, write: if false;

      // -------------------------------
      // Subcolecciones internas
      // -------------------------------
      match /{subcollection=**}/{docId} {
        // 🔴 Todo acceso directo bloqueado
        allow read, write: if false;
      }
    }

    // -------------------------------
    // Fallback: bloquear todo lo demás
    // -------------------------------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

```

### Storage de almacenamiento para PDF de contexto para GPTs

Las siguientes reglas de seguridad de Firebase Storage aseguran que ningún cliente pueda leer o escribir archivos directamente en el bucket de almacenamiento. Solo las Firebase Functions pueden hacerlo.

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // ===============================
    // PDFs y assets por cliente
    // ===============================
    match /clients/{clientId}/{allPaths=**} {

      // ❌ El frontend no puede leer ni escribir
      allow read, write: if false;
    }

    // -------------------------------
    // Bloquear todo lo demás
    // -------------------------------
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}

```

### Nota de seguridad

Este proyecto utiliza react-scripts@5.0.1 (Create React App).
Algunas vulnerabilidades reportadas por npm audit provienen de dependencias internas de tooling (Babel, Webpack, ESLint, Workbox) que solo se ejecutan en tiempo de desarrollo o build, y no forman parte del bundle de producción.

Para este prototipo y prueba técnica se priorizó estabilidad y compatibilidad.
En un roadmap de producción se contempla migrar el frontend a Vite o Next.js para eliminar estas dependencias heredadas.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
