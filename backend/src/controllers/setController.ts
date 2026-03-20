import { Request, Response } from 'express';
import { prisma } from '../../server';
import { AuthRequest } from '../middleware/auth';
import { CreateSetInput, UpdateSetInput } from '../utils/validation';

export class SetController {
  async getPublicSets(req: Request, res: Response) {
    try {
      const sets = await prisma.flashcardSet.findMany({
        where: { isPublic: true },
        include: {
          author: {
            select: { id: true, name: true }
          },
          _count: {
            select: { cards: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ sets });
    } catch (error) {
      console.error('Get public sets error:', error);
      res.status(500).json({ message: 'Failed to fetch public sets' });
    }
  }

  async getSetById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const set = await prisma.flashcardSet.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true }
          },
          cards: {
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { cards: true }
          }
        }
      });

      if (!set) {
        return res.status(404).json({ message: 'Set not found' });
      }

      // Check if set is public or user is the author
      if (!set.isPublic) {
        // For now, we'll allow access to private sets
        // In a real implementation, you'd check if the user is the author
      }

      res.json({ set });
    } catch (error) {
      console.error('Get set by ID error:', error);
      res.status(500).json({ message: 'Failed to fetch set' });
    }
  }

  async getUserSets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const sets = await prisma.flashcardSet.findMany({
        where: { authorId: userId },
        include: {
          _count: {
            select: { cards: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json({ sets });
    } catch (error) {
      console.error('Get user sets error:', error);
      res.status(500).json({ message: 'Failed to fetch user sets' });
    }
  }

  async createSet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { title, description, className, classSubject, isPublic }: CreateSetInput = req.body;

      const set = await prisma.flashcardSet.create({
        data: {
          title,
          description: description || '',
          className: className || null,
          classSubject: classSubject || null,
          isPublic: isPublic || false,
          authorId: userId
        },
        include: {
          author: {
            select: { id: true, name: true }
          },
          _count: {
            select: { cards: true }
          }
        }
      });

      res.status(201).json({ set });
    } catch (error) {
      console.error('Create set error:', error);
      res.status(500).json({ message: 'Failed to create set' });
    }
  }

  async updateSet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { id } = req.params;
      const updates: UpdateSetInput = req.body;

      // Check if set exists and user is the author
      const existingSet = await prisma.flashcardSet.findUnique({
        where: { id }
      });

      if (!existingSet) {
        return res.status(404).json({ message: 'Set not found' });
      }

      if (existingSet.authorId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this set' });
      }

      const set = await prisma.flashcardSet.update({
        where: { id },
        data: updates,
        include: {
          author: {
            select: { id: true, name: true }
          },
          _count: {
            select: { cards: true }
          }
        }
      });

      res.json({ set });
    } catch (error) {
      console.error('Update set error:', error);
      res.status(500).json({ message: 'Failed to update set' });
    }
  }

  async deleteSet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { id } = req.params;

      // Check if set exists and user is the author
      const existingSet = await prisma.flashcardSet.findUnique({
        where: { id }
      });

      if (!existingSet) {
        return res.status(404).json({ message: 'Set not found' });
      }

      if (existingSet.authorId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this set' });
      }

      await prisma.flashcardSet.delete({
        where: { id }
      });

      res.json({ message: 'Set deleted successfully' });
    } catch (error) {
      console.error('Delete set error:', error);
      res.status(500).json({ message: 'Failed to delete set' });
    }
  }
}
