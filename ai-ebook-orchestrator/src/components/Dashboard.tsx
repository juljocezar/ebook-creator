// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';
import { Document } from '../types';
import localforage from 'localforage';

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const loadDocuments = async () => {
      const keys = await localforage.keys();
      const docs = await Promise.all(
        keys.map(key => localforage.getItem<Document>(key))
      );
      setDocuments(docs.filter(doc => doc !== null) as Document[]);
    };
    loadDocuments();
  }, []);

  const handleFilesUploaded = async (files: Array<{ name: string; type: string; content: string; date: string }>) => {
    const newDocuments: Document[] = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random()}`,
      ...file,
      status: 'Uploaded',
    }));

    for (const doc of newDocuments) {
      await localforage.setItem(doc.id, doc);
    }
    setDocuments(prevDocs => [...prevDocs, ...newDocuments]);
  };

  const handleDeleteDocument = async (id: string) => {
    await localforage.removeItem(id);
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
    setSelectedDocs(prevSelected => {
      const newSelected = new Set(prevSelected);
      newSelected.delete(id);
      return newSelected;
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedDocs(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleStartAnalysis = () => {
    if (selectedDocs.size > 0) {
      const ids = Array.from(selectedDocs).join(',');
      navigate(`/editor/${ids}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">AI eBook Orchestrator</h1>
        <p className="text-gray-400">Manage your documents and orchestrate AI agents to create stunning eBooks.</p>
      </header>
      <main>
        <FileUpload onFilesUploaded={handleFilesUploaded} />
        <div className="my-8">
          <button
            onClick={handleStartAnalysis}
            disabled={selectedDocs.size === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Start AI Analysis ({selectedDocs.size} selected)
          </button>
        </div>
        <DocumentList
          documents={documents}
          selectedDocs={selectedDocs}
          onToggleSelect={handleToggleSelect}
          onDelete={handleDeleteDocument}
        />
      </main>
    </div>
  );
};

export default Dashboard;
