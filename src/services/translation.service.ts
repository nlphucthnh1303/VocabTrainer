import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'vi';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  currentLang = signal<Language>('en');

  private dictionaries: Record<Language, Record<string, string>> = {
    en: {
      // App
      appTitle: 'Vocabulary Trainer',
      backToDashboard: 'Back to Dashboard',
      // Dashboard
      myTopics: 'My Topics',
      progressReport: 'Progress Report',
      newTopic: 'New Topic',
      words: 'words',
      practice: 'Practice',
      flashcards: 'Flashcards',
      settings: 'Settings',
      editTopic: 'Edit Topic',
      deleteTopic: 'Delete Topic',
      deleteTopicConfirm: 'Are you sure you want to delete this topic and all its words? This will also remove its practice history.',
      noTopics: 'No topics',
      noTopicsDesc: 'Get started by creating a new topic.',
      createTopicTitle: 'Create New Topic',
      editTopicTitle: 'Edit Topic',
      topicName: 'Topic Name',
      description: 'Description',
      difficulty: 'Difficulty',
      cancel: 'Cancel',
      saveTopic: 'Save Topic',
      practiceSettings: 'Practice Settings',
      forTopic: 'For topic:',
      questionRatio: 'Question Type Ratio',
      fillInTheBlank: 'Fill-in-the-Blank',
      multipleChoice: 'Multiple Choice',
      saveSettings: 'Save Settings',
      // Topic View
      startPractice: 'Start Practice',
      flashcardMode: 'Flashcard Mode',
      vocabList: 'Vocabulary List',
      importFromJson: 'Import from JSON',
      addWord: 'Add Word',
      word: 'Word',
      phonetic: 'Phonetic',
      partOfSpeech: 'Part of Speech',
      meaning: 'Meaning',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      noWords: 'No words in this topic yet. Add one to get started!',
      page: 'Page',
      of: 'of',
      prev: 'Prev',
      next: 'Next',
      editWordTitle: 'Edit Word',
      addWordTitle: 'Add New Word',
      saveWord: 'Save Word',
      importModalTitle: 'Import from json',
      importModalDesc: 'Select an .json file with your vocabulary. The file must have four columns in this exact order:',
      importModalUpload: 'Click to upload a file',
      deleteWordConfirm: 'Are you sure you want to delete this word? Its practice history will also be removed.',
      topicNotFound: 'Topic not found.',
      // Flashcards
      card: 'Card',
      noFlashcards: 'No Flashcards to Display',
      noFlashcardsDesc: 'This topic does not have any vocabulary words.',
      previous: 'Previous',
      // Practice
      generatingQuiz: 'Generating Your Quiz',
      pleaseWait: 'Please wait a moment...',
      question: 'Question',
      yourAnswer: 'Your answer...',
      submitAnswer: 'Submit Answer',
      correctAnswerIs: 'The correct answer is:',
      quizFinished: 'Quiz Finished!',
      yourScore: 'Your Score:',
      reviewAnswers: 'Review Your Answers',
      yourAnswerWas: 'Your answer:',
      correct: '(Correct)',
      incorrect: '(Incorrect)',
      correctAnswer: 'Correct answer:',
      tryAgain: 'Try Again',
      // Reporting
      practiceReport: 'Practice Report',
      noPracticeData: 'No practice data',
      noPracticeDataDesc: 'Start a practice session to see your progress.',
      overallAccuracy: 'Overall Accuracy',
      correctOutOf: 'correct out of',
      attempts: 'attempts',
      performanceByTopic: 'Performance by Topic',
      wordsToReview: 'Words to Review',
      wordsToReviewDesc: "Top 5 words you've had the most trouble with.",
      
      partOfSpeech_Noun: "Noun",
      partOfSpeech_Verb: "Verb",
      partOfSpeech_Adjective: "Adjective",
      partOfSpeech_Adverb: "Adverb",
      partOfSpeech_Pronoun: "Pronoun",
      partOfSpeech_Preposition: "Preposition",
      partOfSpeech_Conjunction: "Conjunction",
      partOfSpeech_Gerund: "Gerund"
    },
    vi: {
      // App
      appTitle: 'Luyện Từ Vựng',
      backToDashboard: 'Quay lại Bảng điều khiển',
      // Dashboard
      myTopics: 'Chủ đề của tôi',
      progressReport: 'Báo cáo Tiến độ',
      newTopic: 'Chủ đề mới',
      words: 'từ',
      practice: 'Luyện tập',
      flashcards: 'Thẻ ghi nhớ',
      settings: 'Cài đặt',
      editTopic: 'Sửa chủ đề',
      deleteTopic: 'Xóa chủ đề',
      deleteTopicConfirm: 'Bạn có chắc muốn xóa chủ đề này và tất cả các từ trong đó không? Lịch sử luyện tập cũng sẽ bị xóa.',
      noTopics: 'Chưa có chủ đề nào',
      noTopicsDesc: 'Bắt đầu bằng cách tạo một chủ đề mới.',
      createTopicTitle: 'Tạo chủ đề mới',
      editTopicTitle: 'Chỉnh sửa chủ đề',
      topicName: 'Tên chủ đề',
      description: 'Mô tả',
      difficulty: 'Độ khó',
      cancel: 'Hủy',
      saveTopic: 'Lưu chủ đề',
      practiceSettings: 'Cài đặt Luyện tập',
      forTopic: 'Cho chủ đề:',
      questionRatio: 'Tỷ lệ loại câu hỏi',
      fillInTheBlank: 'Điền vào chỗ trống',
      multipleChoice: 'Trắc nghiệm',
      saveSettings: 'Lưu cài đặt',
      // Topic View
      startPractice: 'Bắt đầu Luyện tập',
      flashcardMode: 'Chế độ Thẻ ghi nhớ',
      vocabList: 'Danh sách từ vựng',
      importFromJson: 'Nhập từ JSON',
      addWord: 'Thêm từ',
      word: 'Từ',
      phonetic: 'Phiên âm',
      partOfSpeech: 'Loại từ',
      meaning: 'Nghĩa',
      actions: 'Hành động',
      edit: 'Sửa',
      delete: 'Xóa',
      noWords: 'Chưa có từ nào trong chủ đề này. Hãy thêm một từ để bắt đầu!',
      page: 'Trang',
      of: 'trên',
      prev: 'Trước',
      next: 'Sau',
      editWordTitle: 'Sửa từ',
      addWordTitle: 'Thêm từ mới',
      saveWord: 'Lưu từ',
      importModalTitle: 'Nhập từ json',
      importModalDesc: 'Chọn mã .json chứa từ vựng của bạn. Tệp phải có bốn cột theo đúng thứ tự này:',
      importModalUpload: 'Nhấp để tải lên một tệp',
      deleteWordConfirm: 'Bạn có chắc muốn xóa từ này không? Lịch sử luyện tập của nó cũng sẽ bị xóa.',
      topicNotFound: 'Không tìm thấy chủ đề.',
      // Flashcards
      card: 'Thẻ',
      noFlashcards: 'Không có thẻ ghi nhớ để hiển thị',
      noFlashcardsDesc: 'Chủ đề này không có từ vựng nào.',
      previous: 'Trước',
      // Practice
      generatingQuiz: 'Đang tạo bài kiểm tra',
      pleaseWait: 'Vui lòng đợi một lát...',
      question: 'Câu hỏi',
      yourAnswer: 'Câu trả lời của bạn...',
      submitAnswer: 'Nộp câu trả lời',
      correctAnswerIs: 'Đáp án đúng là:',
      quizFinished: 'Kết thúc bài kiểm tra!',
      yourScore: 'Điểm của bạn:',
      reviewAnswers: 'Xem lại câu trả lời',
      yourAnswerWas: 'Câu trả lời của bạn:',
      correct: '(Đúng)',
      incorrect: '(Sai)',
      correctAnswer: 'Đáp án đúng:',
      tryAgain: 'Thử lại',
      // Reporting
      practiceReport: 'Báo cáo luyện tập',
      noPracticeData: 'Không có dữ liệu luyện tập',
      noPracticeDataDesc: 'Bắt đầu một buổi luyện tập để xem tiến trình của bạn.',
      overallAccuracy: 'Độ chính xác tổng thể',
      correctOutOf: 'trả lời đúng trên tổng số',
      attempts: 'lượt',
      performanceByTopic: 'Hiệu suất theo chủ đề',
      wordsToReview: 'Các từ cần ôn tập',
      wordsToReviewDesc: '5 từ hàng đầu mà bạn gặp khó khăn nhất.',

      partOfSpeech_Noun: "Danh từ",
      partOfSpeech_Verb: "Động từ",
      partOfSpeech_Adjective: "Tính từ",
      partOfSpeech_Adverb: "Trạng từ",
      partOfSpeech_Pronoun: "Đại từ",
      partOfSpeech_Preposition: "Giới từ",
      partOfSpeech_Conjunction: "Liên từ",
      partOfSpeech_Gerund: "Danh động từ"
    },
  };

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedLang = localStorage.getItem('vocab-lang') as Language | null;
        if (storedLang && (storedLang === 'en' || storedLang === 'vi')) {
          this.currentLang.set(storedLang);
        }
      } catch (e) {
        console.error('Could not access localStorage for language.', e);
      }
    }
    
    effect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            localStorage.setItem('vocab-lang', this.currentLang());
          } catch (e) {
            console.error('Could not write language to localStorage.', e);
          }
        }
    });
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    return this.dictionaries[this.currentLang()][key] || key;
  }
}