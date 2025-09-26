import React, { useState, useEffect, useCallback } from 'react';
import { Mood, Theme, Palette, Task, PomodoroMode, JournalEntry, PinnedItem } from './types';
import { THEMES } from './constants';
import MoodSelector from './components/MoodSelector';
import Dashboard from './components/Dashboard';
import FeelGoodAgent from './components/FeelGoodAgent';
import CustomPaletteEditor from './components/CustomPaletteEditor';

const TASKS_KEY = 'its_done_tasks';
const NOTES_KEY = 'its_done_notes';
const FOCUS_KEY = 'its_done_daily_focus';
const POMODORO_SETTINGS_KEY = 'its_done_pomodoro_settings';
const JOURNAL_ENTRIES_KEY = 'its_done_journal_entries';
const RESEARCH_MODE_KEY = 'its_done_research_mode';
const PINNED_ITEMS_KEY = 'its_done_pinned_items';

const createThemeFromCustom = (customPalette: {light: Palette, dark: Palette}): Theme => {
  return {
    ...THEMES.focus, // Use focus fonts as a base
    name: "Custom",
    description: "Your personalized theme.",
    light: customPalette.light,
    dark: customPalette.dark,
  }
}

const App: React.FC = () => {
  // App-wide State
  const [mood, setMood] = useState<Mood | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('its_done_darkMode');
      if (savedDarkMode !== null) return JSON.parse(savedDarkMode);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Widget State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState('');
  const [focus, setFocus] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [pomodoroState, setPomodoroState] = useState({
    durations: { work: 25, short: 5, long: 15 },
    mode: 'work' as PomodoroMode,
    isActive: false,
    cycles: 0,
  });

  // Experimental Features State
  const [experimentalUnlocked, setExperimentalUnlocked] = useState<boolean>(() => 
    JSON.parse(localStorage.getItem('its_done_experimental_unlocked') || 'false')
  );
  const [showAgent, setShowAgent] = useState<boolean>(false);
  const [showPaletteEditor, setShowPaletteEditor] = useState<boolean>(false);
  const [customPalette, setCustomPalette] = useState<{light: Palette, dark: Palette} | null>(() => 
    JSON.parse(localStorage.getItem('its_done_custom_palette') || 'null')
  );
  const [isResearchMode, setIsResearchMode] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem(RESEARCH_MODE_KEY) || 'false')
  );


  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedMood = localStorage.getItem('its_done_mood') as Mood;
      const savedName = localStorage.getItem('its_done_userName');
      if (savedMood && savedName) {
        setMood(savedMood);
        setUserName(savedName);
      }
      
      const savedTasks = localStorage.getItem(TASKS_KEY);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      
      const savedNotes = localStorage.getItem(NOTES_KEY);
      setNotes(savedNotes || 'Brainstorming session ideas:\n- Theming based on user mood.\n- Neo-brutalist UI components.');

      const savedFocus = localStorage.getItem(FOCUS_KEY);
      setFocus(savedFocus || '');
      
      const savedPomodoroSettings = localStorage.getItem(POMODORO_SETTINGS_KEY);
      if (savedPomodoroSettings) {
        setPomodoroState(prev => ({ ...prev, durations: JSON.parse(savedPomodoroSettings) }));
      }

      const savedJournalEntries = localStorage.getItem(JOURNAL_ENTRIES_KEY);
      setJournalEntries(savedJournalEntries ? JSON.parse(savedJournalEntries) : []);
      
      const savedPinnedItems = localStorage.getItem(PINNED_ITEMS_KEY);
      setPinnedItems(savedPinnedItems ? JSON.parse(savedPinnedItems) : []);

    } catch (error) {
      console.error("Failed to load from localStorage", error);
    }
  }, []);

  // Persist widget data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      localStorage.setItem(NOTES_KEY, notes);
      localStorage.setItem(FOCUS_KEY, focus);
      localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(pomodoroState.durations));
      localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(journalEntries));
      localStorage.setItem(RESEARCH_MODE_KEY, JSON.stringify(isResearchMode));
      localStorage.setItem(PINNED_ITEMS_KEY, JSON.stringify(pinnedItems));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  }, [tasks, notes, focus, pomodoroState.durations, journalEntries, isResearchMode, pinnedItems]);

  // Theme application effect
  useEffect(() => {
    const theme = customPalette ? createThemeFromCustom(customPalette) : (mood ? THEMES[mood] : THEMES.focus);
    const palette = isDarkMode ? theme.dark : theme.light;

    const root = document.documentElement;
    root.style.setProperty('--bg-color', palette.bg);
    root.style.setProperty('--text-color', palette.text);
    root.style.setProperty('--accent-color', palette.accent);
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);
    
  }, [mood, isDarkMode, customPalette]);

  // Handlers
  const handleStartSession = (selectedMood: Mood, name: string) => {
    setMood(selectedMood);
    setUserName(name);
    try {
      localStorage.setItem('its_done_mood', selectedMood);
      localStorage.setItem('its_done_userName', name);
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    try {
      localStorage.setItem('its_done_darkMode', JSON.stringify(newDarkModeState));
    } catch (error) {
      console.error("Failed to save dark mode state to localStorage", error);
    }
  }
  
  // Task Handlers
  const handleSaveTask = (taskData: Partial<Task>) => {
    setTasks(prevTasks => {
        if (taskData.id) {
            return prevTasks.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t);
        } else {
            const newTask: Task = {
                id: Date.now(),
                text: taskData.text || '',
                completed: false,
                priority: 'Medium',
                ...taskData
            };
            return [...prevTasks, newTask];
        }
    });
  };
  const handleToggleTask = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  const handleCancelReminder = (taskId: number) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, reminderTime: undefined } : t));
  };

  // Focus Handler
  const handleSetFocus = (newFocus: string) => {
      setFocus(newFocus);
  };
  
  // Pomodoro Handlers
  const handlePomodoroAction = (action: 'start' | 'pause' | 'reset' | 'switch') => {
    setPomodoroState(prev => {
        switch (action) {
            case 'start': 
                return { ...prev, isActive: true };
            case 'pause': 
                return { ...prev, isActive: false };
            case 'reset':
                return { ...prev, isActive: false, mode: 'work', cycles: 0 };
            case 'switch':
                const newCycles = prev.mode === 'work' ? prev.cycles + 1 : prev.cycles;
                let newMode: PomodoroMode = 'work'; // Default to work
                if (prev.mode === 'work') {
                    // Switch to a break
                    newMode = (newCycles > 0 && newCycles % 4 === 0) ? 'longBreak' : 'shortBreak';
                }
                // If it was a break, it automatically switches back to work.
                return { ...prev, isActive: false, mode: newMode, cycles: newCycles };
            default: 
                return prev;
        }
    });
  };

  const handleUpdatePomodoroSettings = (durations: { work: number; short: number; long: number; }) => {
    setPomodoroState(prev => ({...prev, durations}));
  };

  // Journal Handler
  const handleUpdateJournalEntry = (date: string, content: string) => {
    setJournalEntries(prev => {
        const existingIndex = prev.findIndex(entry => entry.date === date);
        if (existingIndex > -1) {
            const updatedEntries = [...prev];
            updatedEntries[existingIndex] = { date, content };
            return updatedEntries;
        } else {
            return [...prev, { date, content }];
        }
    });
  };

  // Research Handlers
  const handlePinItem = (item: Omit<PinnedItem, 'id'>) => {
    setPinnedItems(prev => [...prev, { ...item, id: Date.now() }]);
  };
  const handleUnpinItem = (id: number) => {
    setPinnedItems(prev => prev.filter(item => item.id !== id));
  };

  // Experimental Features Handlers
  const handleUnlockExperimental = () => {
    setExperimentalUnlocked(true);
    localStorage.setItem('its_done_experimental_unlocked', 'true');
  }

  const handleSaveCustomPalette = (palette: {light: Palette, dark: Palette}) => {
    setCustomPalette(palette);
    localStorage.setItem('its_done_custom_palette', JSON.stringify(palette));
    setShowPaletteEditor(false);
  }

  const toggleResearchMode = () => {
    setIsResearchMode(prev => !prev);
  }
  
  const appContext = {
    tasks, notes, focus, pomodoroState, journalEntries, pinnedItems,
    onSaveTask: handleSaveTask,
    onToggleTask: handleToggleTask,
    onDeleteTask: handleDeleteTask,
    onSetFocus: handleSetFocus,
    onUpdateNotes: setNotes,
    onPomodoroAction: handlePomodoroAction,
    onUpdatePomodoroSettings: handleUpdatePomodoroSettings,
    onCancelReminder: handleCancelReminder,
    onUpdateJournalEntry: handleUpdateJournalEntry,
    onPinItem: handlePinItem,
    onUnpinItem: handleUnpinItem,
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-color)', 
      color: 'var(--text-color)', 
      fontFamily: 'var(--font-body)',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
      {!mood || !userName ? (
        <MoodSelector onStart={handleStartSession} />
      ) : (
        <Dashboard 
          userName={userName} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          experimentalUnlocked={experimentalUnlocked}
          onUnlockExperimental={handleUnlockExperimental}
          onShowAgent={() => setShowAgent(true)}
          onShowPaletteEditor={() => setShowPaletteEditor(true)}
          isResearchMode={isResearchMode}
          toggleResearchMode={toggleResearchMode}
          appContext={appContext}
        />
      )}
      {showAgent && (
        <FeelGoodAgent 
            onClose={() => setShowAgent(false)} 
            appContext={appContext}
        />
      )}
      {showPaletteEditor && (
        <CustomPaletteEditor 
          onClose={() => setShowPaletteEditor(false)} 
          onSave={handleSaveCustomPalette}
          currentPalette={customPalette}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default App;