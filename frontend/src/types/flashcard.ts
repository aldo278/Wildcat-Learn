export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  createdAt: Date;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  studyCount: number;
}

export interface StudyProgress {
  cardId: string;
  known: boolean;
  attempts: number;
  lastStudied: Date;
}

export interface TestQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface TestResult {
  setId: string;
  score: number;
  totalQuestions: number;
  questions: TestQuestion[];
  completedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}
