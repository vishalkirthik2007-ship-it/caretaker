'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  AlertCircle,
  Globe,
  Eye,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { LanguageCode, UserProfile } from '@/types';
import { EmergencyModal } from './emergency-modal';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { easyMode, setEasyMode } = useAccessibility();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header shadow-xs transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 dark:bg-teal-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <Compass className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  CarePath<span className="text-teal-700 dark:text-teal-400 font-extrabold ml-0.5">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden sm:inline">
                  India Healthcare Navigation
                </span>
              </div>
            </Link>
          </div>

          {/* Action Tools: Emergency, Easy Mode, Light/Dark Toggle, Language, Profile */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Emergency Action Button */}
            <Button
              variant="emergency"
              size="sm"
              onClick={() => setIsEmergencyOpen(true)}
              className="px-3 py-1.5 flex items-center space-x-1.5 shadow-red-200 dark:shadow-none"
            >
              <AlertCircle className="w-4 h-4 mr-1 text-white" />
              <span>{t.nav.emergency}</span>
            </Button>

            {/* Easy Mode Toggle */}
            <button
              onClick={() => setEasyMode(!easyMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                easyMode
                  ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Toggle Easy Mode (Enlarged text and simple layout)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{easyMode ? 'Easy Mode: ON' : 'Easy Mode'}</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Multilingual Selector */}
            <div className="relative inline-block text-left">
              <div className="flex items-center space-x-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Globe className="h-3.5 w-3.5 text-slate-400 mr-1" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  aria-label="Select Language"
                  className="bg-transparent border-0 focus:outline-none cursor-pointer pr-1 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Profile Avatar Link */}
            <Link
              href="/profile"
              className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="My Healthcare Profile"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs border border-teal-300 dark:border-teal-700">
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
                      : 'VK'}
                  </span>
                )}
              </div>
            </Link>

            {/* Quick Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="emergency"
              size="sm"
              onClick={() => setIsEmergencyOpen(true)}
              className="px-2.5 py-1 text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              108 SOS
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Language / மொழி / भाषा
              </span>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                      language === lang.code
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Accessibility</span>
              <button
                onClick={() => setEasyMode(!easyMode)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                  easyMode ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {easyMode ? 'Easy Mode: ON' : 'Turn On Easy Mode'}
              </button>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium"
              >
                <User className="w-4 h-4 text-teal-600" />
                <span>My Profile ({currentUser?.fullName || 'User'})</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>{t.nav.admin}</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 1-Click Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </>
  );
}
