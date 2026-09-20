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

      {/* 2. Main Search Bar ("How can we help you find care?") */}
      <Card className="border-teal-100 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-900 dark:to-slate-800/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <label
            htmlFor="care-search"
            className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
          >
            {t.dashboard.mainQuestion}
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400" />
            <input
              id="care-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              className={`w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-12 pr-28 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 shadow-xs ${
                easyMode ? 'text-lg py-4 pl-14' : ''
              }`}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2.5 px-4 font-semibold"
            >
              {t.common.search}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Try searching:</span>
            {['Skin specialist', 'AIIMS trauma care', 'Blood test (NABL)', 'Jan Aushadhi store', 'Chest tightness'].map(
              (sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sample);
                    router.push(`/find-care?q=${encodeURIComponent(sample)}`);
                  }}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition"
                >
                  {sample}
                </button>
              )
            )}
          </div>
        </form>
      </Card>

      {/* Personalized Healthcare Context & City Navigation Alert */}
      {userProfile?.healthConditions && (
        <Card className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-teal-950 dark:text-teal-100 block">
                Personalized Care Context: {userProfile.healthConditions}
              </span>
              <span className="text-teal-800 dark:text-teal-300 text-[11px]">
                CarePath AI has tailored facility suggestions and appointment checklists for your location in {userProfile.city || 'India'}.
              </span>
            </div>
          </div>
          <Link href="/find-care" className="shrink-0 self-start sm:self-center">
            <Button size="sm" variant="outline" className="text-xs py-1 px-3">
              Explore Care Categories →
            </Button>
          </Link>
        </Card>
      )}

      {/* 3. Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/find-care" className="group">
            <Card className="h-full p-5 hover:border-teal-300 dark:hover:border-teal-600 transition group-hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                {t.nav.findCare}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse 25+ care categories</p>
            </Card>
          </Link>

          <Link href="/facilities" className="group">
            <Card className="h-full p-5 hover:border-teal-300 dark:hover:border-teal-600 transition group-hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                {t.dashboard.nearbyFacilities}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hospitals, clinics & labs</p>
            </Card>
          </Link>

          <Link href="/assistant" className="group">
            <Card className="h-full p-5 hover:border-teal-300 dark:hover:border-teal-600 transition group-hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                {t.nav.assistant}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI triage & guidance</p>
            </Card>
          </Link>

          <Link href="/journey" className="group">
            <Card className="h-full p-5 hover:border-teal-300 dark:hover:border-teal-600 transition group-hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                {t.dashboard.prepareVisit}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">OPD questions & prep</p>
            </Card>
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
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-200 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">Active Journey</Badge>
                  <span className="text-xs text-slate-400">
                    Started {new Date(activeJourney.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {activeJourney.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Target Service: <strong>{activeJourney.categoryName}</strong>
                </p>
              </div>
              <Link href="/journey">
                <Button size="sm">Continue Next Step</Button>
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Journey Progress: {progressPercent}%</span>
                <span>{completedSteps} of {totalSteps} steps completed</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-teal-700 dark:bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <p className="text-sm">{t.dashboard.noActiveJourney}</p>
            <Link href="/find-care" className="mt-3 inline-block">
              <Button size="sm">{t.dashboard.startJourneyBtn}</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* 5. Saved Care & Facilities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.dashboard.savedCare}
          </h2>
          <Link href="/facilities" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center">
            Browse All Facilities
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {savedFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedFacilities.map((facility) => (
              <Card
                key={facility.id}
                onClick={() => router.push(`/facilities/${facility.id}`)}
                className="p-5 hover:border-teal-300 dark:hover:border-teal-700 transition cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-[11px] mb-1">
                      {facility.facilityType}
                    </Badge>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {facility.location.addressLine1}, {facility.location.city}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded-lg">
                    {formatDistance(facility.distanceKm)}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block mr-1.5" />
                    Open Today
                  </span>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                    Facility Details →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No saved facilities yet.</p>
        )}
      </div>
    </div>
  );
}
