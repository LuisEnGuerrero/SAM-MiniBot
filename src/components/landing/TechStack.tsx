import React from 'react';

const TechStack: React.FC = () => {
  const tech = [
    { name: 'React', description: 'Una librería para construir interfaces de usuario.' },
    { name: 'TypeScript', description: 'JavaScript con tipado estático para un código más robusto.' },
    { name: 'Firebase', description: 'Plataforma para desarrollar apps web y móviles de alta calidad.' },
    { name: 'Tailwind CSS', description: 'Framework de CSS para crear diseños a medida rápidamente.' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Potenciado por Tecnología de Punta
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Construido con un stack moderno y eficiente para garantizar el mejor rendimiento.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {tech.map((t) => (
            <div key={t.name} className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <span className="text-white font-bold text-lg">{t.name.charAt(0)}</span>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{t.name}</h3>
                  <p className="mt-5 text-base text-gray-500">{t.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;