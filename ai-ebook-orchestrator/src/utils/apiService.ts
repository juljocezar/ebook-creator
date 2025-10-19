// src/utils/apiService.ts
import { Document, Chapter } from '../types';

const PROXY_URL = 'http://localhost:3001/api/generate';

const callApi = async (prompt: string, documents: Document[]): Promise<any> => {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, documents }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch from API');
  }

  return response.json();
};

export const generateChapterStructure = async (documents: Document[]): Promise<Chapter[]> => {
  const prompt = `Analyze the following documents and create a logical chapter structure.
                  The output must be in JSON format and contain an array of objects,
                  where each object has a "title" and a "summary" property.`;

  const data = await callApi(prompt, documents);

  try {
    const jsonString = data.generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(jsonString);

    if (Array.isArray(parsedData) && parsedData.every(item => 'title' in item && 'summary' in item)) {
      return parsedData as Chapter[];
    } else {
      throw new Error("Parsed data does not match the expected Chapter[] structure.");
    }
  } catch (e) {
    console.error("Failed to parse or validate JSON from Gemini response:", data.generatedText, e);
    throw new Error("Invalid or malformed JSON format received from AI.");
  }
};

export const generateChapterText = async (chapter: Chapter, documents: Document[]): Promise<string> => {
  const prompt = `Write the content for the chapter titled "${chapter.title}".
                  The summary of the chapter is: "${chapter.summary}".
                  Base the content on the provided documents.
                  The output should be the raw text content for the chapter.`;

  const data = await callApi(prompt, documents);
  return data.generatedText;
};

export const generateChapterImage = async (chapter: Chapter): Promise<string> => {
  // In a real scenario, this would call a text-to-image model.
  // For this project, we will simulate the call and return a placeholder image URL.
  console.log(`Simulating image generation for chapter: "${chapter.title}"`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  const keywords = chapter.title.split(' ').join(',');
  return `https://source.unsplash.com/800x600/?${keywords}`;
};
