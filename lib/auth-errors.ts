/**
 * Authentication error handling utilities
 */

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
}

export function parseAuthError(error: any): AuthError {
  // Handle Supabase auth errors
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      return {
        code: 'invalid_credentials',
        message: error.message,
        userMessage: 'Invalid email or password. Please check your credentials and try again.'
      };
    }
    
    if (message.includes('email not confirmed')) {
      return {
        code: 'email_not_confirmed',
        message: error.message,
        userMessage: 'Please check your email and click the confirmation link before signing in.'
      };
    }
    
    if (message.includes('too many requests')) {
      return {
        code: 'rate_limit',
        message: error.message,
        userMessage: 'Too many sign-in attempts. Please wait a few minutes before trying again.'
      };
    }
    
    if (message.includes('network')) {
      return {
        code: 'network_error',
        message: error.message,
        userMessage: 'Network error. Please check your internet connection and try again.'
      };
    }
  }
  
  // Generic error fallback
  return {
    code: 'unknown_error',
    message: error?.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  };
}

export function getAuthErrorMessage(error: any): string {
  return parseAuthError(error).userMessage;
}