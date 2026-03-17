import { useState, useCallback } from 'react';
import { AIService, AIGeneratedFlashcards, AIGeneratedTest } from '@/lib/aiService';
import { Flashcard } from '@/types/flashcard';

interface UseAIState {
  isLoading: boolean;
  error: string | null;
  generatedFlashcards: AIGeneratedFlashcards | null;
  generatedTest: AIGeneratedTest | null;
}

interface UseAIActions {
  generateFlashcards: (text: string, count?: number, difficulty?: 'beginner' | 'intermediate' | 'advanced') => Promise<void>;
  generateTest: (flashcards: Flashcard[], count?: number, types?: Array<'multiple-choice' | 'true-false' | 'short-answer'>) => Promise<void>;
  clearError: () => void;
  clearResults: () => void;
}

export function useAI(): UseAIState & UseAIActions {
  const [state, setState] = useState<UseAIState>({
    isLoading: false,
    error: null,
    generatedFlashcards: null,
    generatedTest: null,
  });

  const generateFlashcards = useCallback(async (
    text: string,
    count: number = 10,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!AIService.isConfigured()) {
        throw new Error('AI service not configured. Please contact administrator.');
      }

      const result = await AIService.generateFlashcards(text, count, difficulty);
      setState(prev => ({
        ...prev,
        isLoading: false,
        generatedFlashcards: result,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
      }));
    }
  }, []);

  const generateTest = useCallback(async (
    flashcards: Flashcard[],
    count: number = 10,
    types: Array<'multiple-choice' | 'true-false' | 'short-answer'> = ['multiple-choice', 'true-false', 'short-answer']
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!AIService.isConfigured()) {
        throw new Error('AI service not configured. Please contact administrator.');
      }

      if (flashcards.length === 0) {
        throw new Error('No flashcards available to generate test from');
      }

      const result = await AIService.generateTest(flashcards, count, types);
      setState(prev => ({
        ...prev,
        isLoading: false,
        generatedTest: result,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate test',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      generatedFlashcards: null,
      generatedTest: null,
    });
  }, []);

  return {
    ...state,
    generateFlashcards,
    generateTest,
    clearError,
    clearResults,
  };
}
