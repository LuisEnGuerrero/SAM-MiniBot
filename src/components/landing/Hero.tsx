import React from 'react';

interface HeroProps {
  openChat: () => void;
}

const Hero: React.FC<HeroProps> = ({ openChat }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Asistente Conversacional
            <span className="block text-blue-200">Inteligente y Rápido</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-blue-100">
            Experimenta la nueva generación de asistencia automatizada. Construido con una arquitectura serverless para un rendimiento y escalabilidad inigualables.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <button
              onClick={openChat}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 shadow-lg"
            >
              Chatea ahora
            </button>
            <a href="#features" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-100 bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200">
              Saber más
            </a>
          </div>
        </div>
      </div>
      <div className="animate-bounce absolute bottom-5 left-1/2 transform -translate-x-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;