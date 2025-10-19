// src/components/Editor.tsx
import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import localforage from 'localforage';
import { Document } from '../types';
import ChapterEditor from './ChapterEditor';
import WorkflowSidebar from './WorkflowSidebar';

const Editor: React.FC = () => {
  const { documentIds } = useParams<{ documentIds: string }>();
  const store = useEditorStore();
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker and document fetching
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { status, type, data, error, chapterId } = event.data;
      if (status === 'success') {
        if (type === 'structure') store.setChapterStructure(data);
        else if (type === 'text') store.setTextContent(chapterId, data);
        else if (type === 'image') store.setImageUrl(chapterId, data);
      } else {
        store.setError(error);
      }
    };

    const fetchDocuments = async () => {
      if (documentIds) {
        const ids = documentIds.split(',');
        const docs = await Promise.all(ids.map(id => localforage.getItem<Document>(id)));
        store.setDocuments(docs.filter((doc): doc is Document => doc !== null));
      }
    };
    fetchDocuments();

    return () => workerRef.current?.terminate();
  }, [documentIds, store]);

  // Main workflow orchestrator effect
  useEffect(() => {
    if (store.workflowStatus === 'content_generation') {
      const nextChapter = store.chapters.find(c => ['pending', 'image_generating'].includes(c.status));
      if (nextChapter) {
        if (nextChapter.status === 'pending') {
          store.startTextGeneration(nextChapter.id);
          workerRef.current?.postMessage({ type: 'generate_text', chapter: nextChapter, documentIds: documentIds?.split(',') });
        } else if (nextChapter.status === 'image_generating') {
          store.startImageGeneration(nextChapter.id);
          workerRef.current?.postMessage({ type: 'generate_image', chapter: nextChapter });
        }
      } else if (store.chapters.every(c => c.status === 'completed')) {
        // All chapters are done, update workflow status
        // store.setWorkflowStatus('completed'); // Example for a future step
      }
    }
  }, [store.workflowStatus, store.chapters, documentIds, store]);

  const handleStartAnalysis = () => {
    if (documentIds) {
      store.startStructureAnalysis();
      workerRef.current?.postMessage({ type: 'generate_structure', documentIds: documentIds.split(',') });
    }
  };

  const handleApproveText = (chapterId: string) => store.approveTextContent(chapterId);
  const handleApproveImage = (chapterId: string) => store.approveImage(chapterId);

  const currentChapterForPreview = store.chapters.find(c => c.status !== 'pending' && c.status !== 'completed') || store.chapters[store.chapters.length - 1];
  const currentChapterForReview = store.chapters.find(c => ['text_review', 'image_review'].includes(c.status));

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Panel */}
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Orchestrator</h2>
        {store.workflowStatus === 'idle' && (
          <button onClick={handleStartAnalysis} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Generate Chapter Structure
          </button>
        )}
        {store.workflowStatus === 'structure_review' && <ChapterEditor onConfirm={store.confirmChapterStructure} />}
        {store.workflowStatus === 'content_generation' && <WorkflowSidebar />}
        <Link to="/" className="text-blue-400 hover:underline mt-4 inline-block">&larr; Back to Dashboard</Link>
      </div>

      {/* Middle Panel */}
      <div className="w-1/2 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">eBook Preview</h2>
        <div className="bg-white text-black p-4 rounded-md min-h-[80vh]">
          {currentChapterForPreview && (
            <>
              <h3 className="text-2xl font-bold mb-4">{currentChapterForPreview.title}</h3>
              {['text_generating', 'image_generating'].includes(currentChapterForPreview.status) && <p>Processing...</p>}
              {currentChapterForPreview.content && <div dangerouslySetInnerHTML={{ __html: currentChapterForPreview.content.replace(/\\n/g, '<br />') }} />}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Review & Actions</h2>
        {currentChapterForReview?.status === 'text_review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Review Content</h3>
            <button onClick={() => handleApproveText(currentChapterForReview.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Approve Text</button>
          </div>
        )}
        {currentChapterForReview?.status === 'image_review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Review Image</h3>
            <img src={currentChapterForReview.imageUrl} alt={`Generated for ${currentChapterForReview.title}`} className="rounded-md" />
            <button onClick={() => handleApproveImage(currentChapterForReview.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Approve Image</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
