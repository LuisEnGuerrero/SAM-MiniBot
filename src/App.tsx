import React, { useState } from 'react';
import ChatBot from './components/ChatBot.tsx';
import Hero from './components/landing/Hero.tsx';
import Features from './components/landing/Features.tsx';
import HowItWorks from './components/landing/HowItWorks.tsx';
import TechStack from './components/landing/TechStack.tsx';
import Footer from './components/landing/Footer.tsx';
import './App.css';

/**
 * Componente principal de la aplicación que orquesta la landing page y el chatbot.
 */
function App() {
  // Estado para controlar la visibilidad de la ventana de chat, ahora en el padre
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="App min-h-screen bg-gray-50 text-gray-800">
      {/* Sección Hero con la llamada a la acción principal */}
      <Hero openChat={() => setIsChatOpen(true)} />

      {/* Sección de Características */}
      <Features />

      {/* Sección de "Cómo Funciona" */}
      <HowItWorks />

      {/* Sección de Stack Tecnológico */}
      <TechStack />

      {/* Footer */}
      <Footer />

      {/* El componente Chatbot ahora recibe el estado y la función para controlarlo */}
      <ChatBot isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
    </div>
  );
}

export default App;