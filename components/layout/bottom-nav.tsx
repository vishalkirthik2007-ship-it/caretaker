'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  MapPin,
  Compass,
  Bot,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.nav.findCare, href: '/find-care', icon: Search },
    { name: t.nav.assistant, href: '/assistant', icon: Bot, isPrimary: true },
    { name: t.nav.map, href: '/map', icon: MapPin },
    { name: t.nav.journey, href: '/journey', icon: Compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-white/50 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform group-active:scale-95 ring-4 ring-white/70 dark:ring-[#071827]">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#0066FF] dark:text-[#42D9FF] mt-1">
                  Ask AI
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-14 py-1 transition-colors',
                isActive
                  ? 'text-[#0066FF] dark:text-[#42D9FF] font-semibold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
