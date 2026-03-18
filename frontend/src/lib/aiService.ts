import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Flashcard, TestQuestion } from '@/types/flashcard';

// Initialize the AI client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface AIGeneratedFlashcards {
  flashcards: Array<{
    term: string;
    definition: string;
    confidence: number;
  }>;
  topics: string[];
  summary: string;
}

export interface AIGeneratedTest {
  questions: Array<{
    question: string;
    correctAnswer: string;
    options?: string[];
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  totalQuestions: number;
  estimatedTime: number;
}

export class AIService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  /**
   * Generate flashcards from document text
   */
  static async generateFlashcards(
    documentText: string,
    cardCount: number = 10,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<AIGeneratedFlashcards> {
    const prompt = this.buildFlashcardPrompt(documentText, cardCount, difficulty);
    
    try {
      const result = await this.withRetry(() => model.generateContent(prompt));
      const response = await result.response;
      const text = response.text();
      
      return this.parseFlashcardResponse(text);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate test questions from existing flashcards
   */
  static async generateTest(
    flashcards: Flashcard[],
    questionCount: number = 10,
    questionTypes: Array<'multiple-choice' | 'true-false' | 'short-answer'> = ['multiple-choice', 'true-false', 'short-answer']
  ): Promise<AIGeneratedTest> {
    const prompt = this.buildTestPrompt(flashcards, questionCount, questionTypes);
    
    try {
      const result = await this.withRetry(() => model.generateContent(prompt));
      const response = await result.response;
      const text = response.text();
      
      return this.parseTestResponse(text);
    } catch (error) {
      console.error('Error generating test:', error);
      throw new Error(`Failed to generate test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retry mechanism for API calls
   */
  private static async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.RETRY_DELAY * (this.MAX_RETRIES - retries + 1));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private static isRetryableError(error: any): boolean {
    // Check for rate limit errors or temporary failures
    if (error?.status === 429 || error?.status === 503) {
      return true;
    }
    if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
      return true;
    }
    return false;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Build prompt for flashcard generation
   */
  private static buildFlashcardPrompt(
    documentText: string,
    cardCount: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    const truncatedText = documentText.slice(0, 8000); // Limit text length
    
    return `You are an expert educational content creator. Based on the following document, create ${cardCount} high-quality flashcards for ${difficulty} level students.

DOCUMENT TEXT:
"""
${truncatedText}
"""

INSTRUCTIONS:
1. Extract the most important concepts, definitions, and key facts
2. Create flashcards with clear terms and concise definitions
3. Ensure each flashcard is self-contained and easy to understand
4. Focus on core concepts that would be essential for studying
5. Assign a confidence score (0.1-1.0) based on how clearly the concept is explained in the text

RESPONSE FORMAT (JSON):
{
  "flashcards": [
    {
      "term": "Clear term or concept",
      "definition": "Concise, clear definition",
      "confidence": 0.9
    }
  ],
  "topics": ["Main topic 1", "Main topic 2", "Main topic 3"],
  "summary": "Brief summary of the main themes covered"
}

Generate exactly ${cardCount} flashcards. Respond only with valid JSON.`;
  }

  /**
   * Build prompt for test generation
   */
  private static buildTestPrompt(
    flashcards: Flashcard[],
    questionCount: number,
    questionTypes: Array<'multiple-choice' | 'true-false' | 'short-answer'>
  ): string {
    const flashcardText = flashcards
      .map(fc => `Term: ${fc.term}\nDefinition: ${fc.definition}`)
      .join('\n\n');

    return `You are an expert educational assessment creator. Based on the following flashcards, create ${questionCount} test questions to evaluate student understanding.

FLASHCARDS:
"""
${flashcardText}
"""

INSTRUCTIONS:
1. Create questions that test understanding of the key concepts
2. Mix different question types: ${questionTypes.join(', ')}
3. For multiple-choice questions, provide 4 options with one correct answer
4. Include a mix of difficulty levels (easy, medium, hard)
5. Ensure questions are clear and unambiguous
6. Estimate completion time in minutes

RESPONSE FORMAT (JSON):
{
  "questions": [
    {
      "question": "Clear question text",
      "correctAnswer": "Correct answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "type": "multiple-choice",
      "difficulty": "medium"
    }
  ],
  "totalQuestions": ${questionCount},
  "estimatedTime": 15
}

Generate exactly ${questionCount} questions. For true-false questions, include only "correctAnswer" (no options). For short-answer questions, include only "correctAnswer". Respond only with valid JSON.`;
  }

  /**
   * Parse flashcard response from AI
   */
  private static parseFlashcardResponse(text: string): AIGeneratedFlashcards {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        throw new Error('Invalid flashcard format in response');
      }

      return {
        flashcards: parsed.flashcards.map((fc: any) => ({
          term: fc.term || '',
          definition: fc.definition || '',
          confidence: fc.confidence || 0.5,
        })),
        topics: parsed.topics || [],
        summary: parsed.summary || '',
      };
    } catch (error) {
      console.error('Error parsing flashcard response:', error);
      throw new Error('Failed to parse AI response for flashcards');
    }
  }

  /**
   * Parse test response from AI
   */
  private static parseTestResponse(text: string): AIGeneratedTest {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid test format in response');
      }

      return {
        questions: parsed.questions.map((q: any) => ({
          question: q.question || '',
          correctAnswer: q.correctAnswer || '',
          options: q.options,
          type: q.type || 'multiple-choice',
          difficulty: q.difficulty || 'medium',
        })),
        totalQuestions: parsed.totalQuestions || parsed.questions.length,
        estimatedTime: parsed.estimatedTime || 15,
      };
    } catch (error) {
      console.error('Error parsing test response:', error);
      throw new Error('Failed to parse AI response for test');
    }
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!(import.meta.env.VITE_GEMINI_API_KEY);
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): {
    isConfigured: boolean;
    message: string;
  } {
    if (this.isConfigured()) {
      return {
        isConfigured: true,
        message: 'AI service is ready',
      };
    } else {
      return {
        isConfigured: false,
        message: 'AI service not configured. Please add VITE_GEMINI_API_KEY to your environment variables.',
      };
    }
  }
}
