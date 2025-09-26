
import React, { useState, useRef, useEffect } from 'react';
import { AiMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import Widget from './Widget';
import MarkdownRenderer from './MarkdownRenderer';

const CHAT_HISTORY_KEY = 'its_done_ai_chat_history';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [{ sender: 'ai', text: 'Hello! How can I help you be more productive today?' }];
      }
    } catch (error) {
        console.error("Failed to load chat history from localStorage", error);
    }
    return [{ sender: 'ai', text: 'Hello! How can I help you be more productive today?' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        }
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: AiMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(input);
      const aiMessage: AiMessage = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: AiMessage = {
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please ensure your API key is set up correctly.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearChat = () => {
    const clearedMessages: AiMessage[] = [{ sender: 'ai', text: 'History cleared. How can I help you?' }];
    setMessages(clearedMessages);
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  };

  const quickPrompts = [
    "Summarize my notes",
    "What's my focus today?",
    "Suggest a task for 'Personal Growth'",
  ];

  return (
    <Widget title="AI Assistant" actions={
      <button 
        onClick={handleClearChat}
        className="text-sm font-bold p-1 border-2 rounded-md"
        style={{borderColor: 'var(--text-color)'}}
        title="Clear chat history"
      >
        Clear
      </button>
    }>
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-4 overflow-y-auto p-1 pr-2 mb-4" style={{maxHeight: '400px'}}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg"
                style={{
                  backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-color)',
                  color: msg.sender === 'user' ? 'var(--bg-color)' : 'var(--text-color)',
                  border: '2px solid var(--text-color)',
                }}
              >
                <MarkdownRenderer content={msg.text} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-xs p-3 rounded-lg" style={{ border: '2px solid var(--text-color)'}}>
                    <div className="animate-pulse flex space-x-2">
                        <div className="rounded-full bg-gray-400 h-3 w-3"></div>
                        <div className="rounded-full bg-gray-400 h-3 w-3"></div>
                        <div className="rounded-full bg-gray-400 h-3 w-3"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-grow p-2 bg-transparent border-2 focus:outline-none disabled:opacity-50 rounded-md"
                style={{ borderColor: 'var(--text-color)' }}
            />
            <button
                type="submit"
                disabled={isLoading}
                className="p-2 border-2 font-bold disabled:opacity-50 rounded-md"
                style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--bg-color)',
                borderColor: 'var(--text-color)',
                }}
            >
                Send
            </button>
          </div>
           <div className="flex flex-wrap gap-2 text-sm">
                {quickPrompts.map(prompt => (
                    <button key={prompt} type="button" onClick={() => setInput(prompt)} className="px-2 py-1 border-2 rounded-md hover:opacity-75" style={{borderColor: 'var(--text-color)'}}>
                        {prompt}
                    </button>
                ))}
            </div>
        </form>
      </div>
    </Widget>
  );
};

export default AIAssistant;
