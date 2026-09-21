'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ArrowLeft,
  Heart,
  Activity,
  Zap,
  Microscope,
  Baby,
  HeartHandshake,
  Eye,
  Smile,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  Pill,
  Droplets,
  Building2,
  Brain,
  ShieldCheck,
  Phone,
  Navigation,
  Globe,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  X,
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { checkEmergencyTriage } from '@/lib/ai/safety';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

// 12 Popular Categories matching the Reference Design poster
const POPULAR_CATEGORIES = [
  { id: 'cardiology', name: 'Cardiology', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40' },
  { id: 'orthopaedics', name: 'Orthopaedics', icon: Activity, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40' },
  { id: 'neurology', name: 'Neurology', icon: Zap, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/40' },
  { id: 'oncology', name: 'Oncology', icon: Microscope, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/40' },
  { id: 'paediatrics', name: 'Paediatrics', icon: Baby, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40' },
  { id: 'maternity', name: 'Maternity', icon: HeartHandshake, color: 'text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40' },
  { id: 'ent', name: 'ENT', icon: Smile, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/40' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40' },
  { id: 'dermatology', name: 'Dermatology', icon: Sparkles, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/40' },
  { id: 'dental', name: 'Dental', icon: Smile, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/40' },
  { id: 'general-medicine', name: 'General Medicine', icon: Stethoscope, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/40' },
  { id: 'more', name: 'More', icon: Plus, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
];

const EXTENDED_CATEGORIES = [
  { id: 'emergency', name: 'Emergency', icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40' },
  { id: 'diagnostics', name: 'Diagnostics', icon: Microscope, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Pill, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40' },
  { id: 'blood-bank', name: 'Blood Bank', icon: Droplets, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40' },
  { id: 'mental-health', name: 'Mental Health', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40' },
  { id: 'multi-speciality', name: 'Multi-Speciality', icon: Building2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40' },
];

function FindCareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('category') || '';
  const { easyMode } = useAccessibility();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [activeFilter, setActiveFilter] = useState<'All' | 'Nearby' | 'Government' | 'Private' | 'Multi-speciality'>('All');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showExtendedCategories, setShowExtendedCategories] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    const all = repository.getFacilities({
      userLat: user.preferences?.lastKnownLatitude || 13.0827,
      userLon: user.preferences?.lastKnownLongitude || 80.2707,
    });
    setFacilities(all);
  }, [router]);

  useEffect(() => {
    if (query.trim()) {
      const triage = checkEmergencyTriage(query);
      if (triage.isEmergency) {
        setEmergencyAlert(triage.recommendedAction);
      } else {
        setEmergencyAlert(null);
      }
    } else {
      setEmergencyAlert(null);
    }
  }, [query]);

  const calculateETA = (distanceKm?: number) => {
    if (!distanceKm) return '12 mins';
    const minutes = Math.max(5, Math.round(distanceKm * 2.4));
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours} hr ${rem} mins`;
    }
    return `${minutes} mins`;
  };

  const handleCategoryClick = (catId: string) => {
    if (catId === 'more') {
      setShowExtendedCategories((prev) => !prev);
      return;
    }
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
      setActiveFilter('All');
    }
  };

  // Filter facilities based on search, category, and type filters
  const filteredFacilities = facilities.filter((f) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchCity = f.location.city.toLowerCase().includes(q);
      const matchType = f.facilityType.toLowerCase().includes(q);
      const matchSpecialty = f.services?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchType && !matchSpecialty) return false;
    }

    if (selectedCategory) {
      const allCats = [...POPULAR_CATEGORIES, ...EXTENDED_CATEGORIES];
      const catObj = allCats.find((c) => c.id === selectedCategory);
      if (catObj) {
        const catName = catObj.name.toLowerCase();
        const hasSpecialty = f.services?.some((s) => s.toLowerCase().includes(catName));
        const isEmergency = catObj.id === 'emergency' && f.emergencyAvailable;
        if (!hasSpecialty && !isEmergency && f.facilityType.toLowerCase() !== 'hospital') {
          return false;
        }
      }
    }

    if (activeFilter === 'Nearby') {
      return (f.distanceKm ?? 99) <= 25;
    }
    if (activeFilter === 'Government') {
      return (
        f.facilityType.toLowerCase().includes('government') ||
        f.name.toLowerCase().includes('govt') ||
        f.name.toLowerCase().includes('government')
      );
    }
    if (activeFilter === 'Private') {
      return (
        !f.facilityType.toLowerCase().includes('government') &&
        !f.name.toLowerCase().includes('govt')
      );
    }
    if (activeFilter === 'Multi-speciality') {
      return f.facilityType.toLowerCase().includes('hospital') || (f.services?.length ?? 0) >= 3;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 animate-in fade-in duration-300">
      {/* 1. TOP HEADER matching Reference Poster */}
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Find Care
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pl-7">
          Discover top hospitals, clinics and healthcare services near you and across Tamil Nadu.
        </p>
      </div>

      {/* 2. SEARCH BAR matching Reference Poster */}
      <div className="relative max-w-4xl">
        <div className="relative flex items-center">
          <Search className="absolute left-4.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, specialties, or services..."
            className="w-full pl-12 pr-12 py-3.5 rounded-full bg-white/90 dark:bg-[#10283B]/90 border border-slate-200/80 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25 shadow-xs backdrop-blur-md transition"
          />
          <button
            type="button"
            className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Filter preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. FILTER PILLS: All, Nearby, Government, Private, Multi-speciality */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Nearby', 'Government', 'Private', 'Multi-speciality'] as const).map((filter) => {
          const isActive = activeFilter === filter && !selectedCategory;
          return (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setSelectedCategory(null);
              }}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#102033] dark:bg-white text-white dark:text-[#071827] shadow-sm'
                  : 'bg-white/80 dark:bg-[#10283B]/80 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#15344d]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Emergency Alert Banner if Symptom Detected */}
      {emergencyAlert && (
        <div className="rounded-2xl bg-red-500/10 border-2 border-red-500 p-5 text-red-900 dark:text-red-100 flex items-start space-x-3.5 shadow-lg animate-in fade-in backdrop-blur-md">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-red-800 dark:text-red-200">
              High Acuity Medical Symptom Detected
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{emergencyAlert}</p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href="tel:108"
                className="inline-flex items-center px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Ambulance: Dial 108
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Emergency: Dial 112
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. POPULAR CATEGORIES GRID (12 Cards matching Reference Poster) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Popular Categories
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-semibold text-[#0066FF] dark:text-[#42D9FF] hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-4">
          {POPULAR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#10283B]/70 border transition-all duration-200 group text-center backdrop-blur-md ${
                  isSelected
                    ? 'border-[#0066FF] dark:border-[#42D9FF] ring-2 ring-[#0066FF]/20 shadow-md scale-102'
                    : 'border-slate-200/70 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-sm hover:-translate-y-0.5'
                }`}
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-105 border ${cat.color}`}
                >
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200 truncate w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Extended Categories dropdown if "More" is clicked */}
        {showExtendedCategories && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Additional Healthcare Categories:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {EXTENDED_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? null : cat.id);
                      setActiveFilter('All');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-[#10283B]/80 border transition-all duration-200 ${
                      isSelected
                        ? 'border-[#0066FF] ring-2 ring-[#0066FF]/20 shadow-md'
                        : 'border-slate-200/70 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 border ${cat.color}`}>
                      <cat.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. TOP HOSPITALS IN TAMIL NADU matching Reference Poster */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Top Hospitals in Tamil Nadu
          </h2>
          <Link
            href="/facilities"
            className="text-xs font-semibold text-[#0066FF] dark:text-[#42D9FF] hover:underline flex items-center"
          >
            View All →
          </Link>
        </div>

        {/* PROMINENT SHOWCASE CARD: Apollo Hospitals, Chennai (from Reference Poster) */}
        {(!selectedCategory || selectedCategory === 'cardiology' || selectedCategory === 'multi-speciality') && (
          <div
            onClick={() => router.push('/facilities/fac-apollo-chennai')}
            className="relative rounded-2xl bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 p-4 sm:p-4.5 shadow-lg backdrop-blur-xl hover:shadow-xl hover:border-[#0066FF]/40 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              {/* Exterior Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <img
                  src="/images/apollo_chennai.jpg"
                  alt="Apollo Hospitals, Chennai"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Hospital Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#0066FF] dark:group-hover:text-[#42D9FF] transition">
                    Apollo Hospitals, Chennai
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Dismiss or bookmark"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multi-speciality Hospital
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    4.6
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">(12.5k)</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    3.2 km • 12 mins
                  </span>
                </div>

                <div className="pt-1">
                  <span className="inline-flex items-center text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/60">
                    <span className="mr-1">🚨</span> Emergency Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Grid of Remaining Hospitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredFacilities
            .filter((f) => f.id !== 'fac-apollo-chennai')
            .map((facility) => (
              <div
                key={facility.id}
                onClick={() => router.push(`/facilities/${facility.id}`)}
                className="rounded-2xl bg-white/75 dark:bg-[#10283B]/75 border border-slate-200/70 dark:border-white/10 p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#0066FF]/40 backdrop-blur-md group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {facility.facilityType}
                    </span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {facility.emergencyAvailable && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md border border-red-200 dark:border-red-900/50">
                          🚨 Emergency
                        </span>
                      )}
                      {facility.distanceKm !== undefined && (
                        <span className="text-xs font-bold text-[#0066FF] dark:text-[#42D9FF]">
                          {formatDistance(facility.distanceKm)}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#0066FF] dark:group-hover:text-[#42D9FF] transition line-clamp-1">
                    {facility.name}
                  </h3>

                  {facility.rating && (
                    <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{facility.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({facility.reviewCount || 120}+ reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#0066FF] shrink-0" />
                    {facility.location.addressLine1}, {facility.location.city}
                  </p>

                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                    Est. Travel Time: ~{calculateETA(facility.distanceKm)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0066FF] dark:text-[#42D9FF] hover:bg-blue-50 transition"
                        title={`Call ${facility.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.location.latitude},${facility.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#00C6D7] hover:bg-cyan-50 transition"
                      title="Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="text-xs font-bold text-[#0066FF] dark:text-[#42D9FF] flex items-center group-hover:translate-x-0.5 transition">
                    Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
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
          Loading CareNest Healthcare Directory...
        </div>
      }
    >
      <FindCareContent />
    </Suspense>
  );
}
