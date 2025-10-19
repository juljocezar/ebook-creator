// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';
import { Document } from '../types';
import localforage from 'localforage';

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Load documents from localforage on component mount
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

    // Save new documents to localforage
    for (const doc of newDocuments) {
      await localforage.setItem(doc.id, doc);
    }

    setDocuments(prevDocs => [...prevDocs, ...newDocuments]);
  };

  const handleDeleteDocument = async (id: string) => {
    await localforage.removeItem(id);
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">AI eBook Orchestrator</h1>
        <p className="text-gray-400">Manage your documents and orchestrate AI agents to create stunning eBooks.</p>
      </header>
      <main>
        <FileUpload onFilesUploaded={handleFilesUploaded} />
        <DocumentList documents={documents} onDelete={handleDeleteDocument} />
      </main>
    </div>
  );
};

export default Dashboard;
