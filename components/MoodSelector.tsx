import React, { useState } from 'react';
import { Mood, Theme } from '../types';
import { THEMES } from '../constants';

interface MoodSelectorProps {
  onStart: (mood: Mood, name: string) => void;
}

const MoodCard: React.FC<{ theme: Theme; mood: Mood; onClick: () => void }> = ({ theme, mood, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-300 w-full text-left transform hover:scale-105 hover:-translate-y-1"
    style={{
      backgroundColor: theme.light.bg,
      color: theme.light.text,
      borderColor: theme.light.text,
      boxShadow: `4px 4px 0px ${theme.light.text}`,
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.dark.bg;
        e.currentTarget.style.color = theme.dark.text;
        e.currentTarget.style.borderColor = theme.dark.text;
        e.currentTarget.style.boxShadow = `4px 4px 0px ${theme.dark.text}`;
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.light.bg;
        e.currentTarget.style.color = theme.light.text;
        e.currentTarget.style.borderColor = theme.light.text;
        e.currentTarget.style.boxShadow = `4px 4px 0px ${theme.light.text}`;
    }}
  >
    <h3 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: theme.fonts.heading }}>
      {theme.name}
    </h3>
    <p className="mt-2 text-md" style={{ fontFamily: theme.fonts.body }}>
      {theme.description}
    </p>
    <div className="flex space-x-2 mt-4">
      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.light.accent }}></div>
      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.dark.bg, border: `2px solid ${theme.dark.accent}`}}></div>
      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.dark.accent }}></div>
    </div>
  </button>
);


const MoodSelector: React.FC<MoodSelectorProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSelectMood = (mood: Mood) => {
    if (name.trim() === '') {
      setError('Please enter your name first.');
      return;
    }
    setError('');
    onStart(mood, name);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8" style={{backgroundColor: '#FAF9F6'}}>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Welcome & Name Input */}
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#1A202C' }}>
            Welcome to <span style={{color: '#5A67D8'}}>it's_done.</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-600">Let's get you set up for a productive day.</p>
          
          <div className="mt-12">
              <label htmlFor="name-input" className="text-xl font-bold mb-2 block" style={{ fontFamily: "'Inter', sans-serif", color: '#333333' }}>
                  First, what's your name?
              </label>
              <input 
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                  }}
                  placeholder="Type your name here..."
                  className="p-3 text-xl w-full bg-transparent border-b-4 focus:outline-none transition-colors duration-300"
                  style={{
                    borderColor: '#CBD5E0', 
                    color: '#1A202C', 
                    '--focus-color': '#5A67D8', 
                    '--error-color': '#E53E3E', 
                    borderBottomColor: error ? 'var(--error-color)' : '#CBD5E0'
                  } as React.CSSProperties}
                  onFocus={(e) => e.currentTarget.style.borderBottomColor = 'var(--focus-color)'}
                  onBlur={(e) => e.currentTarget.style.borderBottomColor = error ? 'var(--error-color)' : '#CBD5E0'}
              />
              {error && <p className="text-red-600 mt-2 font-semibold">{error}</p>}
          </div>
        </div>

        {/* Right Column: Mood Selection */}
        <div className="w-full">
            <h2 className="text-xl md:text-2xl font-bold text-center md:text-left mb-6" style={{ fontFamily: "'Inter', sans-serif", color: '#333333' }}>
                Choose your vibe for today:
            </h2>
            <div className="grid grid-cols-1 gap-6">
                <MoodCard theme={THEMES.calm} mood={Mood.Calm} onClick={() => handleSelectMood(Mood.Calm)} />
                <MoodCard theme={THEMES.focus} mood={Mood.Focus} onClick={() => handleSelectMood(Mood.Focus)} />
                <MoodCard theme={THEMES.relaxed} mood={Mood.Relaxed} onClick={() => handleSelectMood(Mood.Relaxed)} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;