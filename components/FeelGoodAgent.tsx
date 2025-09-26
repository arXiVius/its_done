import React, { useState, useRef, useEffect } from 'react';
import { AiMessage, AgentAction, AppContext } from '../types';
import { getAgentResponse, getSubTasks } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const AGENT_HISTORY_KEY = 'its_done_feel_good_agent_history';

interface FeelGoodAgentProps {
  onClose: () => void;
  appContext: AppContext;
}

const formatActionForTooltip = (action: AgentAction): string => {
    if (!action || !action.args) {
        return 'Malformed action performed';
    }
    const { toolName, args } = action;
    switch (toolName) {
        case 'addTask': return `Added task: "${args.text}"`;
        case 'toggleTask': return `Toggled task: "${args.text}"`;
        case 'deleteTask': return `Deleted task: "${args.text}"`;
        case 'setFocus': return `Set focus to: "${args.text}"`;
        case 'startTimer': return `Started timer.`;
        case 'pauseTimer': return `Paused timer.`;
        case 'resetTimer': return `Reset timer.`;
        case 'addJournalEntry': return `Added journal entry.`;
        case 'setReminder': return `Set reminder for "${args.text}" at ${new Date(args.reminderTime).toLocaleString()}`;
        case 'cancelReminder': return `Cancelled reminder for "${args.text}"`;
        case 'breakdownTask': return `Broke down goal: "${args.goal}"`;
        default: return `Action: ${toolName}`;
    }
};

