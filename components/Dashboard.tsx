
import React, { useRef, useState, useMemo } from 'react';
import type { ManagedDocument, TopicSuggestion, DocumentTemplate } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { Spinner } from './ui/Spinner';

interface DashboardProps {
  documents: ManagedDocument[];
  onAddDocuments: (files: FileList) => void;
  onCreateBlankDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onProcessDocument: (id: string) => void;
  topicSuggestions: TopicSuggestion[];
  onAnalyzePool: () => void;
  isAnalyzingPool: boolean;
  onCreateFromSuggestion: (suggestion: TopicSuggestion) => void;
  templates: DocumentTemplate[];
  onCreateFromTemplate: (template: DocumentTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  documents, 
  onAddDocuments,
  onCreateBlankDocument,
  onDeleteDocument, 
  onProcessDocument,
  topicSuggestions,
  onAnalyzePool,
  isAnalyzingPool,
  onCreateFromSuggestion,
  templates,
  onCreateFromTemplate,
  onDeleteTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [templatesCollapsed, setTemplatesCollapsed] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onAddDocuments(event.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    const lowercasedFilter = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(lowercasedFilter) ||
      doc.content.toLowerCase().includes(lowercasedFilter) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter)))
    );
  }, [documents, searchTerm]);

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-center p-8 space-y-4 md:space-y-0 md:space-x-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-100">Dokument hinzufügen</h2>
            <p className="text-slate-400 max-w-lg">
              Laden Sie Dateien (.txt, .md, .docx, .pdf) hoch oder beginnen Sie mit einem leeren Dokument.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => fileInputRef.current?.click()} className="text-lg py-3 px-6">
                <UploadIcon className="w-5 h-5" />
                <span>Dateien hochladen</span>
            </Button>
            <Button onClick={onCreateBlankDocument} variant="secondary" className="text-lg py-3 px-6">
                Neues leeres Dokument
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.docx,.pdf"
            className="hidden"
            multiple
          />
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100">KI-Analyse des Dokumentenpools</h2>
        <Card>
            <div className="flex flex-col items-center justify-center p-6 space-y-3">
                <p className="text-slate-300 text-center max-w-2xl">
                    Lassen Sie den KI-Orchestrator Ihre gesamte Bibliothek analysieren, um thematische Überschneidungen zu finden und neue, innovative eBook-Konzepte vorzuschlagen, die Inhalte aus mehreren Dokumenten kombinieren.
                </p>
                <Button onClick={onAnalyzePool} disabled={isAnalyzingPool || documents.length < 2}>
                    {isAnalyzingPool ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
                    <span>{isAnalyzingPool ? 'Analysiere...' : 'Dokumentenpool analysieren'}</span>
                </Button>
                {documents.length < 2 && <p className="text-xs text-slate-500">Für eine Analyse werden mindestens 2 Dokumente benötigt.</p>}
            </div>
            {topicSuggestions.length > 0 && (
                <div className="p-4 border-t border-slate-700">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-300">eBook-Vorschläge:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topicSuggestions.map(suggestion => (
                            <Card key={suggestion.title} className="bg-slate-800 flex flex-col">
                                <h4 className="font-bold text-slate-100">{suggestion.title}</h4>
                                <p className="text-sm text-slate-400 mt-1 flex-grow">{suggestion.description}</p>
                                <Button onClick={() => onCreateFromSuggestion(suggestion)} variant="secondary" className="w-full mt-4">
                                    Entwurf erstellen
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Ihre Vorlagen</h2>
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col justify-between bg-slate-800/70 border-indigo-500/30">
                <div>
                  <h3 className="font-bold text-lg text-indigo-200 truncate mb-1" title={template.name}>{template.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3">{template.description || "Keine Beschreibung..."}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                    <Button variant="secondary" onClick={() => onCreateFromTemplate(template)}>
                        <SparklesIcon className="w-4 h-4" />
                        Dokument erstellen
                    </Button>
                    <button 
                        onClick={() => onDeleteTemplate(template.id)} 
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        aria-label="Vorlage löschen"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 bg-slate-800/30 rounded-lg">
            <h3 className="text-xl font-semibold">Keine Vorlagen gefunden</h3>
            <p className="mt-1">Speichern Sie ein Dokument als Vorlage im Editor, um hier zu beginnen.</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-100">Ihre Dokumentenbibliothek</h2>
            <input 
                type="text"
                placeholder="Bibliothek durchsuchen..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-xs p-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-300"
            />
        </div>
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 truncate mb-1" title={doc.name}>{doc.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">
                    Erstellt: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                   {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {doc.tags.map(tag => (
                            <span key={tag} className="text-xs bg-slate-700 text-indigo-300 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                  )}
                  <p className="text-sm text-slate-300 line-clamp-3">{doc.content.substring(0, 100) || "Kein Inhalt..."}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                    <Button variant="primary" onClick={() => onProcessDocument(doc.id)}>
                        <SparklesIcon className="w-4 h-4" />
                        {doc.ebook ? 'Bearbeiten' : 'Verarbeiten'}
                    </Button>
                    <button 
                        onClick={() => onDeleteDocument(doc.id)} 
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        aria-label="Dokument löschen"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-800/30 rounded-lg">
            <BookOpenIcon className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">{searchTerm ? 'Keine Dokumente gefunden' : 'Ihre Bibliothek ist leer'}</h3>
            <p className="mt-1">{searchTerm ? 'Versuchen Sie einen anderen Suchbegriff.' : 'Laden Sie ein Dokument hoch, um zu beginnen.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
