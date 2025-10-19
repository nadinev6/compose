'use client';

/**
 * Debug Auth Page
 * Shows current authentication state
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Debug - Session:', session);
      console.log('Debug - Error:', error);
      
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Session Status</h2>
          <p className={session ? 'text-green-600' : 'text-red-600'}>
            {session ? '✅ Session exists' : '❌ No session'}
          </p>
        </div>

        {user && (
          <div className="bg-white p-4 rounded border">
            <h2 className="font-semibold mb-2">User Info</h2>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {session && (
          <div className="bg-white p-4 rounded border">
            <h2 className="font-semibold mb-2">Full Session</h2>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Go to Login
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
