export enum Mood {
  Calm = 'calm',
  Focus = 'focus',
  Relaxed = 'relaxed',
}

export interface Palette {
  bg: string;
  text: string;
  accent: string;
}

export interface FontPair {
  heading: string;
  body: string;
}

export interface Theme {
  name: string;
  description: string;
  light: Palette;
  dark: Palette;
  fonts: FontPair;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  reminderTime?: string;
  priority?: 'Low' | 'Medium' | 'High';
  category?: string;
}

export interface JournalEntry {
    date: string; // YYYY-MM-DD
    content: string;
}

export interface AiMessage {
  sender: 'user' | 'ai';
  text: string;
  actions?: AgentAction[];
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface AgentAction {
  toolName: 'addTask' | 'toggleTask' | 'deleteTask' | 'setFocus' | 'startTimer' | 'pauseTimer' | 'resetTimer' | 'setReminder' | 'cancelReminder' | 'breakdownTask' | 'addJournalEntry';
  args: { [key: string]: any };
}

export interface AgentResponse {
  actions: AgentAction[];
  responseText: string;
}

export interface PinnedItem {
  id: number;
  prompt: string;
  response: string;
  sources?: any[];
}

export interface AppContext {
  tasks: Task[];
  notes: string;
  focus: string;
  pomodoroState: {
    durations: { work: number; short: number; long: number; };
    mode: PomodoroMode;
    isActive: boolean;
    cycles: number;
  };
  journalEntries: JournalEntry[];
  pinnedItems: PinnedItem[];
  onSaveTask: (task: Partial<Task>) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onSetFocus: (focus: string) => void;
  onUpdateNotes: (notes: string | ((prevNotes: string) => string)) => void;
  onPomodoroAction: (action: 'start' | 'pause' | 'reset' | 'switch') => void;
  onUpdatePomodoroSettings: (durations: { work: number; short: number; long: number; }) => void;
  onCancelReminder: (taskId: number) => void;
  onUpdateJournalEntry: (date: string, content: string) => void;
  onPinItem: (item: Omit<PinnedItem, 'id'>) => void;
  onUnpinItem: (id: number) => void;
}