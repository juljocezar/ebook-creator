// src/workers/aiWorker.ts
import localforage from 'localforage';
import { generateChapterStructure } from '../utils/apiService';
import { Document } from '../types';

self.onmessage = async (event: MessageEvent<{ documentIds: string[] }>) => {
  try {
    const { documentIds } = event.data;

    const documents = await Promise.all(
      documentIds.map(id => localforage.getItem<Document>(id))
    );
    const validDocuments = documents.filter((doc): doc is Document => doc !== null);

    if (validDocuments.length === 0) {
      throw new Error("No valid documents found for analysis.");
    }

    const chapterStructure = await generateChapterStructure(validDocuments);

    self.postMessage({ status: 'success', data: chapterStructure });

  } catch (error) {
    self.postMessage({ status: 'error', error: (error as Error).message });
  }
};
