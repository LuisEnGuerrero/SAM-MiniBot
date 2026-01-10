import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.tsx';
import ChatInput from './ChatInput.tsx';
import { ChatMessage as ChatMessageType, ChatResponse } from '../types';
import { sendMessage } from '../services/chatService.ts';

interface ChatBotProps {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBot: React.FC<ChatBotProps> = ({ isChatOpen, setIsChatOpen }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [suggestedFaqs, setSuggestedFaqs] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --------------------
  // INIT SESSION
  // --------------------
  useEffect(() => {
    const newSessionId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    setSessionId(newSessionId);

    setMessages([
      {
        id: 'welcome',
        text: '¡Hola! Soy SAM, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  // --------------------
  // AUTO SCROLL
  // --------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, suggestedFaqs]);

  // --------------------
  // SEND MESSAGE
  // --------------------
  const handleSendMessage = async (userMessage: string) => {
    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedFaqs([]);

    try {
      const response: ChatResponse = await sendMessage(userMessage, sessionId);

      const botMsg: ChatMessageType = {
        id: `bot-${Date.now()}`,
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

      if (
        response.source === 'default' &&
        Array.isArray(response.suggestedFaqs) &&
        response.suggestedFaqs.length > 0
      ) {
        setSuggestedFaqs(response.suggestedFaqs);
      }
    } catch (error) {
      console.error('[ChatBot] Error:', error);

      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text:
            'Lo siento, ocurrió un error al procesar tu mensaje. Intenta nuevamente.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------
  // TOGGLE CHAT
  // --------------------
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  // --------------------
  // RENDER
  // --------------------
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        {isChatOpen ? '✕' : '💬'}
      </button>

      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">SAM MiniBot</h2>
            <span className="text-sm flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              En línea
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="text-sm text-gray-500 mt-2">
                Escribiendo…
              </div>
            )}

            {suggestedFaqs.length > 0 && (
              <div className="mt-3 p-3 bg-white border rounded-lg">
                <p className="text-sm font-semibold mb-2">
                  💡 También puedes preguntar:
                </p>

                {suggestedFaqs.slice(0, 5).map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(faq)}
                    className="block text-left w-full text-sm text-blue-600 hover:underline mb-1"
                  >
                    • {faq}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
