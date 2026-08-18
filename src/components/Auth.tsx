'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bike, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: 'nitc.ac.in',
            prompt: 'select_account',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google login');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 w-full">
        <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-3xl text-emerald-600 border border-emerald-200 dark:border-emerald-800/80">
          <Bike className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            CampEase NITC
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Campus Cycle Rental & Mobile GPS Tracker
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Restricted to @nitc.ac.in accounts
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50 text-sm cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Connecting to NITC Mail...' : 'Sign in with NITC Webmail'}
        </button>

        <p className="text-[11px] text-slate-400">
          Mobile GPS tracking will be requested during active cycle rides.
        </p>
      </div>
    </div>
  );
}