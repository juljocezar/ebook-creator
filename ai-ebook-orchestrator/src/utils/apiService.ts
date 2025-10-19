// src/utils/apiService.ts
import { Document, Chapter } from '../types';

const PROXY_URL = 'http://localhost:3001/api/generate';

export const generateChapterStructure = async (documents: Document[]): Promise<Chapter[]> => {
  const prompt = `Analyze the following documents and create a logical chapter structure.
                  The output must be in JSON format and contain an array of objects,
                  where each object has a "title" and a "summary" property.`;

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

  const data = await response.json();

  try {
    const jsonString = data.generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(jsonString);

    // Basic validation to ensure the data is an array of chapters
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
