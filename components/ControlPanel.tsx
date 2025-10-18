import React from 'react';
import type { EnhancementOptions, WritingStyle } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Checkbox } from './ui/Checkbox';
import { Spinner } from './ui/Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlPanelProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  onSelectText: (text: string, start: number, end: number) => void;
  options: EnhancementOptions;
  setOptions: (options: EnhancementOptions) => void;
  writingStyle: WritingStyle;
  setWritingStyle: (style: WritingStyle) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  documentText,
  setDocumentText,
  onSelectText,
  options,
  setOptions,
  writingStyle,
  setWritingStyle,
  onGenerate,
  isLoading,
}) => {
  const handleOptionChange = (option: keyof EnhancementOptions, value: boolean) => {
    setOptions({ ...options, [option]: value });
  };
  
  const handleSelectionChange = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selection = target.value.substring(target.selectionStart, target.selectionEnd);
    if (selection) {
        onSelectText(selection, target.selectionStart, target.selectionEnd);
    }
  };

  const agentGroups: { title: string; agents: { key: keyof EnhancementOptions; label: string }[] }[] = [
    {
      title: 'Inhaltsanalyse & Erstellung',
      agents: [
        { key: 'coverPage', label: 'Titelbild-Konzept erstellen' },
        { key: 'tableOfContents', label: 'Inhaltsverzeichnis generieren' },
        { key: 'glossary', label: 'Glossar erstellen' },
        { key: 'index', label: 'Index erstellen' },
      ],
    },
    {
      title: 'Optimierung & Recherche',
      agents: [
        { key: 'proofread', label: 'Korrekturlesen & Stil verbessern' },
        { key: 'citations', label: 'Quellen recherchieren & zitieren' },
      ],
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-grow flex flex-col p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Dokumenteninhalt</h2>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            onSelect={handleSelectionChange}
            placeholder="Fügen Sie hier Ihren Dokumenteninhalt ein..."
            className="w-full h-64 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 resize-none"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Agenten-Steuerung</h3>
          <div className="space-y-4">
            <div>
                <label htmlFor="writing-style" className="block text-sm font-medium text-slate-300 mb-1">Agenten-Persona (Schreibstil)</label>
                <select 
                    id="writing-style"
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value as WritingStyle)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    <option value="neutral">Neutral & Informativ</option>
                    <option value="professionell">Professionell & Geschäftlich</option>
                    <option value="akademisch">Akademisch & Formell</option>
                    <option value="locker">Locker & Gesprächig</option>
                </select>
            </div>
            {agentGroups.map(group => (
                <div key={group.title}>
                    <h4 className="font-semibold text-slate-300 mb-2">{group.title}</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {group.agents.map(({ key, label }) => (
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
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-700 mt-auto">
        <Button onClick={onGenerate} disabled={isLoading || !documentText} className="w-full text-lg py-3">
          {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
          <span>{isLoading ? 'Agenten arbeiten...' : 'Orchestrator beauftragen'}</span>
        </Button>
      </div>
    </Card>
  );
};
