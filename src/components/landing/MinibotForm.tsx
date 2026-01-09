import React, { useState } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const MinibotForm: React.FC = () => {
  // --------------------
  // Estado para mostrar/ocultar formulario
  // --------------------
  const [showForm, setShowForm] = useState(false);

  // --------------------
  // Datos de contacto
  // --------------------
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');

  // --------------------
  // Configuración del bot
  // --------------------
  const [clientId, setClientId] = useState('');
  const [botName, setBotName] = useState('');
  const [defaultResponse, setDefaultResponse] = useState(
    'Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?'
  );

  const [useGPT, setUseGPT] = useState(false);

  const [faqs, setFaqs] = useState<FAQ[]>([
    { id: 'faq_01', question: '', answer: '' }
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // --------------------
  // Handlers
  // --------------------
  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        id: `faq_${String(faqs.length + 1).padStart(2, '0')}`,
        question: '',
        answer: ''
      }
    ]);
  };

  const updateFAQ = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      contact: {
        name: contactName,
        email: contactEmail,
        company,
        website,
        message
      },
      config: {
        client: {
          clientId,
          name: botName,
          domain: website,
          active: true,
          llm: {
            enabled: useGPT
          }
        },
        chatbot_config: {
          default: {
            value: defaultResponse
          }
        },
        chatbot_responses: faqs
          .filter(f => f.question && f.answer)
          .map((f, index) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            active: true,
            order: index + 1
          }))
      }
    };

    try {
      await fetch('/requestMiniBot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error enviando solicitud', error);
      alert('Ocurrió un error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // UI
  // --------------------
  if (submitted) {
    return (
      <section className="bg-white py-16 px-6 max-w-3xl mx-auto rounded-xl shadow-md mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">¡Solicitud enviada! 🎉</h2>
        <p className="text-gray-700">
          Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto
          contigo muy pronto para activar tu MiniBot.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 px-6 max-w-5xl mx-auto rounded-xl shadow-md mt-16 mb-16">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Solicita tu MiniBot para tu Sitio Web
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Completa el formulario y nos pondremos en contacto contigo muy pronto!
      </p>

      {/* Botón para mostrar formulario - solo visible cuando showForm es false */}
      {!showForm ? (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Diligenciar Formulario de Solicitud
          </button>
        </div>
      ) : (
        // Formulario con animación de aparición
        <div className="animate-fadeIn space-y-8">
          {/* Contacto */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Nombre completo"
                  value={contactName} 
                  onChange={e => setContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Correo electrónico"
                  type="email"
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa / Proyecto
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Empresa / Proyecto"
                  value={company} 
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Sitio web donde quieres tu Chat Bot
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="https://tusitio.com"
                  type="url"
                  value={website} 
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje adicional (opcional)
              </label>
              <textarea 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={3}
                placeholder="Cuéntanos más sobre lo que necesitas..."
                value={message} 
                onChange={e => setMessage(e.target.value)}
              />
            </div>
          </div>

          {/* Configuración del Bot */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Configuración de tu MiniBot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coloca aquí el nombre de tu empresa.
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="mi-sitio-bot"
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Identificador único para tu bot</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qué nombre quieres darle a tu Bot?
                </label>
                <input 
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Ej: Asistente XYZ"
                  value={botName} 
                  onChange={e => setBotName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agrega en este espacio el mensaje que quieres que tu Bot responda cuando el usuario hace una pregunta que no ha sido prevista, por defecto respondera: *
              </label>
              <textarea 
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={3}
                placeholder="Lo siento, no he entendido tu pregunta. ¿Podrías reformularla?"
                value={defaultResponse} 
                onChange={e => setDefaultResponse(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useGPT}
                  onChange={() => setUseGPT(!useGPT)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Activar GPT (recomendado para respuestas más inteligentes)</span>
              </label>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Preguntas y respuestas personalizadas</h3>
              <button 
                onClick={addFAQ} 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Agrega la posible pregunta que podría hacer tu cliente
              </button>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pregunta {index + 1}
                    </label>
                    <input 
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="¿Cuál es el horario de atención?"
                      value={faq.question}
                      onChange={e => updateFAQ(index, 'question', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aquí registra la Respuesta que tu Bot le dará a tu cliente frente a la pregunta planteada.
                    </label>
                    <textarea 
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      rows={2}
                      placeholder="Nuestro horario de atención es de lunes a viernes de 9am a 6pm"
                      value={faq.answer}
                      onChange={e => updateFAQ(index, 'answer', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de envío */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : 'Enviar Solicitud de MiniBot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MinibotForm;