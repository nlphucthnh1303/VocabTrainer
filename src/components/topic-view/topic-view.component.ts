import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import type { Topic, VocabularyItem } from '../../models/vocabulary.model';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  templateUrl: './topic-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicViewComponent {
  dataService = inject(DataService);
  
  topicId = input.required<string | null>();
  
  startPractice = output<void>();
  startFlashcards = output<void>();

  topic = computed(() => {
    const id = this.topicId();
    if (!id) return null;
    return this.dataService.topics().find(t => t.id === id) ?? null;
  });

  // Modals
  isVocabModalOpen = signal(false);
  isImportModalOpen = signal(false);
  editingItem = signal<VocabularyItem | null>(null);

  // Form signals
  word = signal('');
  phonetic = signal('');
  partOfSpeech = signal('');
  meaning = signal('');

  // Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  paginatedVocabularies = computed(() => {
    const vocab = this.topic()?.vocabularies ?? [];
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return vocab.slice(startIndex, startIndex + this.itemsPerPage());
  });

  totalPages = computed(() => {
     const vocab = this.topic()?.vocabularies ?? [];
     return Math.ceil(vocab.length / this.itemsPerPage());
  });

  openVocabModal(item: VocabularyItem | null = null) {
    this.editingItem.set(item);
    if (item) {
      this.word.set(item.word);
      this.phonetic.set(item.phonetic);
      this.partOfSpeech.set(item.partOfSpeech);
      this.meaning.set(item.meaning);
    } else {
      this.word.set('');
      this.phonetic.set('');
      this.partOfSpeech.set('');
      this.meaning.set('');
    }
    this.isVocabModalOpen.set(true);
  }

  closeVocabModal() {
    this.isVocabModalOpen.set(false);
    this.editingItem.set(null);
  }

  saveItem() {
    if (!this.word() || !this.meaning() || !this.topicId()) return;
    
    const itemData = {
      word: this.word(),
      phonetic: this.phonetic(),
      partOfSpeech: this.partOfSpeech(),
      meaning: this.meaning(),
    };

    if (this.editingItem()) {
      this.dataService.updateVocabularyItem(this.topicId()!, { ...itemData, id: this.editingItem()!.id });
    } else {
      this.dataService.addVocabularyItem(this.topicId()!, itemData);
    }
    this.closeVocabModal();
  }

  deleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this word? Its practice history will also be removed.')) {
      this.dataService.deleteVocabularyItem(this.topicId()!, itemId);
    }
  }

  handleFileImport(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      // Placeholder for XLSX parsing logic.
      // In a real app, you would use a library like 'xlsx' to parse the file.
      console.log(`File "${file.name}" selected. Parsing would happen here.`);
      alert(`Import functionality is a demo. Selected file: ${file.name}`);
      this.isImportModalOpen.set(false);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}