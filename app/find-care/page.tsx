'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Stethoscope,
  Zap,
  Building2,
  UserCheck,
  Microscope,
  Smile,
  HeartHandshake,
  Flower2,
  Baby,
  Users,
  Pill,
  Activity,
  Video,
  Home,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { mapQueryToCategory, checkEmergencyTriage } from '@/lib/ai/safety';
import { HealthcareCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ICON_MAP: Record<string, any> = {
  Stethoscope,
  Zap,
  Building2,
  UserCheck,
  Microscope,
  Smile,
  HeartHandshake,
  Flower2,
  Baby,
  Users,
  Pill,
  Activity,
  Video,
  Home,
  ShieldCheck,
};

function FindCarePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { language, t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<HealthcareCategory[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [matchedCategory, setMatchedCategory] = useState<{
    categoryId: string;
    categoryName: string;
    urgency: string;
  } | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCategories(repository.getCategories());
  }, [router]);

  useEffect(() => {
    if (query.trim()) {
      const triage = checkEmergencyTriage(query);
      if (triage.isEmergency) {
        setEmergencyAlert(triage.recommendedAction);
      } else {
        setEmergencyAlert(null);
      }
      const mapped = mapQueryToCategory(query);
      setMatchedCategory(mapped);
    } else {
      setMatchedCategory(null);
      setEmergencyAlert(null);
    }
  }, [query]);

  const filteredCategories = categories.filter((cat) => {
    if (selectedUrgency !== 'all' && cat.urgencyLevel !== selectedUrgency) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cat.nameEn.toLowerCase().includes(q) ||
      cat.descriptionEn.toLowerCase().includes(q) ||
      (cat.nameTa && cat.nameTa.toLowerCase().includes(q)) ||
      (cat.nameHi && cat.nameHi.toLowerCase().includes(q)) ||
      (matchedCategory && cat.id === matchedCategory.categoryId)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="text-xs">
            🇮🇳 India Healthcare Directory
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            25 Service Disciplines
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          {t.nav.findCare}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Search symptoms, Indian medical departments, government schemes, or care settings across India.
        </p>
      </div>

      {/* Search & Filter Box */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl shadow-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-sky-600 dark:text-sky-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. chest pain, AIIMS trauma, Apollo Greams, blood test NABL, Jan Aushadhi, child fever..."
            className={`w-full rounded-2xl glass-input pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-xs ${
              easyMode ? 'text-lg py-4 pl-14' : ''
            }`}
          />
        </div>

        {/* Urgency Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Filter by Urgency:
          </span>
          {[
            { id: 'all', label: 'All Services (25)' },
            { id: 'emergency', label: '🚨 Emergency & Trauma' },
            { id: 'urgent', label: '⚡ Urgent / Same-Day' },
            { id: 'routine', label: '🩺 Routine OPD & Specialists' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedUrgency(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                selectedUrgency === pill.id
                  ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md'
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Alert Box if red flag detected */}
      {emergencyAlert && (
        <div className="rounded-3xl bg-red-50/90 dark:bg-red-950/70 border-2 border-red-500 p-6 text-red-900 dark:text-red-100 flex items-start space-x-3.5 shadow-xl animate-in fade-in backdrop-blur-md">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-2.5">
            <h3 className="font-extrabold text-base text-red-800 dark:text-red-200">
              High Acuity Medical Symptom Flagged
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{emergencyAlert}</p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href="tel:108"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-red-700 transition"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Call Ambulance (Dial 108)
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-xl shadow-md hover:bg-red-800 transition"
              >
                National Emergency (Dial 112)
              </a>
              <Link
                href="/facilities?emergency=true"
                className="inline-flex items-center px-4 py-2 glass-card border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl hover:bg-white/90"
              >
                View 24/7 Trauma Centers
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Category Match Recommendation Banner */}
      {matchedCategory && !emergencyAlert && query.trim() && (
        <div className="glass-card rounded-3xl border border-sky-200 dark:border-sky-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Care Navigation Match
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Recommended Setting: {matchedCategory.categoryName}
              </div>
            </div>
          </div>
          <Link
            href={`/assistant?q=${encodeURIComponent(query)}`}
            className="inline-flex items-center text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 px-4 py-2 rounded-xl shadow-md shrink-0"
          >
            <span>Ask CarePath AI</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      )}

      {/* 25 Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span>Showing {filteredCategories.length} Indian Healthcare Categories</span>
          <span>Click any category card to view accredited facilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Stethoscope;
            const name =
              language === 'ta'
                ? cat.nameTa || cat.nameEn
                : language === 'hi'
                ? cat.nameHi || cat.nameEn
                : cat.nameEn;
            const description =
              language === 'ta'
                ? cat.descriptionTa || cat.descriptionEn
                : language === 'hi'
                ? cat.descriptionHi || cat.descriptionEn
                : cat.descriptionEn;

            return (
              <div
                key={cat.id}
                onClick={() => router.push(`/facilities?category=${cat.id}`)}
                className="p-6 rounded-3xl glass-card border border-white/60 dark:border-white/10 flex flex-col justify-between hover:border-sky-400/60 dark:hover:border-sky-500/60 transition-all duration-200 cursor-pointer group hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    {cat.urgencyLevel === 'emergency' && (
                      <Badge variant="danger" className="px-2.5 py-0.5">Emergency (24/7)</Badge>
                    )}
                    {cat.urgencyLevel === 'urgent' && (
                      <Badge variant="warning" className="px-2.5 py-0.5">Urgent OPD</Badge>
                    )}
                    {cat.urgencyLevel === 'routine' && (
                      <Badge variant="secondary" className="px-2.5 py-0.5">Routine</Badge>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center">
                    Browse Facilities
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/assistant?category=${cat.id}`);
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    Ask AI →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FindCarePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading India Care Directory...
        </div>
      }
    >
      <FindCarePageContent />
    </Suspense>
  );
}
