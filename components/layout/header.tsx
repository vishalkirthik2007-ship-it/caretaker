'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  AlertCircle,
  Globe,
  Eye,
  Menu,
  X,
  User,
  Shield,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { LanguageCode } from '@/types';
import { EmergencyModal } from './emergency-modal';
import { Button } from '@/components/ui/button';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { easyMode, setEasyMode } = useAccessibility();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm transition-transform group-hover:scale-105">
                <Compass className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  CarePath<span className="text-teal-700 font-extrabold ml-0.5">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:inline">
                  Healthcare Navigation
                </span>
              </div>
            </Link>
          </div>

          {/* Action Tools: Emergency, Easy Mode, Language, Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Emergency Action Button */}
            <Button
              variant="emergency"
              size="sm"
              onClick={() => setIsEmergencyOpen(true)}
              className="px-3 py-1.5 flex items-center space-x-1.5 shadow-red-200"
            >
              <AlertCircle className="w-4 h-4 mr-1 text-white" />
              <span>{t.nav.emergency}</span>
            </Button>

            {/* Easy Mode Toggle */}
            <button
              onClick={() => setEasyMode(!easyMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                easyMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Easy Mode (Enlarged text and simple layout)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{easyMode ? 'Easy Mode: ON' : 'Easy Mode'}</span>
            </button>

            {/* Multilingual Selector */}
            <div className="relative inline-block text-left">
              <div className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                <Globe className="h-3.5 w-3.5 text-slate-400 mr-1" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  aria-label="Select Language"
                  className="bg-transparent border-0 focus:outline-none cursor-pointer pr-1 text-slate-800 font-semibold"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User Profile Avatar Link */}
            <Link
              href="/settings"
              className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-xl transition"
              title="Account Settings & Privacy"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                AP
              </div>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="emergency"
              size="sm"
              onClick={() => setIsEmergencyOpen(true)}
              className="px-2.5 py-1 text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              SOS
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Language / மொழி / भाषा</span>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                      language === lang.code
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Display Accessibility</span>
              <button
                onClick={() => setEasyMode(!easyMode)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                  easyMode ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {easyMode ? 'Easy Mode: ON' : 'Turn On Easy Mode'}
              </button>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>{t.nav.admin}</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>{t.nav.settings}</span>
              </Link>
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
