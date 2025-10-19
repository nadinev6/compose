/**
 * Authentication helper utilities for session validation and user management
 */

import { type Session, type User } from '@supabase/supabase-js';
import { supabase, getCurrentSession, getCurrentUser } from './supabase';

/**
 * Validates if a session is still active and not expired
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) {
    return false;
  }

  // Check if session has expired
  const expiresAt = session.expires_at;
  if (!expiresAt) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return now < expiresAt;
}

/**
 * Validates if a user object is valid and has required fields
 */
export function isUserValid(user: User | null): boolean {
  if (!user) {
    return false;
  }

  // Check for required user fields
  return !!(user.id && user.email);
}

/**
 * Gets and validates the current session
 * Returns null if session is invalid or expired
 */
export async function getValidSession(): Promise<Session | null> {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return null;
    }

    if (!isSessionValid(session)) {
      console.warn('Session has expired');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Gets and validates the current user
 * Returns null if user is invalid or not authenticated
 */
export async function getValidUser(): Promise<User | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    if (!isUserValid(user)) {
      console.warn('User object is invalid');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

/**
 * Checks if the user is authenticated with a valid session
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getValidSession();
    const user = await getValidUser();
    
    return !!(session && user);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Validates a session token from request headers
 * Useful for API route protection
 */
export async function validateSessionToken(token: string): Promise<{ valid: boolean; user: User | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { valid: false, user: null };
    }

    if (!isUserValid(user)) {
      return { valid: false, user: null };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Error validating session token:', error);
    return { valid: false, user: null };
  }
}

/**
 * Extracts session token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Requires authentication for a function/component
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<{ user: User; session: Session }> {
  const session = await getValidSession();
  const user = await getValidUser();

  if (!session || !user) {
    throw new Error('Authentication required');
  }

  return { user, session };
}

/**
 * Gets user metadata safely
 */
export function getUserMetadata(user: User | null): Record<string, any> {
  if (!user) {
    return {};
  }

  return user.user_metadata || {};
}

/**
 * Gets user email safely
 */
export function getUserEmail(user: User | null): string | null {
  if (!user) {
    return null;
  }

  return user.email || null;
}

/**
 * Gets user ID safely
 */
export function getUserId(user: User | null): string | null {
  if (!user) {
    return null;
  }

  return user.id || null;
}

/**
 * Checks if user has a specific role (from metadata)
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) {
    return false;
  }

  const metadata = getUserMetadata(user);
  const userRole = metadata.role || 'user';

  return userRole === role;
}

/**
 * Session refresh helper with error handling
 */
export async function refreshSessionIfNeeded(session: Session | null): Promise<Session | null> {
  if (!session) {
    return null;
  }

  // Check if session is close to expiring (within 5 minutes)
  const expiresAt = session.expires_at;
  if (!expiresAt) {
    return session;
  }

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  if (expiresAt - now < fiveMinutes) {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return session;
      }

      return newSession;
    } catch (error) {
      console.error('Unexpected error refreshing session:', error);
      return session;
    }
  }

  return session;
}
