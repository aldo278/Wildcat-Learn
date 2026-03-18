import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Flashcard Set schemas
export const createSetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false)
});

export const updateSetSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional()
});

// Flashcard schemas
export const createCardSchema = z.object({
  term: z.string().min(1, 'Term is required'),
  definition: z.string().min(1, 'Definition is required')
});

export const updateCardSchema = z.object({
  term: z.string().min(1, 'Term is required').optional(),
  definition: z.string().min(1, 'Definition is required').optional()
});

export const batchCreateCardsSchema = z.object({
  cards: z.array(createCardSchema).min(1, 'At least one card is required')
});

// Study Progress schemas
export const updateProgressSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  known: z.boolean(),
  attempts: z.number().int().min(0).optional()
});

// Test schemas
export const generateTestSchema = z.object({
  setId: z.string().min(1, 'Set ID is required'),
  questionCount: z.number().int().min(1).max(50).optional().default(10),
  questionTypes: z.array(z.enum(['multiple-choice', 'true-false', 'short-answer'])).optional()
});

export const saveTestResultSchema = z.object({
  setId: z.string().min(1, 'Set ID is required'),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
    question: z.string(),
    correctAnswer: z.string(),
    userAnswer: z.string().optional(),
    isCorrect: z.boolean().optional()
  }))
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSetInput = z.infer<typeof createSetSchema>;
export type UpdateSetInput = z.infer<typeof updateSetSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type BatchCreateCardsInput = z.infer<typeof batchCreateCardsSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type GenerateTestInput = z.infer<typeof generateTestSchema>;
export type SaveTestResultInput = z.infer<typeof saveTestResultSchema>;
