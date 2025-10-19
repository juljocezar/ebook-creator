// src/store/editorStore.ts
import { create } from 'zustand';
import { Document, Chapter, WorkflowStatus } from '../types';
import { produce } from 'immer';

interface EditorState {
  documents: Document[];
  workflowStatus: WorkflowStatus;
  chapters: Chapter[];
  error: string | null;
  setDocuments: (documents: Document[]) => void;
  startStructureAnalysis: () => void;
  setChapterStructure: (structure: Omit<Chapter, 'id' | 'status'>[]) => void;
  updateChapter: (chapterId: string, title: string, summary: string) => void;
  confirmChapterStructure: () => void;
  startTextGeneration: (chapterId: string) => void;
  setTextContent: (chapterId: string, content: string) => void;
  approveTextContent: (chapterId: string) => void;
  startImageGeneration: (chapterId: string) => void;
  setImageUrl: (chapterId: string, imageUrl: string) => void;
  approveImage: (chapterId: string) => void;
  setError: (error: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  documents: [],
  workflowStatus: 'idle',
  chapters: [],
  error: null,
  setDocuments: (documents) => set({ documents }),
  startStructureAnalysis: () => set({ workflowStatus: 'analyzing', error: null, chapters: [] }),
  setChapterStructure: (structure) =>
    set({
      workflowStatus: 'structure_review',
      chapters: structure.map((chap, index) => ({
        ...chap,
        id: `chap_${index}`,
        status: 'pending',
      })),
    }),
  updateChapter: (chapterId, title, summary) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) {
          chapter.title = title;
          chapter.summary = summary;
        }
      })
    ),
  confirmChapterStructure: () => set({ workflowStatus: 'content_generation' }),
  startTextGeneration: (chapterId) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) chapter.status = 'text_generating';
      })
    ),
  setTextContent: (chapterId, content) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) {
          chapter.content = content;
          chapter.status = 'text_review';
        }
      })
    ),
  approveTextContent: (chapterId) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) chapter.status = 'image_generating'; // Next step is image generation
      })
    ),
  startImageGeneration: (chapterId) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) chapter.status = 'image_generating';
      })
    ),
  setImageUrl: (chapterId, imageUrl) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) {
          chapter.imageUrl = imageUrl;
          chapter.status = 'image_review';
        }
      })
    ),
  approveImage: (chapterId) =>
    set(
      produce((state: EditorState) => {
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (chapter) chapter.status = 'completed';
      })
    ),
  setError: (error) => set({ workflowStatus: 'idle', error }),
}));
