// src/types.ts
export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  date: string;
  status: 'Uploaded' | 'Processing' | 'Analyzed';
}
