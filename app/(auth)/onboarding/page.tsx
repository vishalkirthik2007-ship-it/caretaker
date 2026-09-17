'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, MapPin, Eye, Bell, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { LanguageCode } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { easyMode, setEasyMode } = useAccessibility();

  const [locationAllowed, setLocationAllowed] = useState(true);
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalize your navigation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Set your display and regional preferences. You can change these anytime in Settings.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 shadow-md">
          {/* 1. Language Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Globe className="w-4 h-4 mr-1.5 text-teal-700" />
              Preferred Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'hi', label: 'हिंदी' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code as LanguageCode)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                    language === item.code
                      ? 'border-teal-700 bg-teal-50 text-teal-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Accessibility Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Eye className="w-4 h-4 mr-1.5 text-amber-600" />
              Display & Accessibility
            </label>
            <div
              onClick={() => setEasyMode(!easyMode)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  CarePath Easy Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Larger buttons, clearer text, and single-column view.
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  easyMode
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {easyMode && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* 3. Location Permission */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-teal-700" />
              Nearby Facilities Sensing
            </label>
            <div
              onClick={() => setLocationAllowed(!locationAllowed)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Enable Location
                </span>
                <span className="text-[11px] text-slate-500">
                  Calculates real distance to urgent care and hospital centers.
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  locationAllowed
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {locationAllowed && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Skip for now
            </button>
            <Button onClick={handleFinish} size="sm">
              <span>Save & Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
