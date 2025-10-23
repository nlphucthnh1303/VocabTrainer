import { Component, ChangeDetectionStrategy, input, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import type { Topic, VocabularyItem } from '../../models/vocabulary.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  templateUrl: './flashcards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashcardsComponent {
  topic = input.required<Topic>();
  public translationService = inject(TranslationService);

  private platformId = inject(PLATFORM_ID);
  
  currentIndex = signal(0);
  isFlipped = signal(false);

  currentCard = computed<VocabularyItem | undefined>(() => {
    return this.topic().vocabularies[this.currentIndex()];
  });

  isBrowser: boolean = isPlatformBrowser(this.platformId);

  nextCard() {
    this.isFlipped.set(false);
    // Add a small delay to allow the flip back animation to be seen
    setTimeout(() => {
        this.currentIndex.update(i => (i + 1) % this.topic().vocabularies.length);
    }, 150);
  }
  
  prevCard() {
    this.isFlipped.set(false);
     setTimeout(() => {
      this.currentIndex.update(i => (i - 1 + this.topic().vocabularies.length) % this.topic().vocabularies.length);
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
