

import React, { useState, useCallback } from 'react';
import type { ManagedDocument, EnhancementOptions, DocumentAnalysis, GeneratedEbook, WritingStyle, ChatMessage, DocumentTemplate } from '../types';
import { analyzeDocument, generateEbook, chatWithAssistant } from '../services/geminiService';
import { ControlPanel } from './ControlPanel';
import { EditorPanel } from './EditorPanel';
import { DashboardPanel } from './DashboardPanel';
import { AssistantPanel } from './AssistantPanel';
import { Button } from './ui/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ClipboardPlusIcon } from './icons/ClipboardPlusIcon';

interface EditorViewProps {
  document: ManagedDocument;
  onUpdateAndSave: (document: ManagedDocument) => void;
  onBack: () => void;
  onSaveAsTemplate: (docContent: string, options: EnhancementOptions, style: WritingStyle) => void;
  templateToApply: DocumentTemplate | null;
  onTemplateApplied: () => void;
}

type Selection = {
    text: string;
    start: number;
    end: number;
} | null;

const initialOptions: EnhancementOptions = {
    proofread: true,
    coverPage: true,
    tableOfContents: true,
    glossary: true,
    citations: false,
    index: true,
};

export const EditorView: React.FC<EditorViewProps> = ({ document, onUpdateAndSave, onBack, onSaveAsTemplate, templateToApply, onTemplateApplied }) => {
  const [documentText, setDocumentText] = useState(document.content);
  const [docName, setDocName] = useState(document.name);
  const [isLoading, setIsLoading] = useState(false);
  
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<Selection>(null);

  const [options, setOptions] = useState<EnhancementOptions>(() => templateToApply ? templateToApply.options : initialOptions);
  const [writingStyle, setWritingStyle] = useState<WritingStyle>(() => templateToApply ? templateToApply.writingStyle : 'neutral');

  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(document.analysis);
  const [ebook, setEbook] = useState<GeneratedEbook | null>(document.ebook);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(document.history.length);
  
  const [activeTab, setActiveTab] = useState<'analyse' | 'assistent'>('assistent');
  
  React.useEffect(() => {
    // When the view is shown with a template, we apply it and then clear the flag
    // so it doesn't re-apply on subsequent renders.
    if (templateToApply) {
        onTemplateApplied();
    }
  }, [templateToApply, onTemplateApplied]);

  const addAssistantMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
      const newMessage: ChatMessage = {
          id: `${role}-${Date.now()}`,
          role: role,
          content: content,
          timestamp: new Date().toISOString(),
      };
      setAssistantMessages(prev => [...prev, newMessage]);
  };
  
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setAssistantMessages([]); // Clear previous messages
    addAssistantMessage('system', "Orchestrator wird gestartet...");
    
    try {
      const onProgress = (message: string) => {
        addAssistantMessage('system', message);
      };

      onProgress("Agent 'Analyst' analysiert das Dokument...");
      const docAnalysis = await analyzeDocument(documentText);
      setAnalysis(docAnalysis);

      const generatedEbook = await generateEbook(documentText, options, writingStyle, onProgress);
      setEbook(generatedEbook);
      
      const newVersion = {
          savedAt: new Date().toISOString(),
          ebook: generatedEbook,
          analysis: docAnalysis
      };

      const updatedDocument: ManagedDocument = {
        ...document,
        name: docName,
        content: documentText,
        analysis: docAnalysis,
        ebook: generatedEbook,
        tags: [...new Set([...document.tags, ...docAnalysis.tags])],
        history: [...document.history, newVersion]
      };
      onUpdateAndSave(updatedDocument);
      setCurrentVersionIndex(updatedDocument.history.length);
      
      addAssistantMessage('system', "eBook-Generierung erfolgreich abgeschlossen!");

    } catch (error) {
      console.error("eBook generation failed:", error);
      const errorMessage = `Fehler bei der eBook-Generierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
      addAssistantMessage('system', errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [document, documentText, options, writingStyle, docName, onUpdateAndSave]);

  const handleRestoreVersion = (index: number) => {
    if (index === document.history.length) { // Latest version
        setEbook(document.ebook);
        setAnalysis(document.analysis);
    } else {
        const version = document.history[index];
        setEbook(version.ebook);
        setAnalysis(version.analysis);
    }
    setCurrentVersionIndex(index);
    addAssistantMessage('system', `Version vom ${new Date(index === document.history.length ? document.createdAt : document.history[index].savedAt).toLocaleString()} wiederhergestellt.`);
  };
  
  const saveContent = () => {
      if (document.content !== documentText || document.name !== docName) {
        const updatedDoc = { ...document, content: documentText, name: docName };
        onUpdateAndSave(updatedDoc);
        addAssistantMessage('system', "Dokumentenänderungen wurden gespeichert.");
      }
  };

  const handleChatSubmit = useCallback(async (prompt: string, isEditingAction: boolean = false) => {
    addAssistantMessage('user', prompt);
    setIsAssistantLoading(true);

    try {
        const context = isEditingAction && selectedText ? selectedText.text : undefined;
        const responseText = await chatWithAssistant(assistantMessages, prompt, context);

        if (isEditingAction && selectedText) {
            const newText = documentText.substring(0, selectedText.start) + responseText + documentText.substring(selectedText.end);
            setDocumentText(newText);
            addAssistantMessage('system', `Textabschnitt wurde erfolgreich aktualisiert.`);
            setSelectedText(null);
        } else {
            addAssistantMessage('assistant', responseText);
        }
    } catch (error) {
        const errorMessage = `Fehler bei der Kommunikation mit dem Assistenten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
        addAssistantMessage('system', errorMessage);
    } finally {
        setIsAssistantLoading(false);
    }
  }, [assistantMessages, selectedText, documentText]);

  return (
    <div className="flex flex-col h-full max-h-screen">
      <header className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 shrink-0 gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </Button>
          <input 
            type="text" 
            value={docName} 
            onChange={(e) => setDocName(e.target.value)} 
            onBlur={saveContent}
            className="text-xl font-bold bg-transparent text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-2 py-1 truncate"
          />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => onSaveAsTemplate(documentText, options, writingStyle)}>
                <ClipboardPlusIcon className="w-5 h-5" />
                <span>Als Vorlage speichern</span>
            </Button>
            {document.history.length > 0 && (
                <div className="flex items-center gap-2">
                    <label htmlFor="version-history" className="text-sm font-medium text-slate-400">Version:</label>
                    <select 
                        id="version-history"
                        value={currentVersionIndex}
                        onChange={(e) => handleRestoreVersion(parseInt(e.target.value))}
                        className="bg-slate-700 border border-slate-600 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        {document.history.map((v, i) => (
                            <option key={v.savedAt} value={i}>
                                {new Date(v.savedAt).toLocaleString()}
                            </option>
                        ))}
                        <option value={document.history.length}>Aktueller Entwurf</option>
                    </select>
                </div>
            )}
        </div>
      </header>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-auto">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ControlPanel
            documentText={documentText}
            setDocumentText={setDocumentText}
            onSelectText={(text, start, end) => setSelectedText({ text, start, end })}
            options={options}
            setOptions={setOptions}
            writingStyle={writingStyle}
            setWritingStyle={setWritingStyle}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <EditorPanel ebook={ebook} />
        </div>
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="bg-slate-800/50 border border-b-0 border-slate-700 rounded-t-lg flex">
             <button 
                onClick={() => setActiveTab('assistent')}
                className={`flex-1 p-3 text-sm font-semibold text-center rounded-tl-lg transition-colors ${activeTab === 'assistent' ? 'bg-slate-800 text-indigo-300' : 'bg-transparent text-slate-400 hover:bg-slate-700/50'}`}
              >
                Schreib-Assistent
              </button>
              <button 
                onClick={() => setActiveTab('analyse')}
                className={`flex-1 p-3 text-sm font-semibold text-center rounded-tr-lg transition-colors ${activeTab === 'analyse' ? 'bg-slate-800 text-indigo-300' : 'bg-transparent text-slate-400 hover:bg-slate-700/50'}`}
              >
                Dokumentenanalyse
              </button>
          </div>
           {activeTab === 'assistent' ? (
              <AssistantPanel 
                messages={assistantMessages}
                onSubmit={handleChatSubmit}
                isLoading={isAssistantLoading}
                selectedText={selectedText?.text || null}
              />
           ) : (
             <DashboardPanel analysis={analysis} />
           )}
        </div>
      </div>
    </div>
  );
};