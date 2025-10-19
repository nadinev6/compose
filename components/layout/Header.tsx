'use client';

/**
 * Application Header Component
 * Navigation header with user profile and sign out
 */

import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { signOut } from '@/lib/supabase';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    const email = user.email || '';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Compose</h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#compose" className="text-gray-700 hover:text-blue-600 transition-colors">
              Compose
            </a>
            <a href="#templates" className="text-gray-700 hover:text-blue-600 transition-colors">
              Templates
            </a>
            <a href="#tracking" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tracking
            </a>
          </nav>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getInitials()}</span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  
                  <div className="py-1">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profile Settings
                    </a>
                    <a
                      href="#api-keys"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      API Keys
                    </a>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
