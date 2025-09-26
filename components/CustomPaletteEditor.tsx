import React, { useState } from 'react';
import { Palette } from '../types';

interface CustomPaletteEditorProps {
    onClose: () => void;
    onSave: (palette: { light: Palette, dark: Palette }) => void;
    currentPalette: { light: Palette, dark: Palette } | null;
    isDarkMode: boolean;
}

const defaultPalette = {
    light: { bg: '#FFFFFF', text: '#1A202C', accent: '#5A67D8' },
    dark: { bg: '#1A202C', text: '#FFFFFF', accent: '#ACB3EB' }
}

const CustomPaletteEditor: React.FC<CustomPaletteEditorProps> = ({ onClose, onSave, currentPalette, isDarkMode }) => {
    const [palette, setPalette] = useState(currentPalette || defaultPalette);

    const handleChange = (mode: 'light' | 'dark', key: keyof Palette, value: string) => {
        setPalette(prev => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [key]: value,
            }
        }));
    };
    
    const currentPreviewPalette = isDarkMode ? palette.dark : palette.light;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl p-6 rounded-xl flex flex-col" style={{ backgroundColor: 'var(--bg-color)', border: '2px solid var(--text-color)', maxHeight: '90vh' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Custom Palette</h3>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                
                <div className="flex-grow grid md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Config Section */}
                    <div className="space-y-6">
                        {/* Light Mode */}
                        <div>
                            <h4 className="text-xl font-bold mb-2">Light Mode</h4>
                            <div className="space-y-2">
                                {Object.keys(palette.light).map(key => (
                                    <div key={`light-${key}`} className="flex items-center justify-between">
                                        <label className="capitalize">{key} Color</label>
                                        <input type="color" value={palette.light[key as keyof Palette]} onChange={(e) => handleChange('light', key as keyof Palette, e.target.value)} className="w-24 p-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Dark Mode */}
                        <div>
                            <h4 className="text-xl font-bold mb-2">Dark Mode</h4>
                            <div className="space-y-2">
                                {Object.keys(palette.dark).map(key => (
                                    <div key={`dark-${key}`} className="flex items-center justify-between">
                                        <label className="capitalize">{key} Color</label>
                                        <input type="color" value={palette.dark[key as keyof Palette]} onChange={(e) => handleChange('dark', key as keyof Palette, e.target.value)} className="w-24 p-1"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview Section */}
                    <div className="flex flex-col rounded-lg p-4" style={{ backgroundColor: currentPreviewPalette.bg, border: `2px solid ${currentPreviewPalette.text}`}}>
                        <h4 className="text-xl font-bold mb-4" style={{ color: currentPreviewPalette.text, fontFamily: "'Inter', sans-serif" }}>Live Preview ({isDarkMode ? 'Dark' : 'Light'})</h4>
                        <div className="flex-grow space-y-4">
                            <p style={{ color: currentPreviewPalette.text }}>This is how body text will look.</p>
                            <h5 className="text-2xl font-bold" style={{ color: currentPreviewPalette.accent, fontFamily: "'Poppins', sans-serif" }}>This is an accent heading.</h5>
                            <button className="p-2 font-bold rounded-md" style={{ backgroundColor: currentPreviewPalette.accent, color: currentPreviewPalette.bg, border: `2px solid ${currentPreviewPalette.text}`}}>
                                Button
                            </button>
                            <div className="p-2 rounded-md" style={{ border: `2px solid ${currentPreviewPalette.text}` }}>
                                <p style={{color: currentPreviewPalette.text}}>A bordered container.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t-2" style={{borderColor: 'var(--text-color)'}}>
                    <button onClick={() => setPalette(defaultPalette)} className="p-2 border-2 font-bold rounded-md" style={{ borderColor: 'var(--text-color)' }}>Reset Defaults</button>
                    <button onClick={() => onSave(palette)} className="p-2 border-2 font-bold w-24 rounded-md" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--bg-color)', borderColor: 'var(--text-color)' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default CustomPaletteEditor;
