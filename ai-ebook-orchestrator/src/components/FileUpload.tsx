// src/components/FileUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractTextFromPdf, extractTextFromTxt, extractTextFromDocx } from '../utils/fileProcessor';

interface FileUploadProps {
  onFilesUploaded: (files: Array<{ name: string; type: string; content: string; date: string }>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const processedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        let content = '';
        if (file.type === 'application/pdf') {
          content = await extractTextFromPdf(file);
        } else if (file.type === 'text/plain') {
          content = await extractTextFromTxt(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          content = await extractTextFromDocx(file);
        }
        return {
          name: file.name,
          type: file.type,
          content,
          date: new Date().toISOString(),
        };
      })
    );
    onFilesUploaded(processedFiles);
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-600 rounded-lg p-12 text-center mb-8 cursor-pointer
                  ${isDragActive ? 'bg-gray-700 border-blue-500' : ''}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-400">Drop the files here ...</p>
      ) : (
        <>
          <p className="text-gray-400">Drag & drop your files here</p>
          <p className="text-gray-500 text-sm my-2">or</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Select Files
          </button>
        </>
      )}
    </div>
  );
};

export default FileUpload;
