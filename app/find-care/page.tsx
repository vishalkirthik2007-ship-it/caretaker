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
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. chest pain, AIIMS trauma, blood test NABL, Jan Aushadhi, child fever..."
            className={`w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 shadow-xs ${
              easyMode ? 'text-lg py-4 pl-14' : ''
            }`}
          />
        </div>

        {/* Urgency Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedUrgency === pill.id
                  ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Alert Box if red flag detected */}
      {emergencyAlert && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/60 border-2 border-red-500 p-5 text-red-900 dark:text-red-100 flex items-start space-x-3 shadow-md animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-base text-red-800 dark:text-red-200">
              High Acuity Medical Symptom Flagged
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{emergencyAlert}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Call Ambulance (Dial 108)
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center px-4 py-2 bg-red-700 text-white font-bold text-xs rounded-xl shadow hover:bg-red-800"
              >
                National Emergency (Dial 112)
              </a>
              <Link
                href="/facilities?emergency=true"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl hover:bg-red-50 dark:hover:bg-slate-700"
              >
                View 24/7 Trauma Centers
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Category Match Recommendation Banner */}
      {matchedCategory && !emergencyAlert && query.trim() && (
        <div className="rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Care Navigation Match
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Recommended Setting: {matchedCategory.categoryName}
              </div>
            </div>
          </div>
          <Link
            href={`/assistant?q=${encodeURIComponent(query)}`}
            className="inline-flex items-center text-xs font-bold text-teal-800 dark:text-teal-200 hover:text-teal-900 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-teal-200 dark:border-teal-700 shrink-0"
          >
            <span>Ask CarePath AI</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      )}

      {/* 25 Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
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
              <Card
                key={cat.id}
                onClick={() => router.push(`/facilities?category=${cat.id}`)}
                className="p-5 flex flex-col justify-between hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    {cat.urgencyLevel === 'emergency' && (
                      <Badge variant="danger">Emergency (24/7)</Badge>
                    )}
                    {cat.urgencyLevel === 'urgent' && (
                      <Badge variant="warning">Urgent OPD</Badge>
                    )}
                    {cat.urgencyLevel === 'routine' && (
                      <Badge variant="secondary">Routine</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:underline flex items-center">
                    Browse Facilities
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/assistant?category=${cat.id}`);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Ask AI
                  </button>
                </div>
              </Card>
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
