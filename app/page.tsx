'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { repository } from '@/lib/data/repository';
import { Compass } from 'lucide-react';

export default function RootEntryPage() {
  const router = useRouter();

  useEffect(() => {
    // Detect existing saved login/session
    const currentUser = repository.getCurrentUser();
    if (currentUser) {
      // Returning user with active session -> Enter Main Application directly
      router.replace('/dashboard');
    } else {
      // New user or logged out -> Go to Separate Login/Onboarding Page
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/20 animate-pulse">
          <Compass className="w-9 h-9 animate-spin" style={{ animationDuration: '3.5s' }} />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            CarePath<span className="text-teal-700 dark:text-teal-400">AI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Initializing secure healthcare navigation session...
          </p>
        </div>
      </div>
    </div>
  );
}
