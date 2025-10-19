// src/store/editorStore.ts
import { create } from 'zustand';
import { Document, Chapter } from '../types';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface EditorState {
  documents: Document[];
  status: AnalysisStatus;
  chapterStructure: Chapter[] | null;
  error: string | null;
  setDocuments: (documents: Document[]) => void;
  startAnalysis: () => void;
  analysisSuccess: (chapters: Chapter[]) => void;
  analysisError: (error: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  documents: [],
  status: 'idle',
  chapterStructure: null,
  error: null,
  setDocuments: (documents) => set({ documents }),
  startAnalysis: () => set({ status: 'loading', error: null, chapterStructure: null }),
  analysisSuccess: (chapters) => set({ status: 'success', chapterStructure: chapters }),
  analysisError: (error) => set({ status: 'error', error }),
}));
