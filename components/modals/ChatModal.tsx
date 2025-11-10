
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import { ChatMessage, Character } from '../../types';
import { startChat } from '../../services/geminiService';
import { getCharacter } from '../../services/characterService';
import LoadingSpinner from '../LoadingSpinner';
import { PaperAirplaneIcon } from '../Icons';
import CharacterSelector from '../CharacterSelector';
import type { Chat } from '@google/genai';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';


const ChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return undefined;
    return getCharacter(selectedCharacterId);
  }, [selectedCharacterId]);

  useEffect(() => {
    setChat(startChat({
        model: thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
        config: { thinkingConfig: thinkingMode ? { thinkingBudget: 32768 } : undefined },
        character: selectedCharacter,
    }));
    
    let initialMessage = "Hello! I'm your AI assistant. Ask me anything!";
    if(selectedCharacter) {
        initialMessage = `Hello! I'm ${selectedCharacter.name}. How can I help you today?`
    }
    if (thinkingMode) {
        initialMessage = "Thinking mode activated. I'm ready for complex questions.";
    }

    setMessages([{ sender: 'bot', text: initialMessage }]);
  }, [thinkingMode, selectedCharacter]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: input });
      const botMessage: ChatMessage = { sender: 'bot', text: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const friendlyMessage = getFriendlyErrorMessage(error);
      const errorMessage: ChatMessage = { sender: 'bot', text: friendlyMessage };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="AI Chatbot" onClose={onClose}>
      <div className="flex flex-col h-[70vh]">
        <div className="flex justify-between items-center mb-4 p-2 bg-gray-900 rounded-lg">
            <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading} />
            <div className="flex items-center space-x-2 ml-4">
                <label htmlFor="thinking-mode" className="text-sm font-medium text-gray-300">Thinking Mode</label>
                <button onClick={() => setThinkingMode(!thinkingMode)} disabled={isLoading} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${thinkingMode ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${thinkingMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 border-t border-gray-700 pt-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none p-4">
                    <LoadingSpinner />
                 </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 flex items-center border-t border-gray-700 pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your message..."
            className="flex-grow bg-gray-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="ml-2 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;
