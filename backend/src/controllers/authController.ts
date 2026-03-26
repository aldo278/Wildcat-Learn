import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { RegisterInput, LoginInput } from '../utils/validation';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password }: RegisterInput = req.body;

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (authError) {
        return res.status(400).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ message: 'Failed to create user' });
      }

      // Create user profile in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return res.status(500).json({ message: 'Failed to create user profile' });
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name
        },
        session: authData.session
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginInput = req.body;

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!data.user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        return res.status(500).json({ message: 'Failed to fetch user profile' });
      }

      res.json({
        message: 'Login successful',
        user: profile,
        session: data.session
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user information' });
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        // Sign out from Supabase
        await supabase.auth.signOut();
      }
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Failed to logout' });
    }
  }
}
