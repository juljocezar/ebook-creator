// src/components/WorkflowSidebar.tsx
import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Chapter } from '../types';

const statusStyles = {
  pending: 'bg-gray-500',
  text_generating: 'bg-blue-500 animate-pulse',
  text_review: 'bg-yellow-500',
  image_generating: 'bg-indigo-500 animate-pulse',
  image_review: 'bg-purple-500',
  completed: 'bg-green-500',
};

const WorkflowSidebar: React.FC = () => {
  const { chapters } = useEditorStore();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Workflow Progress</h3>
      <ul className="space-y-2">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="p-3 bg-gray-700 rounded-md flex items-center justify-between">
            <span className="truncate">{chapter.title}</span>
            <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${statusStyles[chapter.status]}`}>
              {chapter.status.replace('_', ' ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkflowSidebar;
