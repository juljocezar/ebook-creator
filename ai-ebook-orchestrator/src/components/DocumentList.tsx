// src/components/DocumentList.tsx
import React from 'react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-500">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Document Pool</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-600">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-700">
                <td className="p-2">{doc.name}</td>
                <td className="p-2">{doc.type}</td>
                <td className="p-2">{new Date(doc.date).toLocaleDateString()}</td>
                <td className="p-2"><span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">{doc.status}</span></td>
                <td className="p-2">
                  <button onClick={() => onDelete(doc.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
