'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';

export default function DebugPage() {
  const [supabaseInfo, setSupabaseInfo] = useState({
    url: '',
    keyExists: false,
    sessionExists: false,
    currentUser: null as any,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        setSupabaseInfo({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
          keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          sessionExists: false,
          currentUser: null,
        });

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        setSupabaseInfo((prev) => ({
          ...prev,
          sessionExists: !!session,
          currentUser: user,
        }));

        if (sessionError || userError) {
          setError(`Auth errors: ${sessionError?.message || ''} ${userError?.message || ''}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <div className="p-4 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🔍 Debug Page</h1>

        <div className="bg-slate-900 p-4 rounded-lg space-y-2">
          <h2 className="font-bold text-cyan-400">Environment:</h2>
          <p>
            <span className="text-slate-400">Supabase URL:</span>{' '}
            <span className="text-white">{supabaseInfo.url}</span>
          </p>
          <p>
            <span className="text-slate-400">Anon Key exists:</span>{' '}
            <span className={supabaseInfo.keyExists ? 'text-green-400' : 'text-red-400'}>
              {supabaseInfo.keyExists ? '✓ YES' : '✗ NO'}
            </span>
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg space-y-2">
          <h2 className="font-bold text-cyan-400">Auth Status:</h2>
          <p>
            <span className="text-slate-400">Session exists:</span>{' '}
            <span className={supabaseInfo.sessionExists ? 'text-green-400' : 'text-red-400'}>
              {supabaseInfo.sessionExists ? '✓ YES' : '✗ NO'}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Current user:</span>{' '}
            <span className="text-white">
              {supabaseInfo.currentUser ? supabaseInfo.currentUser.email : 'None logged in'}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-600 p-4 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-slate-900 p-4 rounded-lg">
          <h2 className="font-bold text-cyan-400 mb-4">URL Params:</h2>
          <p className="text-slate-300 text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        </div>

        <div className="space-y-2">
          <a href="/admin" className="block w-full bg-cyan-500 text-black p-2 font-bold rounded-lg text-center hover:bg-cyan-400">
            Voltar para Login
          </a>
          <a href="/admin/setup" className="block w-full bg-purple-600 text-white p-2 font-bold rounded-lg text-center hover:bg-purple-700">
            Setup Users (Admin)
          </a>
        </div>
      </div>
    </div>
  );
}
