import { Component, ChangeDetectionStrategy, signal, effect, Renderer2, PLATFORM_ID, computed, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TopicViewComponent } from './components/topic-view/topic-view.component';
import { FlashcardsComponent } from './components/flashcards/flashcards.component';
import { PracticeComponent } from './components/practice/practice.component';
import { DataService } from './services/data.service';
import type { Topic } from './models/vocabulary.model';

export type View = 'dashboard' | 'topic' | 'flashcards' | 'practice';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DashboardComponent, TopicViewComponent, FlashcardsComponent, PracticeComponent],
})
export class AppComponent {
  private dataService = inject(DataService);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  
  currentView = signal<View>('dashboard');
  selectedTopicId = signal<string | null>(null);

  isDarkMode = signal<boolean>(false);

  selectedTopic = computed(() => {
    const topicId = this.selectedTopicId();
    if (!topicId) return null;
    return this.dataService.topics().find(t => t.id === topicId) ?? null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
        try {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'dark') {
                this.isDarkMode.set(true);
            }
        } catch (e) {
            console.error('Could not access localStorage to get theme.', e);
        }

        effect(() => {
            try {
                if (this.isDarkMode()) {
                    this.renderer.addClass(document.documentElement, 'dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    this.renderer.removeClass(document.documentElement, 'dark');
                    localStorage.setItem('theme', 'light');
                }
            } catch (e) {
                console.error('Could not write theme to localStorage.', e);
            }
        });
    }
  }

  toggleTheme() {
    this.isDarkMode.update(value => !value);
  }

  navigateTo(view: View, topicId: string | null = null) {
    this.selectedTopicId.set(topicId);
    this.currentView.set(view);
  }

  handleViewTopic(topicId: string) {
    this.navigateTo('topic', topicId);
  }

  handleStartPractice(topicId: string) {
    this.navigateTo('practice', topicId);
  }

  handleStartFlashcards(topicId: string) {
    this.navigateTo('flashcards', topicId);
  }
}