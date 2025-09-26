import React, { useState } from 'react';
import Widget from './Widget';
import { summarizeText } from '../services/geminiService';

interface NotesProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, onUpdateNotes }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (notes.trim().length < 20) {
      setError('Please write a bit more before summarizing.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeText(notes);
      setSummary(result);
    } catch (err) {
      setError('Failed to get summary. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Widget title="Notes & Summary">
        <div className="flex flex-col h-full">
            <textarea
                value={notes}
                onChange={e => onUpdateNotes(e.target.value)}
                placeholder="Jot down your thoughts..."
                className="w-full flex-grow p-3 text-lg bg-transparent border-2 mb-4 resize-none focus:outline-none rounded-md"
                style={{ borderColor: 'var(--text-color)', minHeight: '150px' }}
            />
            <button
                onClick={handleSummarize}
                disabled={isLoading}
                className="p-3 border-2 font-bold w-full disabled:opacity-50 rounded-md"
                style={{ 
                backgroundColor: 'var(--accent-color)', 
                color: 'var(--bg-color)', 
                borderColor: 'var(--text-color)' 
                }}
            >
                {isLoading ? 'Summarizing...' : 'Summarize with AI'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {summary && (
                <div className="mt-4 p-3 border-2 rounded-md" style={{borderColor: 'var(--text-color)'}}>
                    <h3 className="font-bold text-xl mb-2" style={{fontFamily: 'var(--font-heading)'}}>Summary:</h3>
                    <p className="whitespace-pre-wrap">{summary}</p>
                </div>
            )}
        </div>
    </Widget>
  );
};

export default Notes;