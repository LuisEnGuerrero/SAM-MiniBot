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
2. Despliega todo a Firebase: `firebase deploy`

## Resolución de Problemas Comunes

### Problema: "No se puede ver nada en la vista previa"

**Causas posibles y soluciones:**

1. **Estructura de carpetas incorrecta**: Asegúrate de que todos los archivos estén en las carpetas correctas según la estructura descrita.

2. **Dependencias no instaladas**: Ejecuta `npm install` tanto en la raíz del proyecto como en la carpeta `functions`.

3. **Configuración de Firebase incorrecta**: Verifica que el archivo `.firebaserc` contenga el ID correcto de tu proyecto de Firebase.

4. **URL de la función incorrecta**: Asegúrate de que la URL en `src/services/chatService.ts` coincida con tu ID de proyecto de Firebase.

5. **Emuladores no iniciados**: Asegúrate de que los emuladores de Firebase estén funcionando correctamente con `firebase emulators:start`.

6. **Datos no cargados en Firestore**: Verifica que hayas importado los datos iniciales en Firestore a través de la interfaz del emulador.

7. **Problemas con Tailwind CSS**: Si los estilos no se aplican correctamente, verifica que Tailwind CSS esté configurado correctamente y que las clases CSS se estén aplicando en los componentes.

8. **Errores en la consola del navegador**: Abre las herramientas de desarrollador de tu navegador y busca errores de JavaScript o de red que puedan estar impidiendo que la aplicación se cargue correctamente.

Si sigues estos pasos y verificas cada punto, deberías poder ver y ejecutar correctamente la aplicación del chatbot en tu entorno local.

---

### Nota de seguridad

Este proyecto utiliza react-scripts@5.0.1 (Create React App).
Algunas vulnerabilidades reportadas por npm audit provienen de dependencias internas de tooling (Babel, Webpack, ESLint, Workbox) que solo se ejecutan en tiempo de desarrollo o build, y no forman parte del bundle de producción.

Para este prototipo y prueba técnica se priorizó estabilidad y compatibilidad.
En un roadmap de producción se contempla migrar el frontend a Vite o Next.js para eliminar estas dependencias heredadas.
