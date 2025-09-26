import React, { useState, useRef, useEffect } from 'react';
import Widget from './Widget';
import { getResearchResponse } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { AppContext } from '../types';

interface ResearchMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  sources?: any[];
  prompt?: string; // The user prompt that generated this AI response
}

interface ResearchAgentWidgetProps {
  appContext: AppContext;
}

const ResearchAgentWidget: React.FC<ResearchAgentWidgetProps> = ({ appContext }) => {
    const [messages, setMessages] = useState<ResearchMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [visibleSourcesId, setVisibleSourcesId] = useState<number | null>(null);
    const [showCopied, setShowCopied] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendPrompt = async (promptText: string) => {
        setIsLoading(true);
        if (messages.length === 0 || messages[messages.length - 1].text !== promptText) {
          const userMessage: ResearchMessage = { id: Date.now(), sender: 'user', text: promptText };
          setMessages(prev => [...prev, userMessage]);
        }

        try {
            const { text, sources } = await getResearchResponse(promptText);
            const aiMessage: ResearchMessage = { id: Date.now() + 1, sender: 'ai', text, sources, prompt: promptText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Research Agent Error:', error);
            const errorMessage: ResearchMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: 'Sorry, I encountered an error. Please ensure your API key is set up correctly.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;
        const currentInput = input;
        setInput('');
        sendPrompt(currentInput);
    };

    const handleDeepDive = (msg: ResearchMessage) => {
      if (msg.prompt) {
        const deepDivePrompt = `Provide a comprehensive deep dive and detailed report on the following topic: "${msg.prompt}"`;
        setInput(deepDivePrompt); // set it for user to see
        sendPrompt(deepDivePrompt);
      }
    };

    const handlePin = (msg: ResearchMessage) => {
      if (msg.prompt) {
        appContext.onPinItem({
          prompt: msg.prompt,
          response: msg.text,
          sources: msg.sources,
        });
      }
    };

    const handleExport = (msg: ResearchMessage) => {
      let sourcesText = '';
      if (msg.sources && msg.sources.length > 0) {
        sourcesText = '\n\n**Sources:**\n' + msg.sources.map(s => `* [${s.web.title || s.web.uri}](${s.web.uri})`).join('\n');
      }
      const formattedContent = `\n\n---\n\n## Research: ${msg.prompt}\n\n${msg.text}${sourcesText}`;
      appContext.onUpdateNotes(prevNotes => prevNotes + formattedContent);
      
      setShowCopied(msg.id);
      setTimeout(() => setShowCopied(null), 2000);
    }
    
    return (
        <Widget title="Research Agent">
            <div className="flex flex-col h-full">
                <div className="flex-grow space-y-4 overflow-y-auto p-1 pr-2 mb-4" style={{maxHeight: '60vh'}}>
                {messages.length === 0 && (
                    <div className="text-center p-4 h-full flex items-center justify-center" style={{opacity: 0.7}}>
                        Ask about current events or research topics. I'll provide sources for my answers.
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg`}
                            style={{
                                backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-color)',
                                color: msg.sender === 'user' ? 'var(--bg-color)' : 'var(--text-color)',
                                border: '2px solid var(--text-color)',
                            }}
                        >
                            <MarkdownRenderer content={msg.text} />
                            
                            {/* AI Message Actions */}
                            {msg.sender === 'ai' && (
                                <div className="mt-3 pt-2 border-t flex flex-wrap items-center gap-2" style={{borderColor: 'var(--text-color)'}}>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="relative">
                                            <button onClick={() => setVisibleSourcesId(prev => prev === msg.id ? null : msg.id)} className="font-bold text-sm px-2 py-1 border-2 rounded-md hover:opacity-75" style={{borderColor: 'var(--accent-color)', color: 'var(--accent-color)'}} >
                                                {visibleSourcesId === msg.id ? '▲ Hide Sources' : `▼ View ${msg.sources.length} Sources`}
                                            </button>
                                            {visibleSourcesId === msg.id && (
                                                <div className="absolute top-full mt-2 left-0 w-72 max-w-sm p-3 rounded-lg z-40" style={{ backgroundColor: 'var(--bg-color)', border: '2px solid var(--accent-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }} >
                                                    <div className="flex justify-between items-center mb-2"> <h4 className="font-bold text-sm">Sources:</h4> <button onClick={() => setVisibleSourcesId(null)} className="font-bold text-lg leading-none">&times;</button> </div>
                                                    <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto pr-2">
                                                        {msg.sources.map((source, i) => ( <li key={i}> <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75" title={source.web.title}> {source.web.title || new URL(source.web.uri).hostname} </a> </li> ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2 ml-auto">
                                      <button onClick={() => handlePin(msg)} title="Pin Response" className="text-lg hover:opacity-75">📌</button>
                                      <button onClick={() => handleDeepDive(msg)} title="Deep Dive" className="text-lg hover:opacity-75">🌊</button>
                                      <button onClick={() => handleExport(msg)} title="Export to Notes" className="text-lg hover:opacity-75 relative">
                                        {showCopied === msg.id ? '✅' : '📋'}
                                      </button>
                                    </div>
                                </div>
                            )}
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
                            placeholder="Ask a research question..."
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
                            Search
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <button type="button" onClick={() => setInput("Compare React vs. Vue")} className="px-2 py-1 border-2 rounded-md hover:opacity-75" style={{borderColor: 'var(--text-color)'}}>
                            Compare X vs Y
                        </button>
                    </div>
                </form>
            </div>
        </Widget>
    );
};

export default ResearchAgentWidget;