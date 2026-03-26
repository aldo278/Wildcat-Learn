import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { CreateSetInput, UpdateSetInput } from '../utils/validation';

export class SetController {
  async getPublicSets(req: Request, res: Response) {
    try {
      const { data: sets, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          author:profiles!flashcard_sets_author_id_fkey(id, name),
          cards:flashcards(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get public sets error:', error);
        return res.status(500).json({ message: 'Failed to fetch public sets' });
      }

      res.json({ sets });
    } catch (error) {
      console.error('Get public sets error:', error);
      res.status(500).json({ message: 'Failed to fetch public sets' });
    }
  }

  async getSetById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data: set, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          author:profiles!flashcard_sets_author_id_fkey(id, name),
          cards:flashcards(*)
        `)
        .eq('id', id)
        .single();

      if (error || !set) {
        return res.status(404).json({ message: 'Set not found' });
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

      const { data: sets, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          cards:flashcards(count)
        `)
        .eq('author_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Get user sets error:', error);
        return res.status(500).json({ message: 'Failed to fetch user sets' });
      }

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

      const { data: set, error } = await supabase
        .from('flashcard_sets')
        .insert({
          title,
          description: description || '',
          class_name: className || null,
          class_subject: classSubject || null,
          is_public: isPublic || false,
          author_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          author:profiles!flashcard_sets_author_id_fkey(id, name)
        `)
        .single();

      if (error) {
        console.error('Create set error:', error);
        return res.status(500).json({ message: 'Failed to create set' });
      }

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
      const { data: existingSet, error: fetchError } = await supabase
        .from('flashcard_sets')
        .select('author_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingSet) {
        return res.status(404).json({ message: 'Set not found' });
      }

      if (existingSet.author_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this set' });
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.className !== undefined) updateData.class_name = updates.className;
      if (updates.classSubject !== undefined) updateData.class_subject = updates.classSubject;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

      const { data: set, error } = await supabase
        .from('flashcard_sets')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          author:profiles!flashcard_sets_author_id_fkey(id, name)
        `)
        .single();

      if (error) {
        console.error('Update set error:', error);
        return res.status(500).json({ message: 'Failed to update set' });
      }

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
      const { data: existingSet, error: fetchError } = await supabase
        .from('flashcard_sets')
        .select('author_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingSet) {
        return res.status(404).json({ message: 'Set not found' });
      }

      if (existingSet.author_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this set' });
      }

      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete set error:', error);
        return res.status(500).json({ message: 'Failed to delete set' });
      }

      res.json({ message: 'Set deleted successfully' });
    } catch (error) {
      console.error('Delete set error:', error);
      res.status(500).json({ message: 'Failed to delete set' });
    }
  }
}
