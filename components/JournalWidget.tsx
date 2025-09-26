
import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import Widget from './Widget';
import { getJournalPrompt } from '../services/geminiService';

interface JournalWidgetProps {
  entries: JournalEntry[];
  onUpdateEntry: (date: string, content: string) => void;
}

const getLocalDateString = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
}

const JournalWidget: React.FC<JournalWidgetProps> = ({ entries, onUpdateEntry }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    
    const currentDateString = getLocalDateString(currentDate);

    useEffect(() => {
        const todaysEntry = entries.find(e => e.date === currentDateString);
        setContent(todaysEntry?.content || '');
    }, [currentDateString, entries]);

    const handleSave = () => {
        onUpdateEntry(currentDateString, content);
    };
    
    const handleGetPrompt = async () => {
        setIsLoadingPrompt(true);
        setPrompt('');
        try {
            const newPrompt = await getJournalPrompt();
            setPrompt(newPrompt);
        } catch (error) {
            console.error(error);
            setPrompt("Could not get a prompt. Try again?");
        } finally {
            setIsLoadingPrompt(false);
        }
    }

    const changeDate = (days: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const isToday = getLocalDateString(new Date()) === currentDateString;

    return (
        <Widget title="Journal">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => changeDate(-1)} className="p-2 font-bold text-lg">&lt;</button>
                    <h3 className="font-bold text-center">
                        {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <button onClick={() => changeDate(1)} disabled={isToday} className="p-2 font-bold text-lg disabled:opacity-30">&gt;</button>
                </div>
                {prompt && <p className="mb-2 p-2 border-l-4" style={{borderColor: 'var(--accent-color)', opacity: 0.9}}><em>{prompt}</em></p>}
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full flex-grow p-3 text-lg bg-transparent border-2 mb-4 resize-none focus:outline-none rounded-md"
                    style={{ borderColor: 'var(--text-color)', minHeight: '200px' }}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleGetPrompt}
                        disabled={isLoadingPrompt}
                        className="p-3 border-2 font-bold w-full disabled:opacity-50 rounded-md"
                    >
                       {isLoadingPrompt ? 'Getting prompt...' : 'Get a Prompt'}
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-3 border-2 font-bold w-full rounded-md"
                        style={{ 
                            backgroundColor: 'var(--accent-color)', 
                            color: 'var(--bg-color)', 
                            borderColor: 'var(--text-color)' 
                        }}
                    >
                        Save Entry
                    </button>
                </div>
            </div>
        </Widget>
    );
};

export default JournalWidget;
