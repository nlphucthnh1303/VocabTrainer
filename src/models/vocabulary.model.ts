export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Topic {
  id: string;
  name: string;
  description: string;
  vocabularies: string[];
  practiceRatio: number; // 0.0 to 1.0, representing percentage of Multiple Choice Questions
  difficulty: Difficulty;
}

export interface PracticeAttempt {
  topicId: string;
  wordId: string;
  timestamp: number;
  correct: boolean;
  questionType: 'mcq' | 'fill-in-the-blank';
}