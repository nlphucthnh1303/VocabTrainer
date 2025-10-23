import { Injectable } from '@angular/core';
import type { VocabularyItem } from '../models/vocabulary.model';

// Define types based on the dynamically imported module to maintain type safety
type GenAiModule = typeof import('@google/genai');
type GoogleGenAIClient = InstanceType<GenAiModule['GoogleGenAI']>;

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAIClient | null = null;
  private genAIModule: GenAiModule | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Constructor is intentionally empty to prevent any code from running on initial load.
  }

  private initialize(): Promise<void> {
    // Use a singleton promise to ensure the initialization logic runs only once.
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
          // Dynamically import the library only when needed.
          this.genAIModule = await import('@google/genai');
          this.ai = new this.genAIModule.GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
          console.error('Gemini API key not found.');
          this.ai = null;
          this.genAIModule = null;
        }
      } catch (e) {
        console.error('Failed to load or initialize Gemini AI:', e);
        this.ai = null;
        this.genAIModule = null;
      }
    })();
    
    return this.initializationPromise;
  }

  isAvailable(): boolean {
    // This is a safe, synchronous check that doesn't trigger any imports.
    return !!(typeof process !== 'undefined' && process.env && process.env.API_KEY);
  }

  async generateDistractors(
    correctItem: VocabularyItem,
    count: number
  ): Promise<string[]> {
    await this.initialize();

    if (!this.ai || !this.genAIModule) {
      console.error('Gemini AI not initialized.');
      return [];
    }
    
    const { Type } = this.genAIModule;
    const partOfSpeech = correctItem.partOfSpeech || 'word';

    const prompt = `For a vocabulary quiz, the correct answer is "${correctItem.word}" which is a "${partOfSpeech}". Generate ${count} incorrect choices (distractors). The distractors must also be of the part of speech "${partOfSpeech}". The distractors should be plausible but clearly incorrect. Do not include the correct answer in your list.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distractors: {
                type: Type.ARRAY,
                description: `An array of ${count} distractor words.`,
                items: { type: Type.STRING },
              },
            },
            required: ['distractors'],
          },
        },
      });

      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString);

      if (result.distractors && Array.isArray(result.distractors)) {
        return result.distractors.slice(0, count).filter((d: string) => d.toLowerCase() !== correctItem.word.toLowerCase());
      }
      return [];
    } catch (error) {
      console.error('Error generating distractors with Gemini:', error);
      return []; // Fallback to an empty array on error
    }
  }
}
