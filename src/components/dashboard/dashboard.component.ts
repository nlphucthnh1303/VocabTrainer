import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TranslationService } from '../../services/translation.service';
import type { Topic, Difficulty } from '../../models/vocabulary.model';
import { ReportingComponent } from '../reporting/reporting.component';

type DashboardView = 'topics' | 'reporting';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, ReportingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  dataService = inject(DataService);
  public translationService = inject(TranslationService);
  
  viewTopic = output<string>();
  startPractice = output<string>();
  startFlashcards = output<string>();
  
  currentView = signal<DashboardView>('topics');

  // Topic Add/Edit Modal
  isTopicModalOpen = signal(false);
  editingTopic = signal<Topic | null>(null);
  topicName = signal('');
  topicDescription = signal('');
  topicDifficulty = signal<Difficulty>('Beginner');

  // Settings Modal
  isSettingsModalOpen = signal(false);
  settingsTopic = signal<Topic | null>(null);
  practiceRatio = signal(0.5);

  openTopicModal(topic: Topic | null = null) {
    this.editingTopic.set(topic);
    if (topic) {
      this.topicName.set(topic.name);
      this.topicDescription.set(topic.description);
      this.topicDifficulty.set(topic.difficulty);
    } else {
      this.topicName.set('');
      this.topicDescription.set('');
      this.topicDifficulty.set('Beginner');
    }
    this.isTopicModalOpen.set(true);
  }

  closeTopicModal() {
    this.isTopicModalOpen.set(false);
    this.editingTopic.set(null);
  }

  saveTopic() {
    if (!this.topicName()) return;
    if (this.editingTopic()) {
      this.dataService.updateTopic(this.editingTopic()!.id, this.topicName(), this.topicDescription(), this.topicDifficulty());
    } else {
      this.dataService.addTopic(this.topicName(), this.topicDescription(), this.topicDifficulty());
    }
    this.closeTopicModal();
  }

  deleteTopic(topicId: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm(this.translationService.translate('deleteTopicConfirm'))) {
      this.dataService.deleteTopic(topicId);
    }
  }

  openSettingsModal(topic: Topic, event: MouseEvent) {
    event.stopPropagation();
    this.settingsTopic.set(topic);
    this.practiceRatio.set(topic.practiceRatio);
    this.isSettingsModalOpen.set(true);
  }

  closeSettingsModal() {
    this.isSettingsModalOpen.set(false);
    this.settingsTopic.set(null);
  }

  saveTopicSettings() {
    if (this.settingsTopic()) {
      this.dataService.updateTopicSettings(this.settingsTopic()!.id, { practiceRatio: this.practiceRatio() });
    }
    this.closeSettingsModal();
  }
}
