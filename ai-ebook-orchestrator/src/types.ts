// src/types.ts
export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  date: string;
  status: 'Uploaded' | 'Processing' | 'Analyzed';
}

export type ChapterStatus =
  | 'pending'           // Waiting to be processed
  | 'text_generating'   // AI is generating the text
  | 'text_review'       // User is reviewing the text
  | 'image_generating'  // AI is generating the image
  | 'image_review'      // User is reviewing the image
  | 'completed';        // Chapter is fully approved

export type WorkflowStatus =
  | 'idle'                // Initial state
  | 'analyzing'           // Generating initial chapter structure
  | 'structure_review'    // User is reviewing/editing the chapter structure
  | 'content_generation'  // Actively generating content for chapters
  | 'completed';          // Entire process is finished

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content?: string; // The generated text content of the chapter
  imageUrl?: string; // The URL of the generated image
  status: ChapterStatus;
}
