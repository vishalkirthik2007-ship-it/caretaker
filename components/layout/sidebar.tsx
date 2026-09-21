'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Building2,
  MapPin,
  Bot,
  Compass,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  AlertTriangle,
  User,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();
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
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Care', href: '/find-care', icon: Search },
    { name: 'Hospital Map', href: '/map', icon: MapPin },
    { name: 'Ask Care AI', href: '/assistant', icon: Bot, highlight: true },
    { name: 'My Care Journey', href: '/journey', icon: Compass },
    { name: 'Document Vault', href: '/documents', icon: FileText },
    { name: 'Directory', href: '/facilities', icon: Building2 },
    { name: 'Family Care', href: '/family', icon: Users },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/50 dark:lg:border-slate-800/60 bg-white/70 dark:bg-[#071827]/80 backdrop-blur-2xl p-4 shrink-0 transition-all duration-200 shadow-xl',
        easyMode ? 'lg:w-72' : ''
      )}
    >
      {/* Sidebar Brand Header */}
      <div className="flex items-center space-x-3 px-2 py-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white shadow-md shadow-blue-500/25">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none block">
            Care<span className="text-[#0866FF] dark:text-[#48DFFF]">Nest</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Healthcare Platform
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col space-y-1.5">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-2xl font-medium transition-all duration-200',
                easyMode ? 'px-4 py-3 text-base' : 'px-3.5 py-2.5 text-xs',
                isActive
                  ? 'bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-md shadow-blue-500/30 font-semibold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50/70 dark:hover:bg-[#10283B]/80 hover:text-[#0866FF] dark:hover:text-[#48DFFF]',
                item.highlight && !isActive
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 text-[#0866FF] dark:text-[#48DFFF] border border-blue-200/60 dark:border-blue-800/60'
                  : ''
              )}
            >
              <item.icon
                className={cn(
                  'shrink-0 transition-colors',
                  easyMode ? 'mr-4 h-5 w-5' : 'mr-3 h-4 w-4',
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-[#0866FF] dark:text-[#48DFFF]'
                    : 'text-slate-400 dark:text-slate-400 group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF]'
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section at bottom of Sidebar */}
      <div className="mt-auto space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-1 px-1">
          <Link
            href="/profile"
            className={cn(
              'flex-1 flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium transition',
              pathname === '/profile'
                ? 'bg-[#0866FF]/15 text-[#0866FF] dark:text-[#48DFFF] font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </Link>
          <Link
            href="/settings"
            className={cn(
              'flex-1 flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium transition',
              pathname === '/settings'
                ? 'bg-[#0866FF]/15 text-[#0866FF] dark:text-[#48DFFF] font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="p-2.5 rounded-2xl glass-card flex items-center justify-between shadow-xs">
          <Link href="/profile" className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-100 to-cyan-100 dark:from-slate-800 dark:to-slate-700 text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 dark:border-slate-700">
              {currentUser?.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.fullName || 'DP'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {currentUser?.fullName
                    ? currentUser.fullName.slice(0, 2).toUpperCase()
                    : 'CN'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser?.fullName || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {currentUser?.city || 'Tamil Nadu'}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Safety Notice Box */}
        <div className="rounded-2xl bg-teal-900/5 dark:bg-teal-950/30 p-2.5 border border-teal-800/10 dark:border-teal-800/30 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1 font-semibold text-teal-900 dark:text-teal-300 mb-0.5">
            <AlertTriangle className="w-3 h-3 text-teal-700 dark:text-teal-400" />
            <span>Emergency Hotline</span>
          </div>
          <span>Dial 108 / 112 for acute medical distress in India.</span>
        </div>
      </div>
    </aside>
  );
}
