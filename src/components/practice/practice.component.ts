import { Component, ChangeDetectionStrategy, input, output, signal, computed, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Topic, VocabularyItem, PracticeAttempt } from '../../models/vocabulary.model';
import { DataService } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';

interface QuizQuestion {
  type: 'mcq' | 'fill-in-the-blank';
  questionText: string;
  correctAnswer: string; // The english word
  word: VocabularyItem;
  // For MCQ
  options?: string[];
}

type QuizState = 'generating'| 'in_progress' | 'finished';

@Component({
  selector: 'app-practice',
  standalone: true,
  templateUrl: './practice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeComponent implements OnInit {
  topic = input.required<Topic>();
  backToTopics = output<void>();

  private dataService = inject(DataService);
  private geminiService = inject(GeminiService);
  private platformId = inject(PLATFORM_ID);
  
  quizState = signal<QuizState>('generating');
  questions = signal<QuizQuestion[]>([]);
  currentQuestionIndex = signal(0);
  
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  selectedAnswer = signal<string | null>(null);
  fillInBlankAnswer = signal('');

  private audioContext: AudioContext | null = null;
  
  userAnswers = signal<Array<{ answer: string, correct: boolean }>>([]);

  score = computed(() => {
    return this.userAnswers().filter(a => a.correct).length;
  });

  progress = computed(() => {
    if (!this.questions().length) return 0;
    // Use userAnswers length for progress to feel more responsive
    return (this.userAnswers().length / this.questions().length) * 100;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.audioContext = new AudioContext();
    }
  }

  ngOnInit() {
    this.generateQuestions();
  }

  async generateQuestions() {
    this.quizState.set('generating');
    const topicVocab = [...this.topic().vocabularies];
    const shuffledVocab = this.shuffleArray(topicVocab);
    const quizQuestions: QuizQuestion[] = [];

    for (const vocabItem of shuffledVocab) {
      const isMcq = Math.random() < this.topic().practiceRatio;

      if (isMcq) { // Multiple Choice Question
        const localDistractors = this.getLocalDistractors(vocabItem, topicVocab, 3);
        let distractors = [...localDistractors];

        if (distractors.length < 3 && this.geminiService.isAvailable()) {
          const needed = 3 - distractors.length;
          const geminiDistractors = await this.geminiService.generateDistractors(vocabItem, needed);
          distractors.push(...geminiDistractors);
        }

        const allOtherWords = topicVocab.filter(v => v.id !== vocabItem.id).map(v => v.word);
        let finalDistractors = [...new Set(distractors)];
        let i = 0;
        while(finalDistractors.length < 3 && i < allOtherWords.length) {
          if (!finalDistractors.includes(allOtherWords[i])) {
            finalDistractors.push(allOtherWords[i]);
          }
          i++;
        }

        const options = this.shuffleArray([...finalDistractors.slice(0, 3), vocabItem.word]);
        quizQuestions.push({
          type: 'mcq',
          questionText: `Which vocabulary word means "${vocabItem.meaning}"?`,
          options: options,
          correctAnswer: vocabItem.word,
          word: vocabItem
        });
      } else { // Fill-in-the-blank Question
        quizQuestions.push({
          type: 'fill-in-the-blank',
          questionText: `What word means "${vocabItem.meaning}"?`,
          correctAnswer: vocabItem.word,
          word: vocabItem
        });
      }
    }
    
    this.questions.set(quizQuestions);
    this.restartQuiz();
  }

  private handleAnswer(answer: string) {
    if (this.selectedAnswer() !== null) return;

    this.selectedAnswer.set(answer);
    const question = this.currentQuestion();
    const isCorrect = answer.toLowerCase() === question.correctAnswer.toLowerCase();

    this.userAnswers.update(answers => [...answers, { answer, correct: isCorrect }]);
    
    const attempt: PracticeAttempt = {
      topicId: this.topic().id,
      wordId: question.word.id,
      timestamp: Date.now(),
      correct: isCorrect,
      questionType: question.type,
    };
    this.dataService.logPracticeAttempt(attempt);

    if (isCorrect) {
      this.playCorrectSound();
    }
    
    this.goToNextQuestionWithDelay();
  }

  selectAnswer(option: string) {
    this.handleAnswer(option);
  }

  submitFillInBlank() {
    const answer = this.fillInBlankAnswer().trim();
    if (!answer || this.selectedAnswer() !== null) return;
    this.handleAnswer(answer);
  }

  private goToNextQuestionWithDelay() {
     setTimeout(() => {
      if (this.currentQuestionIndex() < this.questions().length - 1) {
        this.currentQuestionIndex.update(i => i + 1);
        this.selectedAnswer.set(null);
        this.fillInBlankAnswer.set('');
      } else {
        this.quizState.set('finished');
      }
    }, 1500);
  }

  restartQuiz() {
    this.quizState.set('in_progress');
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.selectedAnswer.set(null);
    this.fillInBlankAnswer.set('');
  }

  getButtonClass(option: string): string {
    if (this.selectedAnswer() === null) {
      return 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600';
    }
    const isCorrect = option.toLowerCase() === this.currentQuestion().correctAnswer.toLowerCase();
    
    if (isCorrect) return 'bg-primary-500 text-white border-primary-500';
    if (option === this.selectedAnswer()) return 'bg-red-500 text-white border-red-500';

    return 'bg-white dark:bg-slate-700 opacity-60';
  }

  getInputClass(): string {
    if (this.selectedAnswer() === null) {
      return 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500';
    }
    const isCorrect = this.selectedAnswer()?.toLowerCase() === this.currentQuestion().correctAnswer.toLowerCase();
    if (isCorrect) {
      return 'bg-primary-100 dark:bg-primary-900 border-primary-500 text-primary-800 dark:text-primary-200';
    }
    return 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200';
  }

  private playCorrectSound() {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  private getLocalDistractors(item: VocabularyItem, allItems: VocabularyItem[], count: number): string[] {
    return this.shuffleArray(allItems)
      .filter(v => v.id !== item.id && v.partOfSpeech === item.partOfSpeech)
      .slice(0, count)
      .map(v => v.word);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}