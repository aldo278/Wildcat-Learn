import { Request, Response } from 'express';
import { prisma } from '../../server';
import { AuthRequest } from '../middleware/auth';

export class CardController {
  async getCardsBySet(req: AuthRequest, res: Response) {
    try {
      const { setId } = req.params;
      const cards = await prisma.flashcard.findMany({
        where: { setId },
        orderBy: { createdAt: 'asc' }
      });
      res.json({ cards });
    } catch (error) {
      console.error('Get cards error:', error);
      res.status(500).json({ message: 'Failed to fetch cards' });
    }
  }

  async createCard(req: AuthRequest, res: Response) {
    try {
      const { setId } = req.params;
      const { term, definition } = req.body;
      const card = await prisma.flashcard.create({
        data: { term, definition, setId }
      });
      res.status(201).json({ card });
    } catch (error) {
      console.error('Create card error:', error);
      res.status(500).json({ message: 'Failed to create card' });
    }
  }

  async updateCard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const card = await prisma.flashcard.update({
        where: { id },
        data: updates
      });
      res.json({ card });
    } catch (error) {
      console.error('Update card error:', error);
      res.status(500).json({ message: 'Failed to update card' });
    }
  }

  async deleteCard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.flashcard.delete({ where: { id } });
      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ message: 'Failed to delete card' });
    }
  }

  async createCards(req: AuthRequest, res: Response) {
    try {
      const { setId, cards } = req.body;
      
      if (!setId || !cards) {
        return res.status(400).json({ message: 'setId and cards are required' });
      }
      
      const cardsWithSetId = cards.map((card: any) => ({
        ...card,
        setId
      }));
      
      const createdCards = await prisma.flashcard.createMany({
        data: cardsWithSetId
      });
      res.status(201).json({ createdCards });
    } catch (error) {
      console.error('Create cards error:', error);
      res.status(500).json({ message: 'Failed to create cards' });
    }
  }
}
