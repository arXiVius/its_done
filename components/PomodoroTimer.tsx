
import React, { useState, useEffect } from 'react';
import { PomodoroMode } from '../types';
import Widget from './Widget';

const PomodoroSettingsModal: React.FC<{
    onClose: () => void;
    onSave: (settings: { work: number; short: number; long: number; }) => void;
    initialDurations: { work: number; short: number; long: number; };
}> = ({ onClose, onSave, initialDurations }) => {
    const [durations, setDurations] = useState(initialDurations);

    const handleSave = () => {
        onSave(durations);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDurations(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-color)', border: '2px solid var(--text-color)'}}>
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'var(--font-heading)'}}>Timer Settings</h3>
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block mb-1 font-bold">Work (minutes)</label>
                        <input type="number" name="work" value={durations.work} onChange={handleChange} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }} />
                    </div>
                    <div>
                        <label className="block mb-1 font-bold">Short Break (minutes)</label>
                        <input type="number" name="short" value={durations.short} onChange={handleChange} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }} />
                    </div>
                    <div>
                        <label className="block mb-1 font-bold">Long Break (minutes)</label>
                        <input type="number" name="long" value={durations.long} onChange={handleChange} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }} />
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="p-2 border-2 font-bold w-24 rounded-md" style={{ borderColor: 'var(--text-color)' }}>Cancel</button>
                    <button onClick={handleSave} className="p-2 border-2 font-bold w-24 rounded-md" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)', borderColor: 'var(--text-color)' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

interface PomodoroTimerProps {
    state: {
        durations: { work: number; short: number; long: number; };
        mode: PomodoroMode;
        isActive: boolean;
        cycles: number;
    };
    onAction: (action: 'start' | 'pause' | 'reset' | 'switch') => void;
    onUpdateSettings: (durations: { work: number; short: number; long: number; }) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ state, onAction, onUpdateSettings }) => {
    const { durations, mode, isActive, cycles } = state;
    
    const getInitialTime = () => {
        if (mode === 'work') return durations.work * 60;
        if (mode === 'shortBreak') return durations.short * 60;
        return durations.long * 60;
    };
    
    const [timeRemaining, setTimeRemaining] = useState(getInitialTime());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    useEffect(() => {
        setTimeRemaining(getInitialTime());
    }, [mode, durations]);

    const handleSaveSettings = (newDurations: { work: number; short: number; long: number; }) => {
        onUpdateSettings(newDurations);
        setIsSettingsOpen(false);
        if (!isActive) {
           if (mode === 'work') setTimeRemaining(newDurations.work * 60);
           else if (mode === 'shortBreak') setTimeRemaining(newDurations.short * 60);
           else setTimeRemaining(newDurations.long * 60);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining <= 0 && isActive) {
            onAction('switch');
            if ('Notification' in window && Notification.permission === "granted") {
                new Notification("it's_done. Timer", { body: `${getModeName(mode)} session complete!` });
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeRemaining, onAction]);

    const getModeName = (m: PomodoroMode) => {
        if (m === 'work') return 'Work';
        if (m === 'shortBreak') return 'Short Break';
        return 'Long Break';
    }

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const progress = timeRemaining / getInitialTime();
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <Widget title="Pomodoro Timer" actions={
            <button onClick={() => setIsSettingsOpen(true)} className="p-1 border-2 rounded-md" title="Settings">
                ⚙️
            </button>
        }>
            {isSettingsOpen && <PomodoroSettingsModal onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings} initialDurations={durations} />}
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative w-52 h-52 mb-6">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                        {/* Background Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke="var(--text-color)"
                            strokeWidth="10"
                            strokeOpacity="0.2"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke="var(--accent-color)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-5xl font-bold" style={{fontFamily: 'monospace'}}>{formatTime(timeRemaining)}</p>
                        <p className="text-lg font-bold opacity-80">{getModeName(mode)}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                <button
                    onClick={() => onAction(isActive ? 'pause' : 'start')}
                    className="p-3 font-bold w-32 rounded-lg text-lg transform transition-transform duration-200 hover:scale-105"
                    style={{ 
                    backgroundColor: 'var(--accent-color)', 
                    color: 'var(--bg-color)',
                    boxShadow: '4px 4px 0px var(--text-color)',
                    border: '2px solid var(--text-color)'
                    }}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={() => {
                        onAction('reset');
                        setTimeRemaining(getInitialTime());
                    }}
                    className="p-3 font-bold w-24 rounded-lg text-lg transform transition-transform duration-200 hover:scale-105"
                    style={{ 
                        borderColor: 'var(--text-color)', 
                        borderWidth: '2px', 
                        backgroundColor: 'var(--bg-color)' 
                    }}
                >
                    Reset
                </button>
                </div>
                <p className="mt-6 font-bold">Completed cycles: {cycles}</p>
            </div>
        </Widget>
    );
};

export default PomodoroTimer;
