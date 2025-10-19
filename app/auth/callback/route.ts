/**
 * OAuth Callback Route Handler
 * Handles the OAuth callback after successful authentication
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔍 Auth callback received:', { 
    code: code ? 'present' : 'missing', 
    error,
    url: requestUrl.toString() 
  });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  // Exchange code for session
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options });
            },
          },
        }
      );

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, requestUrl.origin)
        );
      }

      console.log('✅ Session created successfully:', data.session?.user?.email);

      // Successful authentication - redirect to main page
      const response = NextResponse.redirect(new URL('/', requestUrl.origin));
      
      // Ensure cookies are set
      return response;
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('An unexpected error occurred.')}`, requestUrl.origin)
      );
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
