
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
