// src/components/ChatMessage.tsx

import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Componente para mostrar un mensaje en el chat
 * @param message Mensaje a mostrar
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

/**
 * Formatea la fecha y hora del mensaje
 * @param date Fecha a formatear
 * @returns Cadena con la fecha y hora formateada
 */
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default ChatMessage;