import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} SAM Mini Bot Assistant. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Prototipo funcional desarrollado por <a href="https://luisenguerrero.netlify.app" target="_blank" rel="noopener noreferrer"> Luis Enrique Guerrero.</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;