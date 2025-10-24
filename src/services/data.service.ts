import { signal, effect, Injectable, inject } from '@angular/core';
import type { Topic, VocabularyItem, PracticeAttempt, Difficulty } from '../models/vocabulary.model';
import { TopicService } from './topic.service';
import { AlertService } from './alert.service';
import { VocabularyService } from './vocabulary.service';
@Injectable({
  providedIn: 'root',
})
export class DataService {
  topics = signal<Topic[]>([]);
  practiceHistory = signal<PracticeAttempt[]>([]);
  private topicService = inject(TopicService);
  private vocabularyService = inject(VocabularyService);
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
    let topic = this.topics().find(t => t.id === topicId);
    if (topic) {
      topic.name = name;
      topic.description = description;
      topic.difficulty = difficulty;  
      topic.vocabularies = topic.vocabularies;
      topic.practiceRatio = topic.practiceRatio;
    } 
    this.topicService.updateItem(topicId, topic).then(() => {
      this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
  }

  updateTopicSettings(topic: Topic, settings: { practiceRatio: number }) {
    
    topic.practiceRatio = settings.practiceRatio;
    this.topicService.updateItem(topic.id, topic).then(() => {
      this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
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
    let topic = this.topics().find(t => t.id === topicId);
    this.vocabularyService.createItem(newItem).then((res) => {
      topic.vocabularies.push(res)
      this.topicService.updateItem(topic.id, topic).then(() => {
        this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
      }).catch((error) => {
        console.error('Error creating topic in Firestore:', error);
      });
    }).catch((error) => {
      console.error('Error creating vocabulary item in Firestore:', error);
    });
  }

  updateVocabularyItem(topicId: string, updatedItem: VocabularyItem) {
    let topic = this.topics().find(t => t.id === topicId);
    if(topic) {
      this.vocabularyService.updateItem(updatedItem.id, updatedItem).then(() => {
        this.alertService.show('success', 'Dữ liệu đã được lưu thành công!');
      }).catch((error) => {
        console.error('Error creating topic in Firestore:', error);
        this.alertService.show('error', 'Dữ liệu đã được không lưu thành công!');
      });
    }
  }

  deleteVocabularyItem(topicId: string, itemId: string) {
    this.vocabularyService.deleteItem(itemId).then(() => {
      let topic = this.topics().find(t => t.id === topicId);
      topic.vocabularies = topic.vocabularies.filter(v => v !== itemId);
      this.topicService.updateItem(topicId, topic).then(() => {
        this.alertService.show('success', 'Xóa dữ liệu đã được lưu thành công!');
      }).catch((error) => {
        console.error('Error creating topic in Firestore:', error);
      });
    }).catch((error) => {
      console.error('Error creating topic in Firestore:', error);
    });
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
        vocabularies: []
      },
      {
        id: 'sample-2',
        name: 'Technology Terms',
        description: 'Vocabulary related to computers and the internet.',
        practiceRatio: 0.7,
        difficulty: 'Intermediate',
        vocabularies: []
      }
    ];
  }
}