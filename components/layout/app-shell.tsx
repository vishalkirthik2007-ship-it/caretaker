'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OfflineBanner } from '@/components/layout/offline-banner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrLanding = pathname === '/login' || pathname === '/';

  if (isAuthOrLanding) {
    return (
      <main className="min-h-screen text-slate-900 dark:text-slate-100">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950/60">
      <Header />
      <OfflineBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-12 overflow-y-auto bg-white dark:bg-transparent">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
