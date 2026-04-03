import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    created_at: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Fetch user profile from database
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, firstName, lastName, created_at')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      const displayName = user.user_metadata?.name || user.user_metadata?.firstName || user.email?.split('@')[0] || 'User';
      const nameParts = displayName.split(' ');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          firstName: user.user_metadata?.firstName || nameParts[0] || 'User',
          lastName: user.user_metadata?.lastName || nameParts.slice(1).join(' ') || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, email, firstName, lastName, created_at')
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return res.status(500).json({ message: 'Failed to create user profile' });
      }

      profile = newProfile;
    } else if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }

    if (!profile) {
      return res.status(500).json({ message: 'Failed to create user profile' });
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};
