import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { TranslationService } from '../../services/translation.service';
import { VocabularyService } from '../../services/vocabulary.service';
import type { Topic, VocabularyItem } from '../../models/vocabulary.model';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  templateUrl: './topic-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicViewComponent {
  dataService = inject(DataService);
  public translationService = inject(TranslationService);
  public vocabularyService = inject(VocabularyService);
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
  
  ngOnInit() {
      // Gọi hàm tải dữ liệu ngay khi component được khởi tạo
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
          // this.topic().vocabularies = mergedVocabs;
          console.log('Vocabulary items loaded and merged:', mergedVocabs);
      });
  }
  paginatedVocabularies = computed(() => {
      const vocab = this.vocabulariesWithDetails(); // Lấy dữ liệu từ Signal
      // Logic phân trang đồng bộ
      const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
      return vocab.slice(startIndex, startIndex + this.itemsPerPage());
  });


  // paginatedVocabularies = computed(() => {
  //     console.log(this.topic());

  //     // KHÔNG KHUYẾN KHÍCH: Logic không đồng bộ trong hàm computed
  //     this.vocabularyService.getItems().subscribe(data => {
  //         data.forEach(item => {
  //             this.topic()?.vocabularies.forEach(vocab => {
  //                 if (vocab === item.id) {
  //                     Object.assign(vocab, item);
  //                 }
  //             });
  //         }); // <-- Dấu ngoặc nhọn đóng của data.forEach
          
  //         console.log('Vocabulary items from Firestore:', this.topic());
  //     }); // <-- Dấu ngoặc nhọn đóng của .subscribe

  //     // Logic phân trang đồng bộ
  //     const vocab = this.topic()?.vocabularies ?? [];
  //     const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
  //     return vocab.slice(startIndex, startIndex + this.itemsPerPage());
  // }); // <-- Dấu ngoặc nhọn đóng của computed




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
      // this.vocabularyService.
      this.dataService.addVocabularyItem(this.topicId()!, itemData);



    }
    this.closeVocabModal();
  }

  deleteItem(itemId: string) {
    if (confirm(this.translationService.translate('deleteWordConfirm'))) {
      this.dataService.deleteVocabularyItem(this.topicId()!, itemId);
    }
  }
  vocabularyArray = signal<VocabularyItem[]>([]);
  jsonOutput: string = '';
  jsonInput = signal<string>('');
  errorMessage = signal<string>('');
  handleFileImport(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        console.error('Lỗi: Định dạng file không hợp lệ. Vui lòng chọn tệp .csv.');
        this.vocabularyArray.set([]);
        this.jsonOutput = '[]';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        if (csvContent) {
          const lines = csvContent.split('\n').filter(line => line.trim() !== '');
          if (lines.length === 0) {
              this.vocabularyArray.set([]);
              this.jsonOutput = '[]';
              return;
          }

          // 1. Lấy tiêu đề (Header)
          const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

          // 2. Xử lý các dòng dữ liệu
          const data: VocabularyItem[] = lines.slice(1).map(line => {
              // Regex để xử lý dấu phẩy bên trong dấu ngoặc kép:
              // ( ".*?" | [^",]+ ) => Match either a quoted string or a non-comma-non-quote sequence
              const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
              
              if (!values || values.length !== header.length) {
                  console.warn('Lỗi phân tích cú pháp ở dòng:', line, 'Đã bỏ qua dòng này.');
                  return null;
              }

              const obj: any = {};
              values.forEach((value, i) => {
                  // Loại bỏ dấu ngoặc kép (") ở đầu và cuối chuỗi, nếu có.
                  const cleanedValue = value.trim().replace(/^"|"$/g, '');
                  // Gán giá trị vào đối tượng
                  obj[header[i]] = cleanedValue;
              });

              return obj as VocabularyItem;
          }).filter((obj): obj is VocabularyItem => obj !== null); // Lọc bỏ các dòng bị lỗi và xác định kiểu

          // Cập nhật Signals và JSON output
          this.vocabularyArray.set(data);
          this.jsonOutput = JSON.stringify(data, null, 2);
          console.log('Dữ liệu từ vựng Angular đã phân tích:', data);
        }
      };
      reader.onerror = () => {
        console.error("Lỗi khi đọc tệp:", reader.error);
        this.vocabularyArray.set([]);
        this.jsonOutput = '[]';
      };

      // Đọc tệp dưới dạng văn bản
      reader.readAsText(file);
      console.log(`File "${file.name}" selected. Parsing is in progress...`);

      this.isImportModalOpen.set(false);
    } else {
      this.vocabularyArray.set([]);
      this.jsonOutput = '[]';
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  private resetState(): void {
    this.vocabularyArray.set([]);
    this.jsonOutput = '[]';
    this.errorMessage.set('');
  }

  handleParse(): void {
    this.resetState();
    const jsonString = this.jsonInput().trim();
    console.log('Input JSON string:', jsonString);
    if (!jsonString) {
      this.errorMessage.set('Vui lòng nhập chuỗi JSON vào khu vực văn bản.');
      return;
    }
    let parsedData: any;
  

    try {
      parsedData = JSON.parse(jsonString);
    } catch (error) {
      this.errorMessage.set('Lỗi cú pháp JSON. Vui lòng kiểm tra lại cấu trúc dấu ngoặc nhọn, dấu hai chấm và dấu phẩy.');
      console.error('JSON Parsing Error:', error);
      return;
    }
    if (!Array.isArray(parsedData)) {
      this.errorMessage.set('Dữ liệu JSON phải là một mảng (bắt đầu bằng "[" và kết thúc bằng "]").');
      return;
    }
    // 3. Chuẩn hóa và kiểm tra cấu trúc từng mục
    const vocabularyData: VocabularyItem[] = parsedData.map((item: any) => {
        // Kiểm tra sự hiện diện của các trường bắt buộc
        const requiredKeys = ['word', 'phonetic', 'partOfSpeech', 'meaning'];
        const missingKeys = requiredKeys.filter(key => !item.hasOwnProperty(key));
        if (missingKeys.length > 0) {
            this.errorMessage.set(`Dữ liệu thiếu các trường bắt buộc: ${missingKeys.join(', ')}. Dữ liệu sẽ không được xử lý.`);
            console.error(`Lỗi: Dữ liệu JSON thiếu trường bắt buộc: ${missingKeys.join(', ')}`, item);
            return null; // Đánh dấu là lỗi
        }
        // Tạo đối tượng VocabularyItem chuẩn hóa
        return item as VocabularyItem;
    }).filter((obj): obj is VocabularyItem => obj !== null); // Lọc bỏ các mục bị lỗi
    
    vocabularyData.forEach(vocab => {
      console.log('Adding vocabulary item:', vocab);
      this.dataService.addVocabularyItem(this.topicId()!, vocab);
    });

  
    if (vocabularyData.length === 0 && parsedData.length > 0) {
        // Xảy ra lỗi cấu trúc trong tất cả các mục
        // Thông báo lỗi đã được đặt bên trong map()
        return;
    }

    // Cập nhật Signals và JSON output
    this.vocabularyArray.set(vocabularyData);
    this.jsonOutput = JSON.stringify(vocabularyData, null, 2);
    this.errorMessage.set('');

    console.log('Dữ liệu từ vựng đã phân tích từ JSON:', vocabularyData);
  }



}
