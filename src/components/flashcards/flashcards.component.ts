import { Component, ChangeDetectionStrategy, input, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import type { Topic, VocabularyItem } from '../../models/vocabulary.model';
import { VocabularyService } from '@/src/services/vocabulary.service';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  templateUrl: './flashcards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashcardsComponent {
  topic = input.required<Topic>();
  public translationService = inject(TranslationService);
  public vocabularyService = inject(VocabularyService);
  private platformId = inject(PLATFORM_ID);
  
  currentIndex = signal(0);
  isFlipped = signal(false);
  ngOnInit() {
    this.loadVocabularies();
  }

  vocabulariesWithDetails = signal([]);
  loadVocabularies() {
      // Lấy ID từ vựng từ topic()
      const vocabIDs = this.topic()?.vocabularies ?? []; 
      this.vocabularyService.getItems().subscribe(data => {
          const mergedVocabs = [];
          // Lặp qua các ID và tìm chi tiết từ 'data'
          vocabIDs.forEach(vocabId => {
              const itemDetail = data.find(item => item.id === vocabId);
              if (itemDetail) {
                  mergedVocabs.push(itemDetail); 
              }
          });
          // Cập nhật Signal sau khi hợp nhất dữ liệu
          this.vocabulariesWithDetails.set(mergedVocabs); 
          console.log('Vocabulary items loaded and merged:', mergedVocabs);
      });
  }


  currentCard = computed<VocabularyItem | undefined>(() => {
    return this.vocabulariesWithDetails()[this.currentIndex()];
  });

  isBrowser: boolean = isPlatformBrowser(this.platformId);

  nextCard() {
    this.isFlipped.set(false);
    // Add a small delay to allow the flip back animation to be seen
    setTimeout(() => {
        this.currentIndex.update(i => (i + 1) % this.vocabulariesWithDetails().length);
    }, 150);
  }
  
  prevCard() {
    this.isFlipped.set(false);
     setTimeout(() => {
      this.currentIndex.update(i => (i - 1 + this.vocabulariesWithDetails().length) % this.vocabulariesWithDetails().length);
    }, 150);
  }

  flipCard() {
    this.isFlipped.update(value => !value);
  }

  speak() {
    if (this.isBrowser && this.currentCard()) {
      const utterance = new SpeechSynthesisUtterance(this.currentCard()!.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
}
