import React, { useState, useEffect } from 'react';
import Widget from './Widget';

interface DailyFocusProps {
  focus: string;
  onSetFocus: (focus: string) => void;
}

const DailyFocus: React.FC<DailyFocusProps> = ({ focus: currentFocus, onSetFocus }) => {
  const [focusInput, setFocusInput] = useState(currentFocus);
  const [isEditing, setIsEditing] = useState(!currentFocus);

  useEffect(() => {
    setFocusInput(currentFocus);
    setIsEditing(!currentFocus);
  }, [currentFocus]);


  const handleSetFocus = () => {
    const trimmedFocus = focusInput.trim();
    if(trimmedFocus){
        onSetFocus(trimmedFocus);
        setIsEditing(false);
    }
  };

  return (
    <Widget title="Today's Focus">
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        {isEditing || !currentFocus ? (
          <div className="w-full">
            <textarea
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="What is your main goal for today?"
              className="w-full p-3 text-lg bg-transparent border-2 rounded-md mb-4 resize-none focus:outline-none"
              style={{ borderColor: 'var(--text-color)', minHeight: '80px' }}
              rows={3}
            />
            <button
              onClick={handleSetFocus}
              className="p-3 border-2 font-bold w-full rounded-md"
              style={{ 
                backgroundColor: 'var(--accent-color)', 
                color: 'var(--bg-color)', 
                borderColor: 'var(--text-color)' 
              }}
            >
              Set Focus
            </button>
          </div>
        ) : (
          <>
            <p className="text-2xl md:text-3xl font-semibold leading-tight">
              {currentFocus}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-sm font-bold"
              style={{ color: 'var(--accent-color)' }}
            >
              Edit Focus
            </button>
          </>
        )}
      </div>
    </Widget>
  );
};

export default DailyFocus;