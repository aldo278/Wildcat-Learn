import { Request, Response } from 'express';
import { prisma } from '../../server';
import { AuthRequest } from '../middleware/auth';

export class ProgressController {
  async getUserProgress(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const progress = await prisma.studyProgress.findMany({
        where: { userId },
        include: {
          card: {
            select: { id: true, term: true, definition: true }
          }
        }
      });
      res.json({ progress });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  }

  async getSetProgress(req: AuthRequest, res: Response) {
    try {
      const { userId, setId } = req.params;
      const progress = await prisma.studyProgress.findMany({
        where: { userId },
        include: {
          card: {
            select: { id: true, term: true, definition: true, setId: true }
          }
        }
      });
      
      // Filter cards by setId
      const filteredProgress = progress.filter((p: any) => p.card.setId === setId);
      res.json({ progress });
    } catch (error) {
      console.error('Get set progress error:', error);
      res.status(500).json({ message: 'Failed to fetch set progress' });
    }
  }

  async updateProgress(req: AuthRequest, res: Response) {
    try {
      const { cardId, known, attempts } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const progress = await prisma.studyProgress.upsert({
        where: {
          userId_cardId: { userId, cardId }
        },
        update: {
          known,
          attempts: attempts || undefined,
          lastStudied: new Date()
        },
        create: {
          userId,
          cardId,
          known,
          attempts: attempts || 1
        }
      });

      res.json({ progress });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  }
}
