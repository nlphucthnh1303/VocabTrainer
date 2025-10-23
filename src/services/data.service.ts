import { signal, effect, Injectable, inject } from '@angular/core';
import type { Topic, VocabularyItem, PracticeAttempt, Difficulty } from '../models/vocabulary.model';
import { TopicService } from './topic.service';
import { AlertService } from './alert.service';
@Injectable({
  providedIn: 'root',
})
export class DataService {
  topics = signal<Topic[]>([]);
  practiceHistory = signal<PracticeAttempt[]>([]);
  private topicService = inject(TopicService);
  constructor(private alertService: AlertService) {
     this.topicService.getItems().subscribe((data: Topic[]) => {
      this.topics.set(data);
      console.log('data topics from Firestore:', data);
    });
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

  addTopic(name: string, description: string, difficulty: Difficulty) {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: name,
      description: description,
      difficulty: difficulty,
      vocabularies: [],
      practiceRatio: 0.5, // Default to 50% MCQ
    };
    this.topicService.createItem(newTopic).then(() => {
      this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
  }

  updateTopic(topicId: string, name: string, description: string, difficulty: Difficulty) {
    const updateTopic: Topic = {
      id: topicId,
      name: name,
      description: description,
      difficulty: difficulty,
      vocabularies: [],
      practiceRatio: 0.5, // Default to 50% MCQ
    };
    this.topicService.updateItem(topicId,updateTopic).then(() => {
      this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
  }

  updateTopicSettings(topicId: string, settings: { practiceRatio: number }) {
    this.topics.update(topics =>
      topics.map(t => t.id === topicId ? { ...t, practiceRatio: settings.practiceRatio } : t)
    );
  }

  deleteTopic(topicId: string) {
    this.topicService.deleteItem(topicId).then(() => {
      this.alertService.show('success', 'Xóa dữ liệu đã được lưu thành công!');
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
    // this.topics.update(topics => topics.filter(t => t.id !== topicId));
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
        difficulty: 'Beginner',
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
        difficulty: 'Intermediate',
        vocabularies: [
          { id: 'v6', word: 'algorithm', phonetic: '/ˈælɡərɪðəm/', partOfSpeech: 'noun', meaning: 'a process or set of rules to be followed in calculations' },
          { id: 'v7', word: 'database', phonetic: '/ˈdeɪtəbeɪs/', partOfSpeech: 'noun', meaning: 'a structured set of data held in a computer' },
          { id: 'v8', word: 'network', phonetic: '/ˈnetwɜːk/', partOfSpeech: 'noun', meaning: 'a group or system of interconnected people or things' },
        ]
      }
    ];
  }
}