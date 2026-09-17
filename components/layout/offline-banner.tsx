'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm sticky top-16 z-30 animate-in slide-in-from-top duration-200">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>You are currently offline. Showing cached healthcare navigation data.</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 rounded-lg text-white text-[11px] font-bold flex items-center space-x-1 transition"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </button>
    </div>
  );
}
