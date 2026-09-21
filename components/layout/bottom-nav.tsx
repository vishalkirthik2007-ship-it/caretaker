'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  MapPin,
  Bot,
  MoreHorizontal,
  Compass,
  FileText,
  User,
  Settings,
  LogOut,
  X,
  Building2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { repository } from '@/lib/data/repository';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = () => {
    setIsMoreOpen(false);
    repository.logout();
    router.replace('/login');
  };

  const primaryItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Care', href: '/find-care', icon: Search },
    { name: 'Map', href: '/map', icon: MapPin },
    { name: 'Ask Care', href: '/assistant', icon: Bot, isCenter: true },
  ];

  const moreItems = [
    { name: 'My Care Journey', href: '/journey', icon: Compass, desc: 'Care timeline & appointments' },
    { name: 'Document Vault', href: '/documents', icon: FileText, desc: 'Digital encrypted health wallet' },
    { name: 'All Facilities', href: '/facilities', icon: Building2, desc: 'Verified hospital directory' },
    { name: 'Family Care', href: '/family', icon: Users, desc: 'Manage family health profiles' },
    { name: 'User Profile', href: '/profile', icon: User, desc: 'Personal details & health info' },
    { name: 'Settings', href: '/settings', icon: Settings, desc: 'Theme, language & preferences' },
  ];

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Floating Glass "More" Drawer for Mobile */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex flex-col justify-end transition-opacity"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-white/95 dark:bg-[#071827]/95 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/60 dark:border-[#48DFFF]/20 p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white flex items-center justify-center font-bold text-xs">
                  CN
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">CareNest Menu</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Additional services & preferences</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto py-1">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-2xl border transition-all text-left',
                      isActive
                        ? 'border-[#0866FF] bg-[#0866FF]/10 text-[#0866FF] dark:text-[#48DFFF] font-semibold shadow-xs'
                        : 'border-slate-200/70 dark:border-slate-800/70 glass-card hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        isActive
                          ? 'bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-semibold text-xs transition active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of CareNest</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Glass Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-white/50 dark:border-slate-800/80 bg-white/85 dark:bg-[#071827]/90 backdrop-blur-2xl pb-safe shadow-2xl">
        <div className="flex h-16 items-center justify-around px-3 max-w-md mx-auto">
          {primaryItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
                >
                  <div
                    className={cn(
                      'w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg ring-4 ring-white/80 dark:ring-[#071827]',
                      isActive
                        ? 'bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white shadow-blue-500/40 scale-105'
                        : 'bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white shadow-blue-500/25 group-hover:scale-105'
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0866FF] dark:text-[#48DFFF] mt-1 tracking-tight">
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[3.5rem] py-1 transition-all duration-200',
                  isActive
                    ? 'text-[#0866FF] dark:text-[#48DFFF] font-bold scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                <item.icon className={cn('h-5 w-5 transition-transform', isActive ? 'stroke-[2.5]' : 'stroke-2')} />
                <span className="text-[10px] mt-0.5 truncate font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Dedicated "More" Tab */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[3.5rem] py-1 transition-all duration-200 focus:outline-none',
              isMoreActive || isMoreOpen
                ? 'text-[#0866FF] dark:text-[#48DFFF] font-bold scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <div className="relative">
              <MoreHorizontal className="h-5 w-5 stroke-2" />
              {isMoreActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#0866FF] dark:bg-[#48DFFF]" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
