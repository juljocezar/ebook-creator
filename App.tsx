// FIX: Implemented the main App component to manage application state, documents, and views.
import React, { useState, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { EditorView } from './components/EditorView';
import type { ManagedDocument, EnhancementOptions, WritingStyle, TopicSuggestion, DocumentTemplate } from './types';
import { useIndexedDB } from './hooks/useIndexedDB';
import { analyzeDocumentPool } from './services/geminiService';
import { Spinner } from './components/ui/Spinner';


// A simple unique ID generator
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const App: React.FC = () => {
  // FIX: Corrected the generic type for useIndexedDB to be the item type (ManagedDocument), not an array of the item type (ManagedDocument[]).
  const [documents, setDocuments, isDocumentsLoading] = useIndexedDB<ManagedDocument>('documents');
  // FIX: Corrected the generic type for useIndexedDB to be the item type (DocumentTemplate), not an array of the item type (DocumentTemplate[]).
  const [templates, setTemplates, isTemplatesLoading] = useIndexedDB<DocumentTemplate>('templates');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [isAnalyzingPool, setIsAnalyzingPool] = useState(false);
  
  const [templateToApply, setTemplateToApply] = useState<DocumentTemplate | null>(null);

  const handleAddDocuments = useCallback((files: FileList) => {
    const newDocs: ManagedDocument[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string || '';
        newDocs.push({
          id: generateId(),
          name: file.name,
          content,
          createdAt: new Date().toISOString(),
          analysis: null,
          ebook: null,
          tags: [],
          history: [],
        });
        if (newDocs.length === files.length) {
            setDocuments(prev => [...prev, ...newDocs]);
        }
      };
      reader.readAsText(file);
    });
  }, [setDocuments]);

  const handleCreateBlankDocument = useCallback(() => {
    const newDoc: ManagedDocument = {
      id: generateId(),
      name: 'Unbenanntes Dokument',
      content: '',
      createdAt: new Date().toISOString(),
      analysis: null,
      ebook: null,
      tags: [],
      history: [],
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  }, [setDocuments]);
  
  const handleDeleteDocument = useCallback((id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  }, [setDocuments]);
  
  const handleUpdateAndSave = useCallback((updatedDoc: ManagedDocument) => {
    setDocuments(docs => docs.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
  }, [setDocuments]);
  
  const handleAnalyzePool = async () => {
    setIsAnalyzingPool(true);
    try {
        const suggestions = await analyzeDocumentPool(documents.map(d => ({id: d.id, name: d.name, content: d.content})));
        setTopicSuggestions(suggestions);
    } catch (error) {
        console.error("Failed to analyze pool:", error);
        alert("Fehler bei der Analyse des Dokumentenpools.");
    } finally {
        setIsAnalyzingPool(false);
    }
  };
  
  const handleCreateFromSuggestion = useCallback((suggestion: TopicSuggestion) => {
      // For a real implementation, you would fetch content from sourceDocIds
      const newDoc: ManagedDocument = {
          id: generateId(),
          name: suggestion.title,
          content: `Dieses Dokument wurde automatisch basierend auf dem Vorschlag erstellt: "${suggestion.description}".\n\nBeginnen Sie hier mit dem Schreiben...`,
          createdAt: new Date().toISOString(),
          analysis: null,
          ebook: null,
          tags: ['AI-Vorschlag'],
          history: [],
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocumentId(newDoc.id);
  }, [setDocuments]);
  
  const handleSaveAsTemplate = useCallback((content: string, options: EnhancementOptions, writingStyle: WritingStyle) => {
    const name = prompt("Geben Sie einen Namen für diese Vorlage ein:", "Meine eBook-Vorlage");
    const description = prompt("Geben Sie eine kurze Beschreibung für diese Vorlage ein:", "");
    if (name) {
        const newTemplate: DocumentTemplate = {
            id: generateId(),
            name,
            description: description || "",
            content,
            options,
            writingStyle
        };
        setTemplates(prev => [...prev, newTemplate]);
        alert(`Vorlage "${name}" gespeichert!`);
    }
  }, [setTemplates]);

  const handleCreateFromTemplate = useCallback((template: DocumentTemplate) => {
    const newDoc: ManagedDocument = {
        id: generateId(),
        name: `Von: ${template.name}`,
        content: template.content,
        createdAt: new Date().toISOString(),
        analysis: null,
        ebook: null,
        tags: ['aus-vorlage'],
        history: [],
    };
    setDocuments(prev => [newDoc, ...prev]);
    setTemplateToApply(template); // Flag to apply template settings in EditorView
    setActiveDocumentId(newDoc.id);
  }, [setDocuments]);
  
  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [setTemplates]);


  const activeDocument = useMemo(() => {
    return documents.find(doc => doc.id === activeDocumentId);
  }, [documents, activeDocumentId]);

  if (isDocumentsLoading || isTemplatesLoading) {
    return (
        <main className="flex items-center justify-center h-screen bg-slate-900 text-slate-200">
            <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p className="text-slate-300">Lade Bibliothek...</p>
            </div>
        </main>
    );
  }

  if (activeDocument) {
    return (
      <main className="bg-slate-900 text-slate-200 h-screen font-sans">
        <EditorView 
          document={activeDocument}
          onBack={() => setActiveDocumentId(null)}
          onUpdateAndSave={handleUpdateAndSave}
          onSaveAsTemplate={handleSaveAsTemplate}
          templateToApply={templateToApply}
          onTemplateApplied={() => setTemplateToApply(null)}
        />
      </main>
    );
  }

  return (
    <main className="bg-slate-900 text-slate-200 min-h-screen font-sans">
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-100">
                    AI eBook Orchestrator
                </h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                    Verwandeln Sie Ihre Dokumente in professionelle eBooks mit einem Team von spezialisierten KI-Agenten.
                </p>
            </header>
            <Dashboard 
                documents={documents}
                onAddDocuments={handleAddDocuments}
                onCreateBlankDocument={handleCreateBlankDocument}
                onDeleteDocument={handleDeleteDocument}
                onProcessDocument={(id) => setActiveDocumentId(id)}
                topicSuggestions={topicSuggestions}
                onAnalyzePool={handleAnalyzePool}
                isAnalyzingPool={isAnalyzingPool}
                onCreateFromSuggestion={handleCreateFromSuggestion}
                templates={templates}
                onCreateFromTemplate={handleCreateFromTemplate}
                onDeleteTemplate={handleDeleteTemplate}
            />
        </div>
    </main>
  );
};

export default App;