'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Building2,
  Bot,
  MapPin,
  HeartPulse,
  Bell,
  Camera,
  ArrowRight,
  ShieldAlert,
  Pill,
  Lightbulb,
  Video,
  Plus,
  Clock,
  Star,
  Compass,
  FileText,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { HealthcareJourney, Facility, UserProfile, DocumentItem } from '@/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [journeys, setJourneys] = useState<HealthcareJourney[]>([]);
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [greeting, setGreeting] = useState('Good Evening');
  const [userName, setUserName] = useState('Kirthik');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState(false);
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
      repository.updateProfilePhoto(dataUrl);
      setPhotoSavedSuccess(true);
      setTimeout(() => setPhotoSavedSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/find-care?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
      
      {/* ========================================================================= */}
      {/* 1. HEADER: PROFILE AVATAR + GREETING + CONTROLS                           */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        {/* Profile Avatar + Dynamic Greeting */}
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="relative group shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#071827] flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[#0866FF] dark:text-[#00C6D7] font-black text-lg">
                    {userName ? userName.slice(0, 2).toUpperCase() : 'CN'}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Change Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Upload profile photo"
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {greeting}, &nbsp;{userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              How are you feeling today?
            </p>
          </div>
        </div>

        {/* Right Header Controls: Notification Bell + Theme Switcher */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            type="button"
            className="p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-[#0866FF] dark:hover:text-cyan-300 shadow-sm relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>
          
          <ThemeToggle />
        </div>
      </div>

      {photoSavedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">Profile photo updated successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GLOBAL SEARCH BAR (PILL SHAPED EXACTLY LIKE REFERENCE)                 */}
      {/* ========================================================================= */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for hospitals, symptoms, doctors, or services..."
            className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-full bg-white/90 dark:bg-[#10283B]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00C6D7] focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 3. FOUR SERVICE CARDS (Find Care, Ask Care, Map View, My Care Journey)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Find Care */}
        <Link
          href="/find-care"
          className="group p-4 sm:p-5 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex flex-col items-center text-center space-y-2.5 transform hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0066FF] dark:text-[#42D9FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Find Care
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Hospitals, Clinics &amp; more
            </p>
          </div>
        </Link>

        {/* Card 2: Ask Care */}
        <Link
          href="/assistant"
          className="group p-4 sm:p-5 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex flex-col items-center text-center space-y-2.5 transform hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#00C6D7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Ask Care
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              AI Health Assistant
            </p>
          </div>
        </Link>

        {/* Card 3: Map View */}
        <Link
          href="/map"
          className="group p-4 sm:p-5 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex flex-col items-center text-center space-y-2.5 transform hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-50 dark:bg-sky-950/50 text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Map View
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Nearby Hospitals
            </p>
          </div>
        </Link>

        {/* Card 4: My Care Journey */}
        <Link
          href="/journey"
          className="group p-4 sm:p-5 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex flex-col items-center text-center space-y-2.5 transform hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#00C6D7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              My Care Journey
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Track Your Health
            </p>
          </div>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 4. HERO BANNER: "Your Health Journey Matters" (EXACTLY AS IN POSTER)       */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-3xl border border-slate-200/70 dark:border-white/10 bg-gradient-to-r from-blue-50/90 via-sky-50/80 to-cyan-50/60 dark:from-[#0c2642] dark:via-[#0c243e] dark:to-[#0a1e34] shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          
          {/* Left Text Content */}
          <div className="md:col-span-7 p-6 sm:p-8 md:p-9 space-y-3 sm:space-y-4 z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Your Health Journey<br />
              Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-md leading-relaxed">
              Get personalized care, trusted information and a healthier tomorrow.
            </p>
            <div className="pt-1">
              <Link
                href="/find-care"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#102033] hover:bg-[#1a3350] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#102033] text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Right Consultation Image */}
          <div className="md:col-span-5 relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
            <Image
              src="/images/carenest_doctor_consultation.jpg"
              alt="Doctor Consultation"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center"
              priority
            />
            {/* Smooth gradient blend into the banner */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-blue-50/90 dark:from-[#0c2642] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK ACCESS SECTION (5 CIRCULAR ICONS: EMERGENCY, PHARMACY, TIPS...) */}
      {/* ========================================================================= */}
      <div className="space-y-3.5 pt-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Quick Access
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
          
          {/* Quick 1: Emergency Services */}
          <a
            href="tel:108"
            className="group p-3.5 sm:p-4 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-rose-300 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Emergency<br />Services
            </span>
          </a>

          {/* Quick 2: Nearby Pharmacies */}
          <Link
            href="/find-care?type=pharmacy"
            className="group p-3.5 sm:p-4 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#00C6D7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Nearby<br />Pharmacies
            </span>
          </Link>

          {/* Quick 3: Health Tips */}
          <Link
            href="/assistant"
            className="group p-3.5 sm:p-4 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Health<br />Tips
            </span>
          </Link>

          {/* Quick 4: Teleconsultation */}
          <Link
            href="/assistant"
            className="group p-3.5 sm:p-4 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0866FF] dark:text-[#48DFFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Teleconsultation
            </span>
          </Link>

          {/* Quick 5: More */}
          <Link
            href="/facilities"
            className="group p-3.5 sm:p-4 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-center text-center space-y-2"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              More
            </span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. NEARBY HEALTHCARE HUBS PREVIEW                                         */}
      {/* ========================================================================= */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Verified Healthcare Centers Near You
          </h2>
          <Link
            href="/find-care"
            className="text-xs font-bold text-[#0866FF] dark:text-cyan-400 hover:underline flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nearbyFacilities.slice(0, 2).map((facility) => (
            <Link
              key={facility.id}
              href={`/facilities/${facility.id}`}
              className="p-4 sm:p-5 rounded-3xl bg-white/85 dark:bg-[#10283B]/85 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-cyan-400/50 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0866FF] dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {facility.name}
                  </h3>
                  {facility.emergencyAvailable && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                      24/7 ER
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#0866FF] shrink-0" />
                  <span>{facility.location.city}, Tamil Nadu</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {facility.rating}
                </span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <Clock className="w-3 h-3 mr-1" />
                  ~{Math.round((facility.distanceKm || 3.2) * 2.8)} mins travel
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
