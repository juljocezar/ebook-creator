import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface AssistantPanelProps {
  messages: ChatMessage[];
  onSubmit: (prompt: string, isEditingAction?: boolean) => void;
  isLoading: boolean;
  selectedText: string | null;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ messages, onSubmit, isLoading, selectedText }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (prompt: string, isEditingAction: boolean = false) => {
    if (!prompt.trim()) return;
    onSubmit(prompt, isEditingAction);
    setInput('');
  };

  const quickActions = [
    { label: 'Verbessern', prompt: 'Verbessere den folgenden Text:' },
    { label: 'Zusammenfassen', prompt: 'Fasse den folgenden Text zusammen:' },
    { label: 'Titel vorschlagen', prompt: 'Schlage 3 Titel für den folgenden Text vor:' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-b-lg border-t-0">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
            <SparklesIcon className="w-12 h-12 mb-2" />
            <p>Der Chat mit dem Assistenten und das Orchestrator-Protokoll erscheinen hier.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                { msg.role === 'system' ? (
                     <div className="text-center text-xs text-indigo-300/80 w-full py-1">
                        <p>{msg.content}</p>
                    </div>
                ) : (
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
       {selectedText && (
          <div className="p-3 border-t border-slate-700 bg-slate-900/50">
            <p className="text-xs text-slate-400 mb-2">Aktionen für ausgewählten Text:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                <Button 
                  key={action.label}
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                  onClick={() => handleSend(action.prompt, true)}
                  disabled={isLoading}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      <div className="p-4 border-t border-slate-700 mt-auto space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(input);
            }
          }}
          placeholder={selectedText ? "Aktion für Auswahl beschreiben..." : "Ihre Nachricht..."}
          className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300 resize-none"
          rows={2}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
                Tipp: Text im Editor markieren für kontextbezogene Aktionen.
            </p>
            <Button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
                {isLoading ? <Spinner /> : 'Senden'}
            </Button>
        </div>
      </div>
    </div>
  );
};
