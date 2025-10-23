import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TranslationService } from '../../services/translation.service';
import type { Topic, VocabularyItem, PracticeAttempt } from '../../models/vocabulary.model';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">{{ translationService.translate('practiceReport') }}</h2>
      
      @if (totalAttempts() === 0) {
        <div class="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{{ translationService.translate('noPracticeData') }}</h3>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ translationService.translate('noPracticeDataDesc') }}</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Overall Accuracy -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">{{ translationService.translate('overallAccuracy') }}</h3>
            <p class="mt-2 text-4xl font-bold text-primary-600 dark:text-primary-400">{{ overallAccuracy() | percent:'1.0-1' }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ totalCorrect() }} {{ translationService.translate('correctOutOf') }} {{ totalAttempts() }} {{ translationService.translate('attempts') }}</p>
          </div>

          <!-- Topics -->
          <div class="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">{{ translationService.translate('performanceByTopic') }}</h3>
            <div class="mt-4 space-y-4">
              @for (stat of statsByTopic(); track stat.name) {
                @if (stat.hasData) {
                  <div>
                    <div class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span>{{ stat.name }}</span>
                      <span>{{ stat.accuracy | percent:'1.0-0' }}</span>
                    </div>
                    <div class="mt-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div class="bg-primary-600 h-2.5 rounded-full" [style.width.%]="stat.accuracy * 100"></div>
                    </div>
                    <p class="text-xs text-right text-slate-500 dark:text-slate-400 mt-1">{{ stat.attempts }} {{ translationService.translate('attempts') }}</p>
                  </div>
                }
              }
            </div>
          </div>
        </div>
        
        <!-- Difficult Words -->
        @if (difficultWords().length > 0) {
          <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mt-6">
              <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">{{ translationService.translate('wordsToReview') }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ translationService.translate('wordsToReviewDesc') }}</p>
              <ul class="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
                @for (word of difficultWords(); track word.word) {
                  <li class="py-3 flex items-center justify-between">
                    <div>
                      <p class="font-semibold text-slate-800 dark:text-slate-200">{{ word.word }}</p>
                      <p class="text-sm text-slate-500 dark:text-slate-400">{{ word.topicName }}</p>
                    </div>
                    <div class="text-right">
                       <p class="font-semibold" [class.text-red-500]="word.accuracy < 0.5" [class.text-yellow-500]="word.accuracy >= 0.5">
                          {{ word.accuracy | percent:'1.0-0' }}
                       </p>
                       <p class="text-xs text-slate-500 dark:text-slate-400">{{ word.correct }}/{{ word.total }} correct</p>
                    </div>
                  </li>
                }
              </ul>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportingComponent {
  private dataService = inject(DataService);
  public translationService = inject(TranslationService);

  private practiceHistory = this.dataService.practiceHistory;
  private topics = this.dataService.topics;

  totalAttempts = computed(() => this.practiceHistory().length);
  totalCorrect = computed(() => this.practiceHistory().filter(a => a.correct).length);
  overallAccuracy = computed(() => {
    const total = this.totalAttempts();
    return total > 0 ? this.totalCorrect() / total : 0;
  });

  statsByTopic = computed(() => {
    const history = this.practiceHistory();
    const topics = this.topics();
    
    return topics.map(topic => {
      const topicAttempts = history.filter(h => h.topicId === topic.id);
      const total = topicAttempts.length;
      if (total === 0) {
        return { name: topic.name, accuracy: 0, attempts: 0, hasData: false };
      }
      const correct = topicAttempts.filter(a => a.correct).length;
      const accuracy = correct / total;
      return { name: topic.name, accuracy, attempts: total, hasData: true };
    });
  });

  difficultWords = computed(() => {
    const history = this.practiceHistory();
    const topics = this.topics();
    const allVocab = topics.flatMap(t => t.vocabularies.map(v => ({...v, topicName: t.name})));
    
    const wordStats = new Map<string, { correct: number, total: number }>();

    for (const attempt of history) {
      const stat = wordStats.get(attempt.wordId) ?? { correct: 0, total: 0 };
      stat.total++;
      if (attempt.correct) {
        stat.correct++;
      }
      wordStats.set(attempt.wordId, stat);
    }
    
    const statsArray = Array.from(wordStats.entries()).map(([wordId, stats]) => {
      const vocabItem = allVocab.find(v => v.id === wordId);
      if (!vocabItem) return null;
      
      return {
        word: vocabItem.word,
        topicName: vocabItem.topicName,
        correct: stats.correct,
        total: stats.total,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      };
    }).filter((s): s is { word: string; topicName: string; correct: number; total: number; accuracy: number; } => 
      s !== null && s.total > 0 && s.accuracy < 1
    );

    return statsArray.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  });
}
