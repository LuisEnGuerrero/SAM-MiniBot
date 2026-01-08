import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      name: 'Arquitectura Serverless',
      description: 'Cero infraestructura que gestionar. Escala automáticamente para miles de usuarios sin esfuerzo.',
      icon: '⚡️',
    },
    {
      name: 'Respuestas en < 5s',
      description: 'Optimizado para la velocidad. Procesamiento de consultas y respuestas casi instantáneas.',
      icon: '🚀',
    },
    {
      name: 'Seguro y Fiable',
      description: 'Comunicación segura mediante HTTP y las mejores prácticas de Firebase para proteger tus datos.',
      icon: '🔒',
    },
    {
      name: 'Lógica Propia',
      description: 'Sin dependencias de plataformas de terceros. Construido desde cero para máxima flexibilidad.',
      icon: '🧠',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Características Principales
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Una solución robusta diseñada para ofrecer la mejor experiencia conversacional.
          </p>
        </div>
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto text-3xl">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;