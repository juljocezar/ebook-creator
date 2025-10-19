// src/components/Editor.tsx
import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import localforage from 'localforage';
import { Document } from '../types';

const Editor: React.FC = () => {
  const { documentIds } = useParams<{ documentIds: string }>();
  const { status, chapterStructure, error, setDocuments, startAnalysis, analysisSuccess, analysisError } = useEditorStore();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize the worker
    workerRef.current = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { status: workerStatus, data, error: workerError } = event.data;
      if (workerStatus === 'success') {
        analysisSuccess(data);
      } else if (workerStatus === 'error') {
        analysisError(workerError);
      }
    };

    const fetchDocuments = async () => {
      if (documentIds) {
        const ids = documentIds.split(',');
        const docs = await Promise.all(
          ids.map(id => localforage.getItem<Document>(id))
        );
        setDocuments(docs.filter((doc): doc is Document => doc !== null));
      }
    };
    fetchDocuments();

    // Cleanup worker on component unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, [documentIds, setDocuments, analysisSuccess, analysisError]);

  const handleStartAnalysis = () => {
    if (documentIds) {
      startAnalysis();
      workerRef.current?.postMessage({ documentIds: documentIds.split(',') });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Panel: Agent Controls */}
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">AI Agents</h2>
        <button
          onClick={handleStartAnalysis}
          disabled={status === 'loading'}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:bg-gray-500"
        >
          {status === 'loading' ? 'Analyzing...' : 'Generate Chapter Structure'}
        </button>
        <Link to="/" className="text-blue-400 hover:underline mt-4 inline-block">&larr; Back to Dashboard</Link>
      </div>

      {/* Middle Panel: eBook Preview */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">eBook Preview</h2>
        <div className="bg-white text-black p-4 rounded-md min-h-[80vh]">
          <p>The WYSIWYG editor or Markdown preview will be rendered here.</p>
        </div>
      </div>

      {/* Right Panel: Chat & Process Log */}
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Process Log</h2>
        <div className="bg-gray-700 p-2 rounded-md h-[80vh] overflow-y-auto">
          {status === 'idle' && <p className="text-sm text-gray-400">Ready to start analysis.</p>}
          {status === 'loading' && <p className="text-sm text-blue-400">Processing... Please wait.</p>}
          {status === 'error' && <p className="text-sm text-red-400">Error: {error}</p>}
          {status === 'success' && chapterStructure && (
            <div>
              <h3 className="font-bold text-lg mb-2">Generated Chapters:</h3>
              <ul className="list-disc list-inside">
                {chapterStructure.map((chapter, index) => (
                  <li key={index} className="mb-2">
                    <strong>{chapter.title}</strong>: {chapter.summary}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
