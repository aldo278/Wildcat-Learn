import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export class TestController {
  async generateTest(req: AuthRequest, res: Response) {
    try {
      const { setId, questionCount, questionTypes } = req.body;
      
      // Get cards from set
      const { data: cards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .limit(questionCount || 10);

      if (error || !cards) {
        console.error('Generate test error:', error);
        return res.status(500).json({ message: 'Failed to generate test' });
      }

      // Generate test questions (simplified version)
      const questions = cards.map(card => ({
        id: `test-${card.id}`,
        type: 'multiple-choice',
        question: `What is the definition of: ${card.term}?`,
        correctAnswer: card.definition,
        options: [
          card.definition,
          'Incorrect option 1',
          'Incorrect option 2', 
          'Incorrect option 3'
        ]
      }));

      res.json({ questions });
    } catch (error) {
      console.error('Generate test error:', error);
      res.status(500).json({ message: 'Failed to generate test' });
    }
  }

  async saveTestResult(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { setId, score, totalQuestions, questions } = req.body;

      // Create test result
      const { data: testResult, error: resultError } = await supabase
        .from('test_results')
        .insert({
          user_id: userId,
          set_id: setId,
          score,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (resultError || !testResult) {
        console.error('Save test result error:', resultError);
        return res.status(500).json({ message: 'Failed to save test result' });
      }

      // Create test questions
      const questionsData = questions.map((q: any) => ({
        test_result_id: testResult.id,
        type: q.type,
        question: q.question,
        correct_answer: q.correctAnswer,
        options: JSON.stringify(q.options || []),
        user_answer: q.userAnswer,
        is_correct: q.isCorrect
      }));

      const { data: createdQuestions, error: questionsError } = await supabase
        .from('test_questions')
        .insert(questionsData)
        .select();

      if (questionsError) {
        console.error('Save test questions error:', questionsError);
        return res.status(500).json({ message: 'Failed to save test questions' });
      }

      res.status(201).json({ 
        testResult: {
          ...testResult,
          questions: createdQuestions
        }
      });
    } catch (error) {
      console.error('Save test result error:', error);
      res.status(500).json({ message: 'Failed to save test result' });
    }
  }

  async getUserTestHistory(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { data: testResults, error } = await supabase
        .from('test_results')
        .select(`
          *,
          set:flashcard_sets(id, title),
          questions:test_questions(*)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Get test history error:', error);
        return res.status(500).json({ message: 'Failed to fetch test history' });
      }

      res.json({ testResults });
    } catch (error) {
      console.error('Get test history error:', error);
      res.status(500).json({ message: 'Failed to fetch test history' });
    }
  }
}
