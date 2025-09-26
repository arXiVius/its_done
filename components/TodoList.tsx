import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types';
import Widget from './Widget';

const priorityColors: Record<'Low' | 'Medium' | 'High', string> = {
    High: '#E53E3E',
    Medium: '#DD6B20',
    Low: '#38A169',
};

const TaskModal: React.FC<{
    task: Partial<Task> | null;
    onSave: (task: Partial<Task>) => void;
    onClose: () => void;
}> = ({ task, onSave, onClose }) => {
    const [text, setText] = useState(task?.text || '');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [reminderTime, setReminderTime] = useState(task?.reminderTime || '');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(task?.priority || 'Medium');
    const [category, setCategory] = useState(task?.category || '');
    
    const handleSave = () => {
        if (text.trim() === '') return;
        onSave({ ...task, text, dueDate, reminderTime, priority, category: category.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-color)', border: '2px solid var(--text-color)'}}>
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'var(--font-heading)'}}>{task?.id ? 'Edit Task' : 'New Task'}</h3>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Task description..."
                    className="w-full p-2 bg-transparent border-2 rounded-md mb-4 resize-y focus:outline-none"
                    style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)', minHeight: '100px' }}
                    rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-bold">Priority</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-bold">Category</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Work" className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }} />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-bold">Due Date</label>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none"
                        style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }}
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-1 font-bold">Reminder</label>
                    <input
                        type="datetime-local"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none"
                        style={{ borderColor: 'var(--text-color)', color: 'var(--text-color)' }}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="p-2 border-2 font-bold w-24 rounded-md" style={{ borderColor: 'var(--text-color)' }}>Cancel</button>
                    <button onClick={handleSave} className="p-2 border-2 font-bold w-24 rounded-md" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)', borderColor: 'var(--text-color)' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

interface TodoListProps {
    tasks: Task[];
    onSaveTask: (task: Partial<Task>) => void;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onSaveTask, onToggleTask, onDeleteTask }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [reminderTimeouts, setReminderTimeouts] = useState<Record<number, number>>({});
    const [sortOrder, setSortOrder] = useState('default');
    const [filterCategory, setFilterCategory] = useState('all');

    const requestNotificationPermission = useCallback(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);
    
    const categories = useMemo(() => ['all', ...Array.from(new Set(tasks.flatMap(t => t.category ? [t.category] : [])))], [tasks]);
    
    const displayedTasks = useMemo(() => {
        let processedTasks = [...tasks];
        
        if (filterCategory !== 'all') {
            processedTasks = processedTasks.filter(t => t.category === filterCategory);
        }

        switch (sortOrder) {
            case 'dueDateAsc':
                processedTasks.sort((a, b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : a.dueDate ? -1 : 1);
                break;
            case 'dueDateDesc':
                processedTasks.sort((a, b) => (a.dueDate && b.dueDate) ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime() : a.dueDate ? -1 : 1);
                break;
            case 'alpha':
                processedTasks.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'priority':
                const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                processedTasks.sort((a, b) => (priorityOrder[a.priority || 'Medium'] || 3) - (priorityOrder[b.priority || 'Medium'] || 3));
                break;
            default:
                break;
        }
        
        return processedTasks;
    }, [tasks, sortOrder, filterCategory]);

    const scheduleReminder = useCallback((task: Task) => {
        if (task.reminderTime && !task.completed) {
            const reminderDate = new Date(task.reminderTime);
            const now = new Date();
            if (reminderDate > now) {
                const delay = reminderDate.getTime() - now.getTime();
                const timeoutId = setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification("it's_done. Reminder", { body: task.text });
                    }
                }, delay);
                return timeoutId;
            }
        }
        return null;
    }, []);

    useEffect(() => {
        try {
            Object.values(reminderTimeouts).forEach(clearTimeout);
            const newTimeouts: Record<number, number> = {};

            tasks.forEach(task => {
                const timeoutId = scheduleReminder(task);
                if (timeoutId) {
                    newTimeouts[task.id] = timeoutId;
                }
            });
            setReminderTimeouts(newTimeouts);

        } catch (error) {
            console.error("Failed to schedule reminders", error);
        }

        return () => {
            Object.values(reminderTimeouts).forEach(clearTimeout);
        };
    }, [tasks, scheduleReminder]);

    const handleSaveTask = (taskData: Partial<Task>) => {
        if (taskData.reminderTime) requestNotificationPermission();
        onSaveTask(taskData);
        setIsModalOpen(false);
        setEditingTask(null);
    };
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <Widget title="Tasks" className="lg:col-span-2" actions={
            <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="p-2 border-2 font-bold rounded-md" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)', borderColor: 'var(--text-color)' }}>
                Add Task
            </button>
        }>
            {isModalOpen && <TaskModal task={editingTask} onSave={handleSaveTask} onClose={() => setIsModalOpen(false)} />}
            <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold mb-1">Filter by Category</label>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{borderColor: 'var(--text-color)'}}>
                            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold mb-1">Sort by</label>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-2 bg-transparent border-2 rounded-md focus:outline-none" style={{borderColor: 'var(--text-color)'}}>
                            <option value="default">Default</option>
                            <option value="priority">Priority</option>
                            <option value="dueDateAsc">Due Date (Oldest)</option>
                            <option value="dueDateDesc">Due Date (Newest)</option>
                            <option value="alpha">Alphabetical</option>
                        </select>
                    </div>
                </div>

                <ul className="space-y-3 flex-grow overflow-y-auto pr-2" style={{maxHeight: '400px'}}>
                    {displayedTasks.length > 0 ? displayedTasks.map(task => (
                        <li key={task.id} className="flex items-start justify-between gap-3 p-3 border-b-2" style={{ borderColor: 'var(--text-color)' }}>
                           <div className="flex items-start flex-grow">
                                <div className="w-3 h-3 rounded-full mr-3 mt-1.5 flex-shrink-0" title={`Priority: ${task.priority}`} style={{ backgroundColor: priorityColors[task.priority || 'Medium'] }}></div>
                                <div className="flex-grow">
                                    <span onClick={() => onToggleTask(task.id)} className="cursor-pointer" style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}>
                                        {task.text}
                                    </span>
                                    <div className="text-xs mt-1 flex items-center flex-wrap gap-x-3 gap-y-1" style={{ opacity: 0.8 }}>
                                        {task.category && <span className="px-2 py-0.5 rounded-full" style={{backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)'}}>{task.category}</span>}
                                        {task.dueDate && <span>📅 Due: {formatDate(task.dueDate)}</span>}
                                        {task.reminderTime && <span>🔔 Reminder: {formatDate(task.reminderTime)}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="text-sm">✏️</button>
                                <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                            </div>
                        </li>
                    )) : <p className="text-center p-4">No tasks yet. Add one to get started!</p>}
                </ul>
            </div>
        </Widget>
    );
};

export default TodoList;