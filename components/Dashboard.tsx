import React, { useState } from 'react';
import TodoList from './TodoList';
import Notes from './Notes';
import AIAssistant from './AIAssistant';
import PomodoroTimer from './PomodoroTimer';
import DailyFocus from './DailyFocus';
import JournalWidget from './JournalWidget';
import ResearchAgentWidget from './ResearchAgentWidget';
import PinnedResearchWidget from './PinnedResearchWidget';
import { AppContext } from '../types';

interface DashboardProps {
  userName: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  experimentalUnlocked: boolean;
  onUnlockExperimental: () => void;
  onShowAgent: () => void;
  onShowPaletteEditor: () => void;
  isResearchMode: boolean;
  toggleResearchMode: () => void;
  appContext: AppContext;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userName, 
  isDarkMode, 
  toggleDarkMode,
  experimentalUnlocked,
  onUnlockExperimental,
  onShowAgent,
  onShowPaletteEditor,
  isResearchMode,
  toggleResearchMode,
  appContext
}) => {
  const [unlockClicks, setUnlockClicks] = useState(0);

  const handleWelcomeClick = () => {
    if (experimentalUnlocked) return;
    
    const newCount = unlockClicks + 1;
    setUnlockClicks(newCount);

    if (newCount >= 7) {
        onUnlockExperimental();
        setUnlockClicks(0);
    }

    setTimeout(() => {
        setUnlockClicks(currentCount => (currentCount === newCount ? 0 : currentCount));
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 
          className="text-3xl sm:text-4xl font-bold cursor-pointer" 
          style={{ fontFamily: 'var(--font-heading)' }}
          onClick={handleWelcomeClick}
          title={experimentalUnlocked ? "Experimental features unlocked" : "What secrets do you hold?"}
        >
          Welcome, <span style={{color: 'var(--accent-color)'}}>{userName}</span>!
        </h1>
        <div className="flex items-center gap-2">
          {experimentalUnlocked && (
            <>
               <button
                onClick={toggleResearchMode}
                className="p-2 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: isResearchMode ? 'var(--accent-color)' : 'var(--text-color)', color: 'var(--text-color)', backgroundColor: isResearchMode ? 'var(--accent-color)' : 'var(--bg-color)', '--tw-ring-color': 'var(--accent-color)', '--tw-ring-offset-color': 'var(--bg-color)' } as React.CSSProperties}
                aria-label="Toggle Research Mode"
                title="Toggle Research Mode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              </button>
              <button
                onClick={onShowAgent}
                className="p-2 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)', backgroundColor: 'var(--bg-color)', '--tw-ring-color': 'var(--accent-color)', '--tw-ring-offset-color': 'var(--bg-color)' } as React.CSSProperties}
                aria-label="Open feel_good AI Agent"
                title="Open feel_good AI Agent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </button>
              <button
                onClick={onShowPaletteEditor}
                className="p-2 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)', backgroundColor: 'var(--bg-color)', '--tw-ring-color': 'var(--accent-color)', '--tw-ring-offset-color': 'var(--bg-color)' } as React.CSSProperties}
                aria-label="Customize palette"
                title="Customize palette"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </button>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-2 border-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--text-color)', 
              color: 'var(--text-color)', 
              backgroundColor: 'var(--bg-color)',
              '--tw-ring-color': 'var(--accent-color)', 
              '--tw-ring-offset-color': 'var(--bg-color)' 
            } as React.CSSProperties}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
            <DailyFocus focus={appContext.focus} onSetFocus={appContext.onSetFocus} />
        </div>
        {isResearchMode ? (
          <>
            <div className="lg:col-span-2">
              <ResearchAgentWidget appContext={appContext} />
            </div>
            <div className="lg:col-span-1">
                <PinnedResearchWidget appContext={appContext} />
            </div>
            <div className="lg:col-span-3">
              <Notes notes={appContext.notes} onUpdateNotes={appContext.onUpdateNotes} />
            </div>
          </>
        ) : (
          <>
            <Notes notes={appContext.notes} onUpdateNotes={appContext.onUpdateNotes} />
            <TodoList tasks={appContext.tasks} onSaveTask={appContext.onSaveTask} onToggleTask={appContext.onToggleTask} onDeleteTask={appContext.onDeleteTask} />
            <JournalWidget entries={appContext.journalEntries} onUpdateEntry={appContext.onUpdateJournalEntry} />
            <AIAssistant />
            <PomodoroTimer state={appContext.pomodoroState} onAction={appContext.onPomodoroAction} onUpdateSettings={appContext.onUpdatePomodoroSettings} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;