/**
 * Next.js Middleware
 * Handles route protection and authentication
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/auth');
  const isDebugPage = request.nextUrl.pathname.startsWith('/debug-auth');
  const isProtectedRoute = !isAuthPage && 
                          !isDebugPage &&
                          !request.nextUrl.pathname.startsWith('/api') &&
                          !request.nextUrl.pathname.startsWith('/_next') &&
                          !request.nextUrl.pathname.startsWith('/favicon');

  // Debug logging
  console.log('🔍 Middleware check:', {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    user: session?.user?.email,
    isAuthPage,
    isProtectedRoute
  });

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    console.log('🔄 Redirecting to login (no session)');
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if accessing auth pages with active session
  if (isAuthPage && session) {
    console.log('🔄 Redirecting to home (has session)');
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Temporarily disable middleware to test the app
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
