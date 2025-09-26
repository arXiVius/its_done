import React from 'react';
import Widget from './Widget';
import { AppContext } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface PinnedResearchWidgetProps {
    appContext: AppContext;
}

const PinnedResearchWidget: React.FC<PinnedResearchWidgetProps> = ({ appContext }) => {
    const { pinnedItems, onUnpinItem } = appContext;
    return (
        <Widget title="Pinned Research">
            <div className="flex flex-col h-full">
                {pinnedItems.length === 0 ? (
                    <div className="text-center p-4 h-full flex items-center justify-center" style={{ opacity: 0.7 }}>
                        Pin important findings from the Research Agent to see them here.
                    </div>
                ) : (
                    <ul className="space-y-3 flex-grow overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                        {pinnedItems.map(item => (
                            <li key={item.id} className="p-3 border-2 rounded-md" style={{ borderColor: 'var(--text-color)' }}>
                                <details>
                                    <summary className="font-bold cursor-pointer hover:opacity-80">
                                        {item.prompt}
                                    </summary>
                                    <div className="mt-3 pt-3 border-t-2" style={{ borderColor: 'var(--text-color)' }}>
                                        <MarkdownRenderer content={item.response} />
                                        {item.sources && item.sources.length > 0 && (
                                            <div className="mt-3">
                                                <h4 className="font-bold text-sm">Sources:</h4>
                                                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                                    {item.sources.map((source, i) => (
                                                        <li key={i}>
                                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75" title={source.web.title}>
                                                                {source.web.title || new URL(source.web.uri).hostname}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="text-right mt-3">
                                            <button onClick={() => onUnpinItem(item.id)} className="text-sm font-bold" style={{color: 'var(--accent-color)'}}>
                                                Unpin
                                            </button>
                                        </div>
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Widget>
    );
};

export default PinnedResearchWidget;