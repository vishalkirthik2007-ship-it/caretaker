'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Compass,
  Building2,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  Camera,
  User,
  Check,
  HeartPulse,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { HealthcareJourney, Facility, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [journeys, setJourneys] = useState<HealthcareJourney[]>([]);
  const [savedFacilities, setSavedFacilities] = useState<Facility[]>([]);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Vishal');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t.dashboard.greetingMorning);
    else if (hour < 17) setGreeting(t.dashboard.greetingAfternoon);
    else setGreeting(t.dashboard.greetingEvening);

    const currentUser = repository.getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    setUserProfile(currentUser);
    if (currentUser.fullName) {
      setUserName(currentUser.fullName.split(' ')[0]);
    }
    if (currentUser.photoUrl) {
      setPhotoUrl(currentUser.photoUrl);
    }

    const activeJourneys = repository.getJourneys();
    setJourneys(activeJourneys);

    const savedIds = repository.getSavedFacilityIds();
    const facilities = repository.getFacilities({
      userLat: currentUser?.preferences?.lastKnownLatitude || 13.0827,
      userLon: currentUser?.preferences?.lastKnownLongitude || 80.2707,
    });
    setSavedFacilities(facilities.filter((f) => savedIds.includes(f.id)));
  }, [t, router]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
      const updated = repository.updateProfilePhoto(dataUrl);
      if (updated) {
        setUserProfile(updated);
        setPhotoSavedSuccess(true);
        setTimeout(() => setPhotoSavedSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/find-care?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const activeJourney = journeys[0];
  const completedSteps = activeJourney?.steps.filter((s) => s.isCompleted).length || 0;
  const totalSteps = activeJourney?.steps.length || 6;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Greeting with Profile Picture DP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-xs font-semibold py-0.5">
              Personal Navigation Portal
            </Badge>
            {userProfile?.city && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-teal-700 dark:text-teal-400" />
                {userProfile.city}, India
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-1">
            {/* Small circular profile-picture / DP icon beside the greeting */}
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile picture"
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer shadow-sm transition transform hover:scale-105"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-teal-800 dark:text-teal-200 font-extrabold text-base">
                    {userName ? userName.slice(0, 2).toUpperCase() : 'CP'}
                  </div>
                )}
              </div>

              {/* Upload camera badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shadow hover:bg-teal-800 transition"
                title="Upload photo"
              >
                <Camera className="w-3 h-3" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {greeting}, {userName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t.app.tagline}
              </p>
            </div>
          </div>

          {photoSavedSuccess && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center pt-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5 mr-1" />
              Profile photo updated successfully!
            </p>
          )}
        </div>

        {/* Quick Profile Link */}
        <Link href="/profile" className="self-start sm:self-center">
          <Button variant="outline" size="sm" className="text-xs">
            <User className="w-3.5 h-3.5 mr-1.5 text-teal-700 dark:text-teal-400" />
            View Full Profile
          </Button>
        </Link>
      </div>

      {/* 2. Main Search Bar & Hero ("How can we help you find care?") */}
      <div className="glass-panel p-6 sm:p-9 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Instant Healthcare Navigation
            </span>
            <label
              htmlFor="care-search"
              className="block text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              {t.dashboard.mainQuestion}
            </label>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-sky-600 dark:text-sky-400" />
            <input
              id="care-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              className={`w-full rounded-2xl glass-input pl-12 pr-28 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-sm ${
                easyMode ? 'text-lg py-4 pl-14' : ''
              }`}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 px-4 py-2 font-bold rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-md"
            >
              {t.common.search}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Popular Indian Searches:</span>
            {['Apollo Greams Road', 'AIIMS trauma triage', 'NABL Blood Test', 'Jan Aushadhi generic shop', 'Chest pain emergency', 'CMC Vellore OPD'].map(
              (sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sample);
                    router.push(`/find-care?q=${encodeURIComponent(sample)}`);
                  }}
                  className="text-xs glass-card hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl transition shadow-2xs font-medium"
                >
                  {sample}
                </button>
              )
            )}
          </div>
        </form>
      </div>

      {/* Personalized Healthcare Context & City Navigation Alert */}
      {userProfile?.healthConditions && (
        <div className="p-4 sm:p-5 glass-card border border-sky-200/80 dark:border-sky-800/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                Personalized Care Context: {userProfile.healthConditions}
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-xs">
                CarePath AI has tailored facility suggestions, emergency triage, and OPD checklists for your location in {userProfile.city || 'India'}.
              </span>
            </div>
          </div>
          <Link href="/find-care" className="shrink-0 self-start sm:self-center">
            <Button size="sm" variant="outline" className="text-xs py-1.5 px-3.5 rounded-xl border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300">
              Explore Care Categories →
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/find-care" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-sky-400/50 dark:hover:border-sky-500/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-3 shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                {t.nav.findCare}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse 25+ care categories</p>
            </div>
          </Link>

          <Link href="/facilities" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-sky-400/50 dark:hover:border-sky-500/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                {t.dashboard.nearbyFacilities}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hospitals, clinics & labs</p>
            </div>
          </Link>

          <Link href="/assistant" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-sky-400/50 dark:hover:border-sky-500/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                {t.nav.assistant}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI triage & guidance</p>
            </div>
          </Link>

          <Link href="/journey" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-sky-400/50 dark:hover:border-sky-500/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3 shadow-xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {t.dashboard.prepareVisit}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">OPD questions & prep</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Continue Your Journey */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.dashboard.activeJourney}
          </h2>
          <Link href="/journey" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center">
            View Journey Pipeline
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {activeJourney ? (
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-4 shadow-lg border border-white/60 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success" className="text-xs px-2.5 py-0.5">Active Journey</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Started {new Date(activeJourney.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {activeJourney.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Target Service: <strong className="text-sky-700 dark:text-sky-400">{activeJourney.categoryName}</strong>
                </p>
              </div>
              <Link href="/journey">
                <Button size="sm" className="rounded-xl px-4 py-2 font-bold bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md">
                  Continue Next Step →
                </Button>
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Journey Progress: {progressPercent}%</span>
                <span>{completedSteps} of {totalSteps} steps completed</span>
              </div>
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-500 dark:text-slate-400 rounded-3xl border border-white/60 dark:border-white/10">
            <p className="text-sm font-medium">{t.dashboard.noActiveJourney}</p>
            <Link href="/find-care" className="mt-3 inline-block">
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white">{t.dashboard.startJourneyBtn}</Button>
            </Link>
          </div>
        )}
      </div>

      {/* 5. Saved Care & Facilities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.dashboard.savedCare}
          </h2>
          <Link href="/facilities" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center">
            Browse All Facilities
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {savedFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedFacilities.map((facility) => (
              <div
                key={facility.id}
                onClick={() => router.push(`/facilities/${facility.id}`)}
                className="p-6 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-sky-400/60 dark:hover:border-sky-500/60 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-[11px] mb-1.5 glass-panel px-2 py-0.5 text-slate-700 dark:text-slate-200 font-semibold">
                      {facility.facilityType}
                    </Badge>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-sky-500 shrink-0" />
                      {facility.location.addressLine1}, {facility.location.city}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-2.5 py-1 rounded-xl shadow-2xs border border-sky-200 dark:border-sky-800">
                    {formatDistance(facility.distanceKm)}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                    Verified Facility
                  </span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition flex items-center">
                    Facility Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No saved facilities yet.</p>
        )}
      </div>
    </div>
  );
}
