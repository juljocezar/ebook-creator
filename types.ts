// FIX: Implemented missing type definitions for the application.
export interface EnhancementOptions {
  proofread: boolean;
  coverPage: boolean;
  tableOfContents: boolean;
  glossary: boolean;
  citations: boolean;
  index: boolean;
}

export type WritingStyle = 'neutral' | 'professionell' | 'akademisch' | 'locker';

export interface Keyword {
  name: string;
  frequency: number;
}

export interface DocumentAnalysis {
  wordCount: number;
  readingTime: number; // in minutes
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  keywords: Keyword[];
  tags: string[];
}

export interface TocItem {
    title: string;
}

export interface GlossaryItem {
    term: string;
    definition: string;
}

export interface Citation {
    title: string;
    uri: string;
    source: string;
}

export interface GeneratedEbook {
  title: string;
  coverImageUrl: string;
  coverPrompt: string;
  tableOfContents: TocItem[];
  content: string; // HTML content
  glossary: GlossaryItem[];
  citations: Citation[];
  index: string[];
}

export interface HistoryEntry {
    savedAt: string;
    ebook: GeneratedEbook | null;
    analysis: DocumentAnalysis | null;
}

export interface ManagedDocument {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  analysis: DocumentAnalysis | null;
  ebook: GeneratedEbook | null;
  tags: string[];
  history: HistoryEntry[];
}

export interface TopicSuggestion {
    title: string;
    description: string;
    sourceDocIds: string[];
}

export interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    options: EnhancementOptions;
    writingStyle: WritingStyle;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}
