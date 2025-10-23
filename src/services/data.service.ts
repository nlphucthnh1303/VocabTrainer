import { signal, effect, Injectable } from '@angular/core';
import type { Topic, VocabularyItem, PracticeAttempt } from '../models/vocabulary.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  topics = signal<Topic[]>([]);
  practiceHistory = signal<PracticeAttempt[]>([]);

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedTopics = localStorage.getItem('vocab-topics');
        if (storedTopics) {
          this.topics.set(JSON.parse(storedTopics));
        } else {
          this.topics.set(this.getSampleData());
        }

        const storedHistory = localStorage.getItem('vocab-history');
        if (storedHistory) {
          this.practiceHistory.set(JSON.parse(storedHistory));
        }

      } catch (e) {
        console.error('Failed to access or parse from localStorage, using sample data.', e);
        this.topics.set(this.getSampleData());
        this.practiceHistory.set([]);
      }
    } else {
      // Fallback for non-browser environments
      this.topics.set(this.getSampleData());
    }

    effect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem('vocab-topics', JSON.stringify(this.topics()));
            localStorage.setItem('vocab-history', JSON.stringify(this.practiceHistory()));
          } catch (e) {
            console.error('Could not write to localStorage.', e);
          }
        }
    });
  }

  // --- Topic Management ---

  addTopic(name: string, description: string) {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name,
      description,
      vocabularies: [],
      practiceRatio: 0.5, // Default to 50% MCQ
    };
    this.topics.update(topics => [...topics, newTopic]);
  }

  updateTopic(topicId: string, name: string, description: string) {
    this.topics.update(topics => 
      topics.map(t => t.id === topicId ? { ...t, name, description } : t)
    );
  }

  updateTopicSettings(topicId: string, settings: { practiceRatio: number }) {
    this.topics.update(topics =>
      topics.map(t => t.id === topicId ? { ...t, practiceRatio: settings.practiceRatio } : t)
    );
  }

  deleteTopic(topicId: string) {
    this.topics.update(topics => topics.filter(t => t.id !== topicId));
    // Also clear history for the deleted topic
    this.practiceHistory.update(history => history.filter(h => h.topicId !== topicId));
  }

  // --- Vocabulary Management ---

  addVocabularyItem(topicId: string, item: Omit<VocabularyItem, 'id'>) {
    const newItem: VocabularyItem = { ...item, id: crypto.randomUUID() };
    this.topics.update(topics => 
      topics.map(t => 
        t.id === topicId 
          ? { ...t, vocabularies: [...t.vocabularies, newItem] } 
          : t
      )
    );
  }

  updateVocabularyItem(topicId: string, updatedItem: VocabularyItem) {
    this.topics.update(topics => 
      topics.map(t => {
        if (t.id === topicId) {
          return {
            ...t,
            vocabularies: t.vocabularies.map(v => v.id === updatedItem.id ? updatedItem : v)
          };
        }
        return t;
      })
    );
  }

  deleteVocabularyItem(topicId: string, itemId: string) {
    this.topics.update(topics => 
      topics.map(t => {
        if (t.id === topicId) {
          return { ...t, vocabularies: t.vocabularies.filter(v => v.id !== itemId) };
        }
        return t;
      })
    );
    // Also clear history for the deleted word
    this.practiceHistory.update(history => history.filter(h => h.wordId !== itemId));
  }
  
  // --- Practice History ---
  logPracticeAttempt(attempt: PracticeAttempt) {
    this.practiceHistory.update(history => [...history, attempt]);
  }

  private getSampleData(): Topic[] {
    return [
      {
        id: 'sample-1',
        name: 'Common English Verbs',
        description: 'A collection of frequently used verbs in English.',
        practiceRatio: 0.5,
        vocabularies: [
          { id: 'v1', word: 'run', phonetic: '/rʌn/', partOfSpeech: 'verb', meaning: 'move at a speed faster than a walk' },
          { id: 'v2', word: 'eat', phonetic: '/iːt/', partOfSpeech: 'verb', meaning: 'put (food) into the mouth and chew and swallow it' },
          { id: 'v3', word: 'sleep', phonetic: '/sliːp/', partOfSpeech: 'verb', meaning: 'be in a state of rest' },
          { id: 'v4', word: 'think', phonetic: '/θɪŋk/', partOfSpeech: 'verb', meaning: 'have a particular opinion, belief, or idea' },
          { id: 'v5', word: 'talk', phonetic: '/tɔːk/', partOfSpeech: 'verb', meaning: 'speak in order to give information or express ideas' },
        ]
      },
      {
        id: 'sample-2',
        name: 'Technology Terms',
        description: 'Vocabulary related to computers and the internet.',
        practiceRatio: 0.7,
        vocabularies: [
          { id: 'v6', word: 'algorithm', phonetic: '/ˈælɡərɪðəm/', partOfSpeech: 'noun', meaning: 'a process or set of rules to be followed in calculations' },
          { id: 'v7', word: 'database', phonetic: '/ˈdeɪtəbeɪs/', partOfSpeech: 'noun', meaning: 'a structured set of data held in a computer' },
          { id: 'v8', word: 'network', phonetic: '/ˈnetwɜːk/', partOfSpeech: 'noun', meaning: 'a group or system of interconnected people or things' },
        ]
      }
    ];
  }
}