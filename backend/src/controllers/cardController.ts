import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export class CardController {
  async getCardsBySet(req: AuthRequest, res: Response) {
    try {
      const { setId } = req.params;
      const { data: cards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Get cards error:', error);
        return res.status(500).json({ message: 'Failed to fetch cards' });
      }

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
      const { data: card, error } = await supabase
        .from('flashcards')
        .insert({
          term,
          definition,
          set_id: setId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Create card error:', error);
        return res.status(500).json({ message: 'Failed to create card' });
      }

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
      const { data: card, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update card error:', error);
        return res.status(500).json({ message: 'Failed to update card' });
      }

      res.json({ card });
    } catch (error) {
      console.error('Update card error:', error);
      res.status(500).json({ message: 'Failed to update card' });
    }
  }

  async deleteCard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete card error:', error);
        return res.status(500).json({ message: 'Failed to delete card' });
      }

      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ message: 'Failed to delete card' });
    }
  }

  async deleteCardsBySet(req: AuthRequest, res: Response) {
    try {
      const { setId } = req.params;
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', setId);

      if (error) {
        console.error('Delete cards by set error:', error);
        return res.status(500).json({ message: 'Failed to delete cards' });
      }

      res.json({ message: 'All cards in set deleted successfully' });
    } catch (error) {
      console.error('Delete cards by set error:', error);
      res.status(500).json({ message: 'Failed to delete cards' });
    }
  }

  async createCards(req: AuthRequest, res: Response) {
    try {
      const { setId, cards } = req.body;
      
      if (!setId || !cards) {
        return res.status(400).json({ message: 'setId and cards are required' });
      }
      
      const cardsWithSetId = cards.map((card: any) => ({
        term: card.term,
        definition: card.definition,
        set_id: setId,
        created_at: new Date().toISOString()
      }));
      
      const { data: createdCards, error } = await supabase
        .from('flashcards')
        .insert(cardsWithSetId)
        .select();

      if (error) {
        console.error('Create cards error:', error);
        return res.status(500).json({ message: 'Failed to create cards' });
      }

      res.status(201).json({ createdCards });
    } catch (error) {
      console.error('Create cards error:', error);
      res.status(500).json({ message: 'Failed to create cards' });
    }
  }
}
