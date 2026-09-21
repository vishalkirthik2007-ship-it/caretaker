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
  Bell,
  FileText,
  ShieldCheck,
  Navigation,
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { HealthcareJourney, Facility, UserProfile, DocumentItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatDistance } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { easyMode } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [journeys, setJourneys] = useState<HealthcareJourney[]>([]);
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('User');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

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

    const facilities = repository.getFacilities({
      userLat: currentUser?.preferences?.lastKnownLatitude || 13.0827,
      userLon: currentUser?.preferences?.lastKnownLongitude || 80.2707,
    });
    setNearbyFacilities(facilities.slice(0, 4));

    const docs = repository.getDocuments(currentUser.id);
    setDocuments(docs.slice(0, 3));
  }, [router]);

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

  const activeJourney = journeys[0];
  const completedSteps = activeJourney?.steps.filter((s) => s.isCompleted).length || 0;
  const totalSteps = activeJourney?.steps.length || 6;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER: Profile DP, Personalized Greeting, Theme & Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center space-x-4">
          {/* Profile DP with Camera Uploader */}
          <div className="relative group shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Click to update profile photo"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl overflow-hidden border-2 border-[#0866FF] dark:border-[#00C6D7] bg-white dark:bg-[#10283B] flex items-center justify-center cursor-pointer shadow-md shadow-blue-500/15 transition transform hover:scale-105"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#0866FF] dark:text-[#48DFFF] font-extrabold text-xl">
                  {userName ? userName.slice(0, 2).toUpperCase() : 'CN'}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] text-white flex items-center justify-center shadow-md hover:scale-110 transition ring-2 ring-white dark:ring-[#071827]"
              title="Upload profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
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
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#0866FF] dark:text-[#48DFFF] uppercase tracking-wider">
                Personalized Care Portal
              </span>
              {userProfile?.city && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  • <MapPin className="w-3 h-3 ml-1 mr-0.5 text-[#00C6D7]" />
                  {userProfile.city}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {greeting}, {userName}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              How are you feeling today?
            </p>

            {photoSavedSuccess && (
              <p className="text-[11px] text-[#20C997] font-semibold flex items-center pt-0.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 mr-1" />
                Profile photo updated successfully!
              </p>
            )}
          </div>
        </div>

        {/* Right side: Notification, Theme toggle, Profile button */}
        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          <button
            onClick={() => setNotificationCount(0)}
            className="relative p-2.5 rounded-2xl glass-card text-slate-600 dark:text-slate-300 hover:text-[#0866FF] dark:hover:text-[#48DFFF] transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5C6C] animate-pulse" />
            )}
          </button>

          <ThemeToggle />

          <Link href="/profile">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs py-2 px-3.5 border-slate-200/80 dark:border-slate-700/80 hover:border-[#0866FF]"
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-[#0866FF] dark:text-[#48DFFF]" />
              <span>Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. LARGE GLOBAL SEARCH */}
      <div className="glass-panel p-6 sm:p-9 rounded-[2rem] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0866FF]/15 to-[#00C6D7]/15 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSearchSubmit} className="space-y-3 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0866FF] dark:text-[#48DFFF]">
              Global Healthcare Search
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Search hospitals, doctors, specialists or healthcare services...
            </h2>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-[#0866FF] dark:text-[#48DFFF]" />
            <input
              id="care-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Apollo Greams Road, Cardiologist near me, 24/7 Casualty, CMC Vellore..."
              className={`w-full rounded-2xl glass-input pl-12 pr-32 py-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-sm ${
                easyMode ? 'text-lg py-5 pl-14' : ''
              }`}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 px-5 py-2.5 font-bold rounded-xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white shadow-md shadow-[#0866FF]/25"
            >
              Search
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Popular Filters:</span>
            {[
              'Apollo Chennai',
              'Ganga Hospital Coimbatore',
              'Meenakshi Mission Madurai',
              'Kauvery Trichy',
              'Manipal Salem',
              'CMC Vellore',
              '24/7 Casualty',
              'CMCHIS Cashless',
              'Jan Aushadhi Generic',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setSearchQuery(sample);
                  router.push(`/find-care?q=${encodeURIComponent(sample)}`);
                }}
                className="text-xs glass-card hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl transition font-medium hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40"
              >
                {sample}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Core Healthcare Services
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/find-care" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-[#0866FF]/50 dark:hover:border-[#48DFFF]/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0866FF]/10 text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center mb-3 shadow-xs">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF] transition">
                Find Care
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">17+ specialties, diagnostics & clinics</p>
            </div>
          </Link>

          <Link href="/map" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-[#00C6D7]/50 dark:hover:border-[#00C6D7]/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#00C6D7]/15 text-[#00C6D7] flex items-center justify-center mb-3 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#00C6D7] transition">
                Hospital Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real Google Maps navigation & radar</p>
            </div>
          </Link>

          <Link href="/assistant" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-[#20C997]/50 dark:hover:border-[#20C997]/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#20C997]/15 text-[#20C997] flex items-center justify-center mb-3 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#20C997] transition">
                Ask Care AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Triage, CMCHIS & health guidance</p>
            </div>
          </Link>

          <Link href="/journey" className="group">
            <div className="h-full p-5 rounded-3xl glass-card border border-white/60 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-500 transition">
                My Care Journey
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connected visit milestones & checklists</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. PERSONALIZED HEALTH HERO */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2rem] border border-blue-200/70 dark:border-blue-900/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-[#0866FF] dark:text-[#48DFFF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Health Navigation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              &ldquo;Your Health Journey Matters&rdquo;
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CareNest organizes verified hospitals, appointments, and medical records into one calm, private ecosystem.
              {userProfile?.healthConditions
                ? ` Tailored for your profile with active note on ${userProfile.healthConditions}.`
                : ' All data is stored locally in your private encrypted health vault.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Badge variant="success" className="text-xs px-3 py-1 font-semibold">
                🔒 Encrypted Health Vault
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1 font-semibold glass-card">
                🏛️ CMCHIS / PM-JAY Cashless Support
              </Badge>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end space-y-3">
            <Link href="/assistant">
              <Button className="py-3 px-6 text-sm font-bold rounded-2xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/30">
                Ask AI Assistant →
              </Button>
            </Link>
            <span className="text-[11px] text-slate-400">24/7 Immediate Guidance</span>
          </div>
        </div>
      </div>

      {/* 5. NEARBY HEALTHCARE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Nearby Healthcare in {userProfile?.city || 'Tamil Nadu'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified tertiary medical centers & specialty hospitals with live travel time
            </p>
          </div>
          <Link
            href="/facilities"
            className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline flex items-center"
          >
            Explore All Directory
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyFacilities.map((facility) => (
            <div
              key={facility.id}
              onClick={() => router.push(`/facilities/${facility.id}`)}
              className="p-5 rounded-3xl glass-card border border-white/70 dark:border-white/10 hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {facility.facilityType}
                  </span>
                  {facility.distanceKm !== undefined && (
                    <span className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] bg-[#0866FF]/10 dark:bg-[#0866FF]/20 px-2 py-0.5 rounded-lg border border-[#0866FF]/20 shrink-0">
                      {formatDistance(facility.distanceKm)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1.5 line-clamp-2 group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF] transition">
                  {facility.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#0866FF] shrink-0" />
                  {facility.location.city}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[#20C997] font-semibold text-[11px] flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  ETA: {calculateETA(facility.distanceKm)}
                </span>
                <span className="text-[#0866FF] dark:text-[#48DFFF] font-bold">
                  Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. UPCOMING CARE / JOURNEY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Upcoming Care & Journey Milestones
          </h2>
          <Link
            href="/journey"
            className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline flex items-center"
          >
            Full Journey Timeline
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {activeJourney ? (
          <div className="glass-panel p-6 sm:p-7 rounded-[2rem] space-y-4 shadow-lg border border-white/60 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="success" className="text-xs px-2.5 py-0.5">Active Pathway</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Updated {new Date(activeJourney.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
                  {activeJourney.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Specialty: <strong className="text-[#0866FF] dark:text-[#48DFFF]">{activeJourney.categoryName}</strong>
                </p>
              </div>

              <Link href="/journey">
                <Button size="sm" className="rounded-xl px-4 py-2 font-bold bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-md shadow-[#0866FF]/20">
                  Continue Next Step →
                </Button>
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Journey Progress: {progressPercent}%</span>
                <span>{completedSteps} of {totalSteps} milestones completed</span>
              </div>
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#0866FF] via-[#00C6D7] to-[#20C997] h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-slate-500 dark:text-slate-400 rounded-3xl border border-white/60 dark:border-white/10">
            <p className="text-sm font-medium">No active care pathway scheduled.</p>
            <Link href="/find-care" className="mt-3 inline-block">
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white">Start New Care Pathway</Button>
            </Link>
          </div>
        )}
      </div>

      {/* 7. RECENT HEALTH DOCUMENTS VAULT PREVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Secure Document Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Digital health wallet for diagnostic reports, prescriptions, and scheme cards
            </p>
          </div>
          <Link
            href="/documents"
            className="text-xs font-bold text-[#0866FF] dark:text-[#48DFFF] hover:underline flex items-center"
          >
            View Document Vault
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Link key={doc.id} href="/documents" className="group">
              <div className="p-5 rounded-3xl glass-card border border-white/70 dark:border-white/10 hover:border-[#0866FF]/40 dark:hover:border-[#48DFFF]/40 transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C6D7] block truncate">
                      {doc.categoryName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#0866FF] dark:group-hover:text-[#48DFFF] transition">
                      {doc.title}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verified
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
