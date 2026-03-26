import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export class ProgressController {
  async getUserProgress(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { data: progress, error } = await supabase
        .from('study_progress')
        .select(`
          *,
          card:flashcards(id, term, definition)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Get progress error:', error);
        return res.status(500).json({ message: 'Failed to fetch progress' });
      }

      res.json({ progress });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  }

  async getSetProgress(req: AuthRequest, res: Response) {
    try {
      const { userId, setId } = req.params;
      const { data: progress, error } = await supabase
        .from('study_progress')
        .select(`
          *,
          card:flashcards!inner(id, term, definition, set_id)
        `)
        .eq('user_id', userId)
        .eq('card.set_id', setId);

      if (error) {
        console.error('Get set progress error:', error);
        return res.status(500).json({ message: 'Failed to fetch set progress' });
      }

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

      // Check if progress exists
      const { data: existing } = await supabase
        .from('study_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .single();

      let progress;
      if (existing) {
        // Update existing progress
        const updateData: any = {
          known,
          last_studied: new Date().toISOString()
        };
        if (attempts !== undefined) updateData.attempts = attempts;

        const { data, error } = await supabase
          .from('study_progress')
          .update(updateData)
          .eq('user_id', userId)
          .eq('card_id', cardId)
          .select()
          .single();

        if (error) {
          console.error('Update progress error:', error);
          return res.status(500).json({ message: 'Failed to update progress' });
        }
        progress = data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('study_progress')
          .insert({
            user_id: userId,
            card_id: cardId,
            known,
            attempts: attempts || 1,
            last_studied: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Create progress error:', error);
          return res.status(500).json({ message: 'Failed to create progress' });
        }
        progress = data;
      }

      res.json({ progress });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  }
}
