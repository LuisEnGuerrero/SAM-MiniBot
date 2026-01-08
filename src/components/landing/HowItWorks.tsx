import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    { name: 'Escribe tu pregunta', description: 'Usa el chat para hacer lo que necesites.', icon: '💬' },
    { name: 'Procesamiento Inteligente', description: 'Nuestro backend analiza tu consulta en tiempo real.', icon: '⚙️' },
    { name: 'Recibe una Respuesta', description: 'Obtén la respuesta precisa y rápida en segundos.', icon: '✅' },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ¿Cómo Funciona?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Un proceso simple en tres pasos para obtener la información que buscas.
          </p>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div key={step.name} className="text-center lg:mt-0">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-indigo-500 text-white mx-auto text-4xl shadow-lg">
                  {step.icon}
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900">
                  {`Paso ${index + 1}: ${step.name}`}
                </h3>
                <p className="mt-4 text-base text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;