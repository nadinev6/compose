/**
 * Supabase client configuration and utilities
 */

import { createClient, type User, type Session } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured. Please add your Supabase project URL to .env.local');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please add your Supabase anonymous key to .env.local');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth utilities
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Unexpected error getting current session:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    throw error;
  }
}

export async function refreshSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Unexpected error refreshing session:', error);
    return null;
  }
}

// Database utilities
export async function checkConnection(): Promise<boolean> {
  try {
    // Try to connect to Supabase by checking the health endpoint
    const { data, error } = await supabase.from('templates').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected before migration
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Auth state management utilities
export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export function createAuthStateListener(callback: (state: AuthState) => void) {
  let currentState: AuthState = {
    user: null,
    session: null,
    loading: true
  };

  // Initial state
  getCurrentSession().then(session => {
    currentState = {
      user: session?.user ?? null,
      session,
      loading: false
    };
    callback(currentState);
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      currentState = {
        user: session?.user ?? null,
        session,
        loading: false
      };
      callback(currentState);
    }
  );

  return () => subscription.unsubscribe();
}