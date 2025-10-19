// src/workers/aiWorker.ts
import localforage from 'localforage';
import { generateChapterStructure, generateChapterText, generateChapterImage } from '../utils/apiService';
import { Document, Chapter } from '../types';

interface GenerateStructureMessage {
  type: 'generate_structure';
  documentIds: string[];
}

interface GenerateTextMessage {
  type: 'generate_text';
  chapter: Chapter;
  documentIds: string[];
}

interface GenerateImageMessage {
  type: 'generate_image';
  chapter: Chapter;
}

type WorkerMessage = GenerateStructureMessage | GenerateTextMessage | GenerateImageMessage;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type } = event.data;

    if (type === 'generate_structure' || type === 'generate_text') {
      const { documentIds } = event.data;
      const documents = await Promise.all(
        documentIds.map(id => localforage.getItem<Document>(id))
      );
      const validDocuments = documents.filter((doc): doc is Document => doc !== null);
      if (validDocuments.length === 0) throw new Error("No valid documents found.");

      if (type === 'generate_structure') {
        const chapterStructure = await generateChapterStructure(validDocuments);
        self.postMessage({ status: 'success', type: 'structure', data: chapterStructure });
      } else {
        const { chapter } = event.data;
        const textContent = await generateChapterText(chapter, validDocuments);
        self.postMessage({ status: 'success', type: 'text', chapterId: chapter.id, data: textContent });
      }
    } else if (type === 'generate_image') {
      const { chapter } = event.data;
      const imageUrl = await generateChapterImage(chapter);
      self.postMessage({ status: 'success', type: 'image', chapterId: chapter.id, data: imageUrl });
    }

  } catch (error) {
    self.postMessage({ status: 'error', error: (error as Error).message });
  }
};
