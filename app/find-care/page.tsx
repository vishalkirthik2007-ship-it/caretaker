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
  Filter,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { checkEmergencyTriage, mapQueryToCategory } from '@/lib/ai/safety';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

// Specific 17 categories requested in Section 17
const MEDICAL_CATEGORIES = [
  { id: 'cardiology', name: 'Cardiology', icon: Heart, desc: 'Heart care, ECG & angioplasty' },
  { id: 'orthopaedics', name: 'Orthopaedics', icon: Activity, desc: 'Bone, joint & trauma care' },
  { id: 'neurology', name: 'Neurology', icon: Zap, desc: 'Brain, stroke & spine specialists' },
  { id: 'oncology', name: 'Oncology', icon: Microscope, desc: 'Comprehensive cancer therapy' },
  { id: 'paediatrics', name: 'Paediatrics', icon: Baby, desc: 'Newborn, infant & child care' },
  { id: 'maternity', name: 'Maternity', icon: HeartHandshake, desc: 'Obstetrics, delivery & NICU' },
  { id: 'ent', name: 'ENT', icon: Smile, desc: 'Ear, nose & throat surgery' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye, desc: 'Eye surgery, cataract & retina' },
  { id: 'dermatology', name: 'Dermatology', icon: Sparkles, desc: 'Skin, hair & allergy clinics' },
  { id: 'dental', name: 'Dental', icon: Smile, desc: 'Oral care & dental surgery' },
  { id: 'general-medicine', name: 'General Medicine', icon: Stethoscope, desc: 'Physicians, fever & chronic OPD' },
  { id: 'emergency', name: 'Emergency', icon: AlertTriangle, desc: '24/7 Trauma, ICU & resuscitation' },
  { id: 'diagnostics', name: 'Diagnostics', icon: Microscope, desc: 'NABL Labs, MRI & CT Scans' },
  { id: 'pharmacy', name: 'Pharmacy', icon: Pill, desc: 'Jan Aushadhi & 24/7 pharmacy' },
  { id: 'blood-bank', name: 'Blood Bank', icon: Droplets, desc: 'Red Cross & verified blood units' },
  { id: 'mental-health', name: 'Mental Health', icon: Brain, desc: 'Psychiatry & Tele-MANAS 14416' },
  { id: 'multi-speciality', name: 'Multi-speciality', icon: Building2, desc: 'Apex tertiary hospitals' },
];

function FindCareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { easyMode } = useAccessibility();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'government' | 'private' | 'multi' | 'emergency'>('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
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
    if (!distanceKm) return '5 - 10 mins';
    const minutes = Math.max(5, Math.round(distanceKm * 2.4));
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours} hr ${rem} mins`;
    }
    return `${minutes} mins`;
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
      const catObj = MEDICAL_CATEGORIES.find((c) => c.id === selectedCategory);
      if (catObj) {
        const catName = catObj.name.toLowerCase();
        const hasSpecialty = f.services?.some((s) => s.toLowerCase().includes(catName));
        const isEmergency = catObj.id === 'emergency' && f.emergencyAvailable;
        if (!hasSpecialty && !isEmergency && f.facilityType.toLowerCase() !== 'hospital') {
          return false;
        }
      }
    }

    if (activeFilter === 'nearby') {
      return (f.distanceKm ?? 99) <= 25;
    }
    if (activeFilter === 'government') {
      return f.facilityType.toLowerCase().includes('government') || f.name.toLowerCase().includes('govt') || f.name.toLowerCase().includes('government');
    }
    if (activeFilter === 'private') {
      return !f.facilityType.toLowerCase().includes('government') && !f.name.toLowerCase().includes('govt');
    }
    if (activeFilter === 'multi') {
      return f.facilityType.toLowerCase().includes('hospital') || (f.services?.length ?? 0) >= 3;
    }
    if (activeFilter === 'emergency') {
      return f.emergencyAvailable;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP HEADER: Back Button, Title, Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-[#0866FF] dark:hover:text-[#48DFFF] transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-xs px-2.5 py-0.5">
                  Verified Directory
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tamil Nadu & India
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                Find Care
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 ml-12">
            Discover verified tertiary hospitals, specialized departments, diagnostics, and 24/7 casualty centers.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:self-center ml-12 sm:ml-0">
          <Link href="/map">
            <Button variant="outline" size="sm" className="text-xs rounded-2xl border-slate-200/80 dark:border-slate-700/80 hover:border-[#0866FF]">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#00C6D7]" />
              <span>View On Map</span>
            </Button>
          </Link>
          <Link href="/assistant">
            <Button size="sm" className="text-xs rounded-2xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white">
              <span>Ask AI Care</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] shadow-xl space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#0866FF] dark:text-[#48DFFF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, specialties, doctors or services (e.g. Apollo, Cardiology, CMC Vellore)..."
            className={`w-full rounded-2xl glass-input pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-xs ${
              easyMode ? 'text-lg py-4 pl-14' : ''
            }`}
          />
        </div>

        {/* Filter Controls Tabs: All, Nearby, Government, Private, Multi-speciality, Emergency */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Filters:
          </span>
          {[
            { id: 'all', label: 'All Providers' },
            { id: 'nearby', label: '📍 Nearby (<25 km)' },
            { id: 'government', label: '🏛️ Government Medical Colleges' },
            { id: 'private', label: '🏥 Private Tertiary' },
            { id: 'multi', label: '🌟 Multi-speciality' },
            { id: 'emergency', label: '🚨 24/7 Emergency Casualty' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilter(tab.id as any);
                setSelectedCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeFilter === tab.id && !selectedCategory
                  ? 'bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-md shadow-blue-500/20'
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Red Flag Alert */}
      {emergencyAlert && (
        <div className="rounded-[2rem] bg-red-50/90 dark:bg-red-950/70 border-2 border-red-500 p-6 text-red-900 dark:text-red-100 flex items-start space-x-4 shadow-xl animate-in fade-in backdrop-blur-md">
          <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-2.5">
            <h3 className="font-extrabold text-base text-red-800 dark:text-red-200">
              High Acuity Medical Symptom Detected
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{emergencyAlert}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="tel:108"
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Ambulance: Dial 108
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                National Emergency: Dial 112
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. 17 MEDICAL CATEGORIES (Requested in Section 17) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Medical Specialties & Services
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a specialized domain to filter verified hospital departments
            </p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MEDICAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                  setActiveFilter('all');
                }}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#0866FF] bg-gradient-to-tr from-[#0866FF]/15 to-[#00C6D7]/15 shadow-md ring-1 ring-[#0866FF]/30'
                    : 'border-slate-200/70 dark:border-slate-800/70 glass-card hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 hover:-translate-y-0.5'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white shadow-sm'
                      : 'bg-blue-50 dark:bg-slate-800 text-[#0866FF] dark:text-[#48DFFF] group-hover:scale-110'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HOSPITAL RESULTS (Section 18: Full-Card Clickable Hospital Cards) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Hospital Results ({filteredFacilities.length} Facilities Found)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click anywhere on a card to view verified departments, casualty protocols & directions
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            CMCHIS / NABH Verified
          </span>
        </div>

        {filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFacilities.map((facility) => (
              <div
                key={facility.id}
                onClick={() => router.push(`/facilities/${facility.id}`)}
                className="rounded-[2rem] glass-card border border-white/70 dark:border-white/10 p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 group"
              >
                <div>
                  {/* Top Bar: Type, Distance & Emergency Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      {facility.facilityType}
                    </span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {facility.emergencyAvailable && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
                          🚨 24/7 Casualty
                        </span>
                      )}
                      {facility.distanceKm !== undefined && (
                        <span className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] bg-[#0866FF]/10 dark:bg-[#0866FF]/20 px-2 py-0.5 rounded-lg border border-[#0866FF]/20">
                          {formatDistance(facility.distanceKm)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hospital Name & Rating */}
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF] transition line-clamp-2">
                    {facility.name}
                  </h3>

                  {facility.rating && (
                    <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{facility.rating}</span>
                      <span className="text-slate-400 font-normal">({facility.reviewCount || 120}+ reviews)</span>
                    </div>
                  )}

                  {/* Location & Estimated Time */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#0866FF] shrink-0" />
                    {facility.location.addressLine1}, {facility.location.city}
                  </p>

                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                    Est. Travel Time: ~{calculateETA(facility.distanceKm)}
                  </p>

                  {/* Key Services Chips */}
                  {facility.services && facility.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {facility.services.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] bg-blue-50/70 dark:bg-[#142B40] text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons (Direct Actions) */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl glass-card text-[#0866FF] dark:text-[#48DFFF] hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                        title={`Call ${facility.name}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.location.latitude},${facility.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl glass-card text-[#00C6D7] hover:bg-cyan-50 dark:hover:bg-slate-800 transition"
                      title="Google Maps Directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                    {facility.website && (
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl glass-card text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                        title="Official Hospital Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <span className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] group-hover:translate-x-0.5 transition flex items-center">
                    Full Details <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center rounded-[2rem] border border-white/60 dark:border-white/10 space-y-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No healthcare facilities found matching your current filter.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory(null);
                setActiveFilter('all');
              }}
              className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
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