const FeelGoodAgent: React.FC<FeelGoodAgentProps> = ({ onClose, appContext }) => {
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    try {
        const savedHistory = localStorage.getItem(AGENT_HISTORY_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
        console.error("Failed to load agent chat history:", error);
        return [];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(messages.length > 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    try {
        localStorage.setItem(AGENT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
        console.error("Failed to save agent chat history:", error);
    }
  }, [messages]);
  
  const executeAction = async (action: AgentAction) => {
    if (!action || !action.args) {
        console.warn('Skipping malformed AI action:', action);
        return;
    }
    
    const { toolName, args } = action;
    console.log("Executing action:", toolName, args);
    switch (toolName) {
        case 'addTask':
            appContext.onSaveTask(args);
            break;
        case 'toggleTask':
            if (args.id) appContext.onToggleTask(args.id);
            break;
        case 'deleteTask':
            if (args.id) appContext.onDeleteTask(args.id);
            break;
        case 'setFocus':
            if (args.text) appContext.onSetFocus(args.text);
            break;
        case 'addJournalEntry':
            if (args.content) {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                appContext.onUpdateJournalEntry(today, args.content);
            }
            break;
        case 'startTimer':
            appContext.onPomodoroAction('start');
            break;
        case 'pauseTimer':
            appContext.onPomodoroAction('pause');
            break;
        case 'resetTimer':
            appContext.onPomodoroAction('reset');
            break;
        case 'setReminder':
            if (args.id && args.reminderTime) {
                appContext.onSaveTask({ id: args.id, reminderTime: args.reminderTime });
            }
            break;
        case 'cancelReminder':
            if (args.id) {
                appContext.onCancelReminder(args.id);
            }
            break;
        case 'breakdownTask':
            if (args.goal) {
                try {
                    const subTasks = await getSubTasks(args.goal);
                    subTasks.forEach(taskText => {
                        appContext.onSaveTask({ text: taskText, category: args.goal });
                    });
                } catch (error) {
                    console.error("Failed to execute task breakdown:", error);
                }
            }
            break;
        default:
            console.warn(`Unknown tool: ${toolName}`);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() === '' || isLoading) return;
    
    if (!chatStarted) {
        setChatStarted(true);
    }

    const userMessage: AiMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const { tasks, notes, focus, journalEntries } = appContext;
      const agentResponse = await getAgentResponse(currentInput, { tasks, notes, focus, journalEntries });
      
      if(agentResponse.actions && agentResponse.actions.length > 0) {
        await Promise.all(agentResponse.actions.map(executeAction));
      }

      const aiMessage: AiMessage = { sender: 'ai', text: agentResponse.responseText, actions: agentResponse.actions };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Feel Good Agent Error:', error);
      const errorMessage: AiMessage = {
        sender: 'ai',
        text: 'Oops, my circuits are a bit fuzzy right now. Please try again in a moment.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300" 
        style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
        }}
    >
      <div 
        className="w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden transition-all duration-500"
        style={{
            backgroundColor: 'var(--bg-color)',
            border: '2px solid var(--accent-color)',
            boxShadow: '0 0 40px var(--accent-color)',
        }}
      >
        <header className="flex items-center justify-between p-4 border-b-2 flex-shrink-0" style={{borderColor: 'var(--accent-color)'}}>
            <h1 className="text-3xl" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-color)'}}>
                feel_good AI
            </h1>
            <button 
                onClick={onClose} 
                className="text-2xl font-bold" 
                style={{color: 'var(--text-color)'}}
                aria-label="Close AI Agent"
            >
                &times;
            </button>
        </header>

        <div className="flex-grow overflow-y-auto relative">
            {/* Bio Screen Content */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-8 transition-opacity duration-500 ${chatStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="w-24 h-24 rounded-full mb-6" style={{
                      background: 'linear-gradient(145deg, var(--accent-color), var(--bg-color))',
                      border: '3px solid var(--accent-color)',
                  }}></div>
                <h2 className="text-4xl font-bold mb-3" style={{fontFamily: 'var(--font-heading)'}}>Hello! I'm your feel_good AI.</h2>
                <p className="max-w-md text-lg mb-8" style={{opacity: 0.8}}>I can manage your tasks, set your focus, and control timers. Try asking me to "break down 'plan my week'" to see me in action.</p>
            </div>
            
            {/* Chat Messages */}
            <main className={`p-6 space-y-4 transition-opacity duration-500 ${chatStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                            background: 'linear-gradient(145deg, var(--accent-color), var(--bg-color))',
                            border: '2px solid var(--accent-color)',
                        }}></div>
                    )}
                    <div
                        className="relative max-w-md lg:max-w-lg p-3 rounded-lg"
                        title={msg.actions && msg.actions.length > 0 ? msg.actions.map(formatActionForTooltip).join('\n') : undefined}
                        style={{
                        backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-color)',
                        color: msg.sender === 'user' ? 'var(--bg-color)' : 'var(--text-color)',
                        border: '2px solid var(--text-color)',
                        boxShadow: '3px 3px 0 var(--text-color)'
                        }}
                    >
                        {msg.actions && msg.actions.length > 0 && (
                            <div className="absolute top-1 right-2 text-xs opacity-60" aria-label="Action performed">
                                🔧
                            </div>
                        )}
                        <MarkdownRenderer content={msg.text} />
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                            background: 'linear-gradient(145deg, var(--accent-color), var(--bg-color))',
                            border: '2px solid var(--accent-color)',
                        }}></div>
                        <div className="max-w-xs p-3 rounded-lg" style={{ border: '2px solid var(--text-color)', boxShadow: '3px 3px 0 var(--text-color)' }}>
                            <div className="animate-pulse flex space-x-2">
                                <div className="rounded-full h-2 w-2" style={{backgroundColor: 'var(--text-color)'}}></div>
                                <div className="rounded-full h-2 w-2" style={{backgroundColor: 'var(--text-color)', animationDelay: '0.2s'}}></div>
                                <div className="rounded-full h-2 w-2" style={{backgroundColor: 'var(--text-color)', animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
        </div>
        
        <footer className="p-4 border-t-2 flex-shrink-0" style={{borderColor: 'var(--accent-color)'}}>
            <form onSubmit={handleSend} className="flex gap-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Tell me what you need..."
                    disabled={isLoading}
                    className="flex-grow p-3 bg-transparent border-2 focus:outline-none rounded-lg text-lg disabled:opacity-50"
                    style={{ borderColor: 'var(--text-color)' }}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="p-3 border-2 font-bold rounded-lg disabled:opacity-50"
                    style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--bg-color)',
                    borderColor: 'var(--text-color)',
                    }}
                >
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default FeelGoodAgent;