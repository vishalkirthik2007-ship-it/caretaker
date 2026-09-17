'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const navigation = [
    { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.nav.findCare, href: '/find-care', icon: Search },
    { name: t.nav.facilities, href: '/facilities', icon: Building2 },
    { name: t.nav.map, href: '/map', icon: MapPin },
    { name: t.nav.assistant, href: '/assistant', icon: Bot, highlight: true },
    { name: t.nav.journey, href: '/journey', icon: Compass },
    { name: t.nav.documents, href: '/documents', icon: FileText },
    { name: t.nav.family, href: '/family', icon: Users },
    { name: t.nav.settings, href: '/settings', icon: Settings },
    { name: t.nav.admin, href: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200/80 lg:bg-slate-50/50 p-4 shrink-0',
        easyMode ? 'lg:w-72' : ''
      )}
    >
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
                'group flex items-center rounded-2xl font-medium transition-all duration-150',
                easyMode ? 'px-4 py-3.5 text-base' : 'px-3 py-2.5 text-sm',
                isActive
                  ? 'bg-teal-700 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',
                item.highlight && !isActive
                  ? 'bg-teal-50/80 text-teal-800 border border-teal-200/60'
                  : ''
              )}
            >
              <item.icon
                className={cn(
                  'shrink-0 transition-colors',
                  easyMode ? 'mr-4 h-6 w-6' : 'mr-3 h-5 w-5',
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-teal-700'
                    : 'text-slate-400 group-hover:text-slate-700'
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Safety Bottom Box */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="rounded-2xl bg-teal-900/5 p-3.5 border border-teal-800/10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-900 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-teal-700" />
            <span>Navigation Notice</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            CarePath AI guides to facilities and care categories. It does not provide medical diagnoses.
          </p>
        </div>
      </div>
    </aside>
  );
}
