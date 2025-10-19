// src/components/ChapterEditor.tsx
import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Chapter } from '../types';

interface ChapterEditorProps {
  onConfirm: () => void;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ onConfirm }) => {
  const { chapters, updateChapter } = useEditorStore();

  const handleTitleChange = (id: string, value: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) {
      updateChapter(id, value, chapter.summary);
    }
  };

  const handleSummaryChange = (id: string, value: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) {
      updateChapter(id, chapter.title, value);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Review Chapter Structure</h3>
      {chapters.map((chapter) => (
        <div key={chapter.id} className="p-4 bg-gray-700 rounded-md">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => handleTitleChange(chapter.id, e.target.value)}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Summary</label>
            <textarea
              value={chapter.summary}
              onChange={(e) => handleSummaryChange(chapter.id, e.target.value)}
              rows={3}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
            />
          </div>
        </div>
      ))}
      <button
        onClick={onConfirm}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Confirm Structure & Start Content Generation
      </button>
    </div>
  );
};

export default ChapterEditor;
