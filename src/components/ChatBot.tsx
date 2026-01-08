import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.tsx';
import ChatInput from './ChatInput.tsx';
import { ChatMessage as ChatMessageType, ChatResponse } from '../types';
import { sendMessage } from '../services/chatService.ts';

interface ChatBotProps {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Componente principal del chatbot.
 * Ahora es controlado por el componente padre (App.tsx).
 */
const ChatBot: React.FC<ChatBotProps> = ({ isChatOpen, setIsChatOpen }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generar un ID de sesión al montar el componente
  useEffect(() => {
    const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    
    // Mensaje de bienvenida inicial
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      text: '¡Hola! Soy un asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Desplazarse hacia abajo cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Envía un mensaje del usuario y obtiene la respuesta del bot
   * @param userMessage Mensaje del usuario
   */
  const handleSendMessage = async (userMessage: string) => {
    // Añadir mensaje del usuario al estado
    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setIsLoading(true);

    try {
      // Enviar mensaje al backend y obtener respuesta
      const response: ChatResponse = await sendMessage(userMessage, sessionId);
      
      // Añadir respuesta del bot al estado
      const botMsg: ChatMessageType = {
        id: `bot-${Date.now()}`,
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMsg]);
    } catch (error) {
      console.error('Error al obtener respuesta del bot:', error);
      
      // Mensaje de error
      const errorMsg: ChatMessageType = {
        id: `error-${Date.now()}`,
        text: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desplaza la vista de mensajes hacia abajo
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Alterna la visibilidad de la ventana de chat.
   * Ahora usa la función pasada como prop.
   */
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón para abrir/cerrar el chat */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isChatOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Ventana de chat */}
      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Cabecera del chat */}
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Asistente Virtual</h2>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm">En línea</span>
            </div>
          </div>

          {/* Contenedor de mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Indicador de que el bot está escribiendo */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2 max-w-xs lg:max-w-md">
                  <p className="text-sm typing-indicator">Escribiendo</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensajes */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      )}
    </div>
  );
};

export default ChatBot;