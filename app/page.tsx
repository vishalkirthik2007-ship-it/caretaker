'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { repository } from '@/lib/data/repository';
import { HeartPulse } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F8FC] dark:bg-[#071827] text-slate-900 dark:text-white p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white flex items-center justify-center shadow-2xl shadow-cyan-500/25 animate-pulse">
          <HeartPulse className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Care<span className="text-[#00C6D7]">Nest</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Your health journey starts here...
          </p>
        </div>
      </div>
    </div>
  );
}
