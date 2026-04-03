import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getSessionToken } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, firstName: string, lastName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:5555/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    console.log('AuthContext - Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          // Get user profile from our backend
          try {
            const token = session.access_token;
            console.log('AuthContext - Fetching user profile from backend');
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log('AuthContext - User profile fetched successfully:', data.user.email);
              setUser(data.user);
              setToken(token);
            } else {
              console.log('AuthContext - Failed to fetch user profile, response:', response.status);
              // Fallback: Use Supabase user data if backend is not available
              if (session.user) {
                console.log('AuthContext - Using fallback Supabase user data');
                const displayName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
                const nameParts = displayName.split(' ');
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  firstName: nameParts[0] || 'User',
                  lastName: nameParts.slice(1).join(' ') || '',
                  created_at: new Date().toISOString()
                });
                setToken(token);
              } else {
                setUser(null);
                setToken(null);
              }
            }
          } catch (error) {
            console.error('AuthContext - Error fetching user profile:', error);
            // Fallback: Use Supabase user data if backend is not available
            if (session.user) {
              console.log('AuthContext - Using fallback Supabase user data (catch)');
              const displayName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
              const nameParts = displayName.split(' ');
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                created_at: new Date().toISOString()
              });
              setToken(session.access_token);
            } else {
              setUser(null);
              setToken(null);
            }
          }
        } else {
          console.log('AuthContext - No session found');
          setUser(null);
          setToken(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    console.log('AuthContext - Checking for existing session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext - Existing session found:', session?.user?.email);
      if (session?.user) {
        try {
          const token = session.access_token;
          console.log('AuthContext - Fetching user profile from backend (existing session)');
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('AuthContext - User profile fetched successfully (existing session):', data.user.email);
            setUser(data.user);
            setToken(token);
          } else {
            console.log('AuthContext - Failed to fetch user profile (existing session), response:', response.status);
            // Fallback: Use Supabase user data if backend is not available
            if (session.user) {
              console.log('AuthContext - Using fallback Supabase user data (existing session)');
              const displayName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
              const nameParts = displayName.split(' ');
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                created_at: new Date().toISOString()
              });
              setToken(token);
            } else {
              setUser(null);
              setToken(null);
            }
          }
        } catch (error) {
          console.error('AuthContext - Error fetching user profile (existing session):', error);
          // Fallback: Use Supabase user data if backend is not available
          if (session.user) {
            console.log('AuthContext - Using fallback Supabase user data (existing session catch)');
            const displayName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
            const nameParts = displayName.split(' ');
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              firstName: nameParts[0] || 'User',
              lastName: nameParts.slice(1).join(' ') || '',
              created_at: new Date().toISOString()
            });
            setToken(session.access_token);
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } else {
        console.log('AuthContext - No existing session found');
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        // Get user profile from our backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const backendData = await response.json();
        setUser(backendData.user);
        setToken(data.session.access_token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, firstName: string, lastName: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`, // Keep for backward compatibility
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        // Create user profile in our backend
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, firstName, lastName, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const backendData = await response.json();
        setUser(backendData.user);
        setToken(data.session.access_token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
