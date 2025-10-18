import React from 'react';
import type { EnhancementOptions } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Checkbox } from './ui/Checkbox';
import { Spinner } from './ui/Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  options: EnhancementOptions;
  setOptions: (options: EnhancementOptions) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  documentText,
  setDocumentText,
  options,
  setOptions,
  onGenerate,
  isLoading,
}) => {
  const handleOptionChange = (option: keyof EnhancementOptions, value: boolean) => {
    setOptions({ ...options, [option]: value });
  };

  const enhancementOptions: { key: keyof EnhancementOptions; label: string }[] = [
    { key: 'proofread', label: 'Proofread & Enhance Style' },
    { key: 'coverPage', label: 'Generate Cover Page' },
    { key: 'tableOfContents', label: 'Create Table of Contents' },
    { key: 'glossary', label: 'Build Glossary' },
    { key: 'citations', label: 'Find & Add Citations' },
    { key: 'index', label: 'Generate Index' },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-grow flex flex-col p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Document Content</h2>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste your document content here, or use Markdown for headings (e.g., # Chapter 1)..."
            className="w-full h-64 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 resize-none"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-3">AI Enhancements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enhancementOptions.map(({ key, label }) => (
              <Checkbox
                key={key}
                name={key}
                label={label}
                checked={options[key]}
                onChange={(checked) => handleOptionChange(key, checked)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-700 mt-auto">
        <Button onClick={onGenerate} disabled={isLoading || !documentText} className="w-full text-lg py-3">
          {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
          <span>{isLoading ? 'Generating...' : 'Generate eBook'}</span>
        </Button>
      </div>
    </Card>
  );
};
