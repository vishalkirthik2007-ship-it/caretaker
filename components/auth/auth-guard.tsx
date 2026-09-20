'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { repository } from '@/lib/data/repository';
import { Compass } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/', '/_not-found'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      const user = repository.getCurrentUser();

      if (!user && !isPublic) {
        setIsAuthenticated(false);
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();

    // Listen for cross-tab or logout auth events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('carepath_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('carepath_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [pathname, router]);

  // If on a protected page and not yet confirmed authenticated, show clean healthcare loading pulse
  if (isAuthenticated === false && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
          <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Redirecting to Healthcare Login Portal...
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Please complete onboarding to access navigation records.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
