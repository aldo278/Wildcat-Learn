import { Request, Response } from 'express';
import { prisma } from '../../server';
import { AuthRequest } from '../middleware/auth';

export class TestController {
  async generateTest(req: AuthRequest, res: Response) {
    try {
      const { setId, questionCount, questionTypes } = req.body;
      
      // Get cards from set
      const cards = await prisma.flashcard.findMany({
        where: { setId },
        take: questionCount || 10
      });

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

      const testResult = await prisma.testResult.create({
        data: {
          userId,
          setId,
          score,
          totalQuestions,
          questions: {
            create: questions.map((q: any) => ({
              type: q.type,
              question: q.question,
              correctAnswer: q.correctAnswer,
              options: q.options || [],
              userAnswer: q.userAnswer,
              isCorrect: q.isCorrect
            }))
          }
        },
        include: {
          questions: true
        }
      });

      res.status(201).json({ testResult });
    } catch (error) {
      console.error('Save test result error:', error);
      res.status(500).json({ message: 'Failed to save test result' });
    }
  }

  async getUserTestHistory(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const testResults = await prisma.testResult.findMany({
        where: { userId },
        include: {
          set: {
            select: { id: true, title: true }
          },
          questions: true
        },
        orderBy: { completedAt: 'desc' }
      });

      res.json({ testResults });
    } catch (error) {
      console.error('Get test history error:', error);
      res.status(500).json({ message: 'Failed to fetch test history' });
    }
  }
}
