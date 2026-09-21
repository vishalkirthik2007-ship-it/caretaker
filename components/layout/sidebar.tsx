'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  MapPin,
  Bot,
  HeartPulse,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const updateUser = () => {
      setCurrentUser(repository.getCurrentUser());
    };
    updateUser();
    window.addEventListener('carepath_auth_change', updateUser);
    window.addEventListener('storage', updateUser);
    return () => {
      window.removeEventListener('carepath_auth_change', updateUser);
      window.removeEventListener('storage', updateUser);
    };
  }, []);

  const handleLogout = () => {
    repository.logout();
    setCurrentUser(null);
    router.replace('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Care', href: '/find-care', icon: Search },
    { name: 'Map View', href: '/map', icon: MapPin },
    { name: 'Ask Care', href: '/assistant', icon: Bot },
    { name: 'My Care Journey', href: '/journey', icon: HeartPulse },
    { name: 'Document Vault', href: '/documents', icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-[#071827] text-white border-r border-white/10 shrink-0 transition-all duration-300 shadow-2xl">
      {/* Sidebar Brand Header */}
      <div className="flex items-center space-x-3 px-5 py-6">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] p-[1px] shadow-md shadow-cyan-500/25 flex items-center justify-center">
          <div className="w-full h-full rounded-[11px] bg-white/20 backdrop-blur-md flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M3.22 12H7l2.5-4 3 8 2.5-4h4.78" strokeWidth="2.2" />
            </svg>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-xl font-black tracking-tight text-white">
            CareNest
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 pt-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 mr-3 shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area: Settings + Logout + Mountain Vignette Card */}
      <div className="p-3 space-y-3 mt-auto">
        <div className="space-y-1">
          <Link
            href="/settings"
            className={cn(
              'flex items-center px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all',
              pathname === '/settings'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Settings className="w-4 h-4 mr-3 text-slate-400" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mountain Vignette Card with Quote (Matching Design Poster!) */}
        <div className="relative overflow-hidden rounded-2xl h-24 border border-white/10 shadow-lg group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/carenest_login_bg_dark.jpg')", backgroundPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-[#071827]/40 to-transparent" />
          <div className="absolute inset-x-3 bottom-2.5 text-left">
            <p className="font-serif italic text-[11px] text-white/90 leading-tight drop-shadow-md">
              &ldquo;Better Care For A Healthier You.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
