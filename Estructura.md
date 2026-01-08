# ESTRUCTURA GENERAL SAM-MINIBOT

La estructura del proyecto `chatbot-prototype` está organizada de la siguiente manera:

´´´
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
´´´

## Descripción de Carpetas y Archivos Principales

- `chatbot-prototype/`: Carpeta raíz del proyecto que contiene todos los archivos y carpetas relacionados.
- `firestore-seed.json`: Archivo que contiene datos iniciales para poblar la base de datos Firestore.
- `README.md`: Documentación del proyecto, incluyendo instrucciones de configuración y uso.
- `.gitignore`: Archivo que especifica qué archivos y carpetas deben ser ignorados por Git.
- `.firebaserc`: Configuración del proyecto de Firebase, incluyendo los alias de proyecto.
- `public/`: Contiene los archivos estáticos que se sirven al usuario, incluyendo el archivo HTML principal y otros recursos como el favicon y el manifiesto de la aplicación.
- `src/`: Contiene el código fuente del frontend, organizado en componentes, servicios y tipos.
- `functions/`: Contiene el código fuente del backend, específicamente las Cloud Functions que manejan la lógica del chatbot y la comunicación con servicios externos.
- `firebase.json`: Configuración de Firebase, incluyendo hosting y funciones.
- `package.json`: Define las dependencias y scripts tanto para el proyecto raíz como para las funciones.
- `tailwind.config.js`: Configuración de Tailwind CSS para estilos personalizados.
Esta estructura modular facilita el desarrollo, mantenimiento y escalabilidad del proyecto `chatbot-prototype`.

---
