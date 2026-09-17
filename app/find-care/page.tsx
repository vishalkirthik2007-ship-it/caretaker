'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
};

function FindCarePageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { language, t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<HealthcareCategory[]>([]);
  const [matchedCategory, setMatchedCategory] = useState<{
    categoryId: string;
    categoryName: string;
    urgency: string;
  } | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  useEffect(() => {
    setCategories(repository.getCategories());
  }, []);

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
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cat.nameEn.toLowerCase().includes(q) ||
      cat.descriptionEn.toLowerCase().includes(q) ||
      (matchedCategory && cat.id === matchedCategory.categoryId)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.nav.findCare}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search symptoms, conditions, or healthcare categories to discover appropriate care settings.
        </p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search e.g. skin rash, blood test, sprained ankle, child fever..."
          className={`w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 shadow-xs ${
            easyMode ? 'text-lg py-4 pl-14' : ''
          }`}
        />
      </div>

      {/* Emergency Alert Box if red flag detected */}
      {emergencyAlert && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-500 p-5 text-red-900 flex items-start space-x-3 shadow-md animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-bold text-base text-red-800">
              High Acuity Medical Symptom Flagged
            </h3>
            <p className="text-sm text-red-700 leading-relaxed">{emergencyAlert}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="tel:112"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700"
              >
                Call Emergency Services (112 / 911)
              </a>
              <Link
                href="/facilities?emergency=true"
                className="inline-flex items-center px-4 py-2 bg-white border border-red-300 text-red-700 font-bold text-xs rounded-xl hover:bg-red-50"
              >
                View 24/7 Trauma Centers
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Category Match Recommendation Banner */}
      {matchedCategory && !emergencyAlert && query.trim() && (
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                Care Navigation Match
              </div>
              <div className="text-sm font-bold text-slate-900">
                Identified Category: {matchedCategory.categoryName}
              </div>
            </div>
          </div>
          <Link
            href={`/assistant?q=${encodeURIComponent(query)}`}
            className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-900 bg-white px-3.5 py-2 rounded-xl border border-teal-200 shrink-0"
          >
            <span>Ask CarePath Assistant</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      )}

      {/* 14 Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Healthcare Service Categories ({filteredCategories.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Stethoscope;
            const name =
              language === 'ta'
                ? cat.nameTa
                : language === 'hi'
                ? cat.nameHi
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
                className="p-5 flex flex-col justify-between hover:border-teal-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    {cat.urgencyLevel === 'emergency' && (
                      <Badge variant="danger">Emergency</Badge>
                    )}
                    {cat.urgencyLevel === 'urgent' && (
                      <Badge variant="warning">Urgent</Badge>
                    )}
                    {cat.urgencyLevel === 'routine' && (
                      <Badge variant="secondary">Routine</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-800 transition">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/facilities?category=${cat.id}`}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    View Facilities →
                  </Link>
                  <Link
                    href={`/assistant?category=${cat.id}`}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Ask Questions
                  </Link>
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
          Loading Care Directory...
        </div>
      }
    >
      <FindCarePageContent />
    </Suspense>
  );
}
