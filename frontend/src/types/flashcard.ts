export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  created_at: string;
  set_id: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  class_name?: string;
  class_subject?: string;
  cards?: Flashcard[];
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name: string;
  is_public: boolean;
  study_count: number;
  card_count?: number;
}

export interface StudyProgress {
  id: string;
  card_id: string;
  user_id: string;
  known: boolean;
  attempts: number;
  last_studied: string;
}

export interface TestQuestion {
  id: string;
  test_result_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  correct_answer: string;
  options?: string;
  user_answer?: string;
  is_correct?: boolean;
}

export interface TestResult {
  id: string;
  user_id: string;
  set_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  questions?: TestQuestion[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}
