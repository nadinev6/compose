'use client';

/**
 * Protected Route Wrapper Component
 * Ensures user is authenticated before rendering children
 * Redirects to login page if not authenticated
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="protected-route-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
