// FIX: Implemented the geminiService with functions to analyze documents, generate ebooks, and chat, following Gemini API guidelines.
import { GoogleGenAI, Type } from "@google/genai";
import type { DocumentAnalysis, EnhancementOptions, GeneratedEbook, ChatMessage, WritingStyle, TopicSuggestion } from '../types';

// FIX: Initialize GoogleGenAI with apiKey from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        wordCount: { type: Type.INTEGER, description: "Total number of words in the document." },
        readingTime: { type: Type.INTEGER, description: "Estimated reading time in minutes." },
        sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'], description: "Overall sentiment of the text." },
        keywords: {
            type: Type.ARRAY,
            description: "List of top 5 keywords and their frequency.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    frequency: { type: Type.INTEGER }
                },
                required: ['name', 'frequency']
            }
        },
        tags: { type: Type.ARRAY, description: "A list of 3-5 relevant topic tags for the document.", items: { type: Type.STRING } }
    },
    required: ['wordCount', 'readingTime', 'sentiment', 'keywords', 'tags']
};

export const analyzeDocument = async (text: string): Promise<DocumentAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following document. Provide word count, estimated reading time in minutes, overall sentiment (Positive, Negative, or Neutral), top 5 keywords with frequencies, and 3-5 relevant topic tags. Document: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const json = JSON.parse(response.text);
        return json as DocumentAnalysis;
    } catch (error) {
        console.error("Error analyzing document:", error);
        throw new Error("Dokument konnte mit der Gemini API nicht analysiert werden.");
    }
};

const ebookSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A compelling title for the ebook." },
        tableOfContents: {
            type: Type.ARRAY,
            description: "A list of chapters or sections.",
            items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } }
        },
        content: { type: Type.STRING, description: "The full content of the ebook in well-formed HTML format, using headings (h2, h3), paragraphs (p), and lists (ul, li)." },
        glossary: {
            type: Type.ARRAY,
            description: "A list of key terms and their definitions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                },
                required: ['term', 'definition']
            }
        },
        index: {
            type: Type.ARRAY,
            description: "A list of important index terms.",
            items: { type: Type.STRING }
        }
    },
    required: ['title', 'tableOfContents', 'content']
};

export const generateEbook = async (
    documentText: string, 
    options: EnhancementOptions, 
    writingStyle: WritingStyle,
    onProgress: (message: string) => void
): Promise<GeneratedEbook> => {
    let coverImageUrl = '';
    let coverPrompt = 'No cover generated.';
    
    if (options.coverPage) {
        onProgress("Agent 'Cover Designer' konzipiert ein Buchcover...");
        try {
            const promptResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the following text, create a short, visually descriptive prompt (max 25 words) for an AI image generator to create a stunning, abstract book cover. Text: "${documentText.substring(0, 500)}"`,
            });
            coverPrompt = promptResponse.text.trim();
            onProgress(`Cover-Prompt: "${coverPrompt}"`);
            
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: coverPrompt,
                config: { numberOfImages: 1, aspectRatio: '3:4' }
            });

            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                const base64Image = imageResponse.generatedImages[0].image.imageBytes;
                coverImageUrl = `data:image/png;base64,${base64Image}`;
                onProgress("Buchcover wurde erfolgreich generiert.");
            }
        } catch (error) {
            console.error("Error generating cover:", error);
            onProgress("Fehler bei der Cover-Generierung. Fahre ohne Cover fort.");
        }
    }

    onProgress("Agenten 'Autor', 'Lektor' und 'Archivar' beginnen mit der Arbeit...");
    const writingStylePrompts = {
        neutral: "Write in a neutral, informative tone.",
        professionell: "Write in a professional, business-oriented style.",
        akademisch: "Write in a formal, academic style.",
        locker: "Write in a casual, conversational tone."
    };

    const generationTasks = [];
    if (options.tableOfContents) generationTasks.push("a table of contents");
    if (options.proofread) generationTasks.push("proofread and stylistically enhanced content formatted as HTML");
    else generationTasks.push("the content formatted as HTML");
    if (options.glossary) generationTasks.push("a glossary of key terms");
    if (options.index) generationTasks.push("an index of important topics");

    try {
        const ebookContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Act as an expert author and editor. Based on the following document, create an ebook.
            ${writingStylePrompts[writingStyle]}
            Your tasks are to generate: a compelling title, ${generationTasks.join(', ')}.
            Document: "${documentText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: ebookSchema,
            },
        });
        const ebookJson = JSON.parse(ebookContentResponse.text);

        let citations: any[] = [];
        if (options.citations) {
            onProgress("Agent 'Bibliothekar' recherchiert Quellen...");
            try {
                const citationResponse = await ai.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: `Based on the following text, find 3-5 relevant online sources and list their titles and URIs. Text: "${documentText.substring(0, 1000)}"`,
                    config: {
                        tools: [{googleSearch: {}}],
                    },
                });

                if (citationResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    citations = citationResponse.candidates[0].groundingMetadata.groundingChunks.map((chunk: any) => ({
                        title: chunk.web.title || "Unknown Title",
                        uri: chunk.web.uri,
                        source: new URL(chunk.web.uri).hostname,
                    }));
                }
                onProgress("Quellenrecherche abgeschlossen.");
            } catch(error) {
                 console.error("Error fetching citations:", error);
                 onProgress("Fehler bei der Quellenrecherche.");
            }
        }

        return {
            ...ebookJson,
            glossary: options.glossary ? ebookJson.glossary : [],
            index: options.index ? ebookJson.index : [],
            tableOfContents: options.tableOfContents ? ebookJson.tableOfContents : [],
            coverImageUrl,
            coverPrompt,
            citations,
        };
    } catch (error) {
        console.error("Error generating ebook content:", error);
        onProgress("Kritischer Fehler bei der eBook-Erstellung.");
        throw new Error("eBook konnte mit der Gemini API nicht erstellt werden.");
    }
};

export const chatWithAssistant = async (history: ChatMessage[], prompt: string, context?: string): Promise<string> => {
    const contents = history
        .filter(m => m.role !== 'system')
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    let fullPrompt = prompt;
    if (context) {
        fullPrompt = `${prompt}\n\nContext Text:\n"""\n${context}\n"""`;
    }
    
    contents.push({ role: 'user', parts: [{ text: fullPrompt }]});

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents as any,
            config: {
                systemInstruction: "You are a helpful writing assistant. You help users improve, summarize, or rewrite text. Your responses should be concise and directly address the user's request.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error with chat assistant:", error);
        throw new Error("Antwort vom Assistenten konnte nicht erhalten werden.");
    }
};

export const analyzeDocumentPool = async (documents: {id: string, name: string, content: string}[]): Promise<TopicSuggestion[]> => {
    const documentSummaries = documents.map(doc => `Document ID ${doc.id} ("${doc.name}"): ${doc.content.substring(0, 500)}...`).join('\n\n');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `I have a pool of documents. Analyze them for thematic overlaps and propose 3 innovative ebook concepts that could combine content from multiple documents. For each suggestion, provide a title, a short description, and the IDs of the source documents. \n\nDocuments:\n${documentSummaries}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            sourceDocIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['title', 'description', 'sourceDocIds']
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as TopicSuggestion[];
    } catch (error) {
        console.error("Error analyzing document pool:", error);
        throw new Error("Dokumentenpool konnte nicht analysiert werden.");
    }
}