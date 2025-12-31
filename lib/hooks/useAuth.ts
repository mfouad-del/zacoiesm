'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, UserRole } from '@/types';

export interface AuthUser extends User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user details from public.users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
          } else if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.full_name,
              full_name: userData.full_name,
              role: userData.role as UserRole,
              avatar_url: userData.avatar_url,
              phone: userData.phone,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as AuthUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.full_name,
            full_name: userData.full_name,
            role: userData.role as UserRole,
            avatar_url: userData.avatar_url,
            phone: userData.phone,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Update local state
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  };
}
