
import React from 'react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children, className = '', actions }) => {
  return (
    <div
      className={`flex flex-col h-full rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--bg-color)',
        border: '2px solid var(--text-color)',
        boxShadow: '6px 6px 0px var(--text-color)',
        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
      }}
    >
      <div 
        className="flex justify-between items-center p-4 border-b-2"
        style={{
          borderColor: 'var(--text-color)',
        }}
      >
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
          }}
        >
          {title}
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Widget;