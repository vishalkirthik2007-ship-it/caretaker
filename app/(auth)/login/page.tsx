'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  HeartPulse,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Building2,
  Bot,
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // UI & Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returningUser, setReturningUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check for remembered user profiles to allow quick sign-in
    const active = repository.getCurrentUser();
    const remembered = repository.getRememberedProfiles();

    const existing = active || (remembered && remembered.length > 0 ? remembered[0] : null);
    if (existing) {
      setReturningUser(existing);
      setFullName(existing.fullName || '');
      setPhone(existing.phoneNumber || '');
      setEmail(existing.email || '');
    }
  }, []);

  const handleToggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLoginMode) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        newErrors.fullName = 'Please enter your full name.';
      }
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password.trim()) {
      newErrors.password = isLoginMode ? 'Password is required.' : 'Please create a password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const userName = fullName.trim() || (returningUser?.fullName ?? 'CareNest Member');
    const userCity = returningUser?.city || 'Chennai';

    const userProfile: UserProfile = {
      id: returningUser?.id || `usr-${Date.now()}`,
      email: email.trim(),
      fullName: userName,
      phoneNumber: phone.trim(),
      city: userCity,
      dateOfBirth: returningUser?.dateOfBirth,
      age: returningUser?.age || 28,
      gender: returningUser?.gender || 'Male',
      healthConditions: returningUser?.healthConditions,
      emergencyContactName: returningUser?.emergencyContactName,
      emergencyContactPhone: returningUser?.emergencyContactPhone,
      photoUrl: returningUser?.photoUrl,
      preferredLanguage: returningUser?.preferredLanguage || 'en',
      theme: returningUser?.theme || 'light',
      easyModeEnabled: false,
      isAdmin: false,
      createdAt: returningUser?.createdAt || new Date().toISOString(),
      preferences: returningUser?.preferences || {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'default',
        locationEnabled: true,
        lastKnownLatitude: 13.0827,
        lastKnownLongitude: 80.2707,
        shareAnonymousAnalytics: true,
      },
    };

    repository.saveCurrentUser(userProfile);

    setTimeout(() => {
      setIsSubmitting(false);
      router.replace('/dashboard');
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* 2. CINEMATIC MOUNTAIN LANDSCAPE BACKGROUND WITH ATMOSPHERIC OVERLAYS      */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        {/* Light Mode Mountain Landscape */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 dark:opacity-0 opacity-100 scale-105 transform animate-subtle-drift"
          style={{
            backgroundImage: "url('/images/healthcare_bg_light.jpg')",
          }}
        />

        {/* Dark Mode Midnight Mountain Landscape */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 dark:opacity-100 opacity-0 scale-105 transform animate-subtle-drift"
          style={{
            backgroundImage: "url('/images/healthcare_bg_dark.jpg')",
          }}
        />

        {/* Cinematic Atmospheric Color Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-950/25 to-slate-950/50 dark:from-[#071827]/75 dark:via-[#071827]/60 dark:to-[#051423]/90 backdrop-blur-[1.5px]" />

        {/* Subtle Ambient Radial Lighting Glows */}
        <div className="absolute top-1/4 left-1/4 w-[45rem] h-[45rem] rounded-full bg-[#0866FF]/15 dark:bg-[#0866FF]/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[40rem] h-[40rem] rounded-full bg-[#00C6D7]/20 dark:bg-[#00C6D7]/15 blur-[120px] pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 21. TOP RIGHT THEME SWITCHER                                              */}
      {/* ========================================================================= */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-50 flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/25 text-white/90 text-[11px] font-medium shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>India Health Network</span>
        </div>
        <div className="p-1 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-lg">
          <ThemeToggle />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN THREE-ZONE COMPOSITION CONTAINER                                     */}
      {/* LEFT: 30-35% | CENTER: 30-35% | RIGHT: 25-30%                            */}
      {/* ========================================================================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* ZONE 1: LEFT SIDE (30-35% on Desktop)                                 */}
          {/* Branding + Mountain Person Scene + Quote                              */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:space-y-8 order-1">
            {/* 3. CareNest Upper Branding */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
                  <HeartPulse className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-md">
                    CARE NEST
                  </h1>
                </div>
              </div>
              <p className="text-white text-base sm:text-lg font-semibold tracking-wide drop-shadow-sm pt-1">
                Your Health, Our Priority
              </p>
              <p className="text-white/80 text-xs sm:text-sm font-normal tracking-wide">
                Smarter Care &nbsp;•&nbsp; Better Decisions &nbsp;•&nbsp; Healthier Tomorrow
              </p>
            </div>

            {/* 4. Left-Side Cinematic Person & Mountain Visual */}
            <div className="relative group overflow-hidden rounded-[2rem] border border-white/30 dark:border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-white/40">
              <div className="relative w-full h-56 sm:h-64 lg:h-72 overflow-hidden">
                <Image
                  src="/images/carenest_wellness_traveler.jpg"
                  alt="CareNest Healthcare Journey"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                
                {/* Visual badge inside the card */}
                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white/95">
                  <span className="text-xs font-semibold tracking-wide drop-shadow-md flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 mr-1.5" />
                    Journey Toward Better Health
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-medium">
                    Wellness
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Left-Side Quote */}
            <div className="pt-1">
              <blockquote className="font-serif italic text-white/95 text-lg sm:text-xl lg:text-2xl leading-snug drop-shadow-md">
                &ldquo;Good health is the foundation of a brighter future.&rdquo;
              </blockquote>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#00C6D7] to-transparent mt-3 rounded-full" />
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ZONE 2: CENTER LOGIN CARD (30-35% on Desktop - PRIMARY FOCUS)         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex justify-center order-2">
            <div className="w-full max-w-md rounded-[2.5rem] bg-white/20 dark:bg-[#071827]/70 backdrop-blur-2xl border border-white/35 dark:border-white/15 p-6 sm:p-8 md:p-9 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/45">
              
              {/* Subtle top cyan light edge */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-cyan-400/30 to-transparent blur-xl pointer-events-none" />

              {/* 7. Card Header */}
              <div className="text-center space-y-1.5 pb-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                  {isLoginMode ? 'Welcome Back' : 'Welcome Back'}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 font-medium">
                  {isLoginMode
                    ? 'Sign in to continue your healthcare journey'
                    : 'Sign in to continue your healthcare journey'}
                </p>
              </div>

              {/* Returning user badge if detected */}
              {returningUser && !isLoginMode && (
                <div className="mt-3 p-2.5 rounded-2xl bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] flex items-center justify-center font-bold text-[10px]">
                      {returningUser.fullName ? returningUser.fullName.slice(0, 2).toUpperCase() : 'CN'}
                    </div>
                    <span className="truncate font-semibold">
                      Welcome, {returningUser.fullName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFullName('');
                      setPhone('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-[11px] text-cyan-300 hover:underline shrink-0 ml-2"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* 8. Form Fields */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Field 1: Full Name (hidden in pure login mode if toggled) */}
                {!isLoginMode && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-white uppercase tracking-wider pl-3">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-cyan-300/80 group-focus-within:text-cyan-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Enter your name"
                        className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/90 dark:bg-[#0c2236]/85 backdrop-blur-md border border-white/40 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00C6D7] focus:border-transparent transition-all"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-300 pl-3 pt-0.5 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                )}

                {/* Field 2: Phone Number (+91) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider pl-3">
                    Phone Number
                  </label>
                  <div className="relative group flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-cyan-300/80 group-focus-within:text-cyan-400 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    {/* +91 Country Code Pill */}
                    <div className="absolute left-10 flex items-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-600 dark:text-cyan-300/90 pl-1 pr-1.5 border-r border-slate-300 dark:border-white/20">
                        +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="Enter your mobile number"
                      className="w-full pl-24 pr-4 py-3.5 rounded-full bg-white/90 dark:bg-[#0c2236]/85 backdrop-blur-md border border-white/40 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00C6D7] focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-300 pl-3 pt-0.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Field 3: Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider pl-3">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-cyan-300/80 group-focus-within:text-cyan-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/90 dark:bg-[#0c2236]/85 backdrop-blur-md border border-white/40 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00C6D7] focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-300 pl-3 pt-0.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Field 4: Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider pl-3">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-cyan-300/80 group-focus-within:text-cyan-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="Create a password"
                      className="w-full pl-11 pr-11 py-3.5 rounded-full bg-white/90 dark:bg-[#0c2236]/85 backdrop-blur-md border border-white/40 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#00C6D7] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white focus:outline-none cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-300 pl-3 pt-0.5 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 9. Large Pill-Shaped Button (Blue -> Cyan Gradient) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative py-4 px-6 rounded-full bg-gradient-to-r from-[#0866FF] via-[#00A3FF] to-[#00C6D7] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#0866FF]/30 hover:shadow-cyan-400/40 hover:opacity-95 active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Getting Started...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>

                {/* 10. Login / Sign-up Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-white/85">
                    {isLoginMode ? (
                      <>
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          onClick={handleToggleMode}
                          className="text-[#48DFFF] font-bold hover:underline cursor-pointer ml-1"
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={handleToggleMode}
                          className="text-[#48DFFF] font-bold hover:underline cursor-pointer ml-1"
                        >
                          Login
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ZONE 3: RIGHT SIDE (25-30% on Desktop)                                */}
          {/* Decorative Message + 4 Floating Glass Feature Rows                    */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-5 order-3">
            {/* 12. Handwritten-Style Decorative Message */}
            <div className="text-center lg:text-left space-y-1 pb-1">
              <div className="inline-flex items-center space-x-1 text-cyan-300">
                <Sparkles className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-200">
                  CareNest Advantage
                </span>
              </div>
              <h3 aria-label="Your Health Matters" className="font-serif italic text-3xl sm:text-4xl text-white font-normal leading-tight drop-shadow-md">
                <span className="sr-only">Your Health Matters</span>
                Your<br />
                Health<br />
                Matters
              </h3>
              {/* Subtle hand-drawn wave underline */}
              <svg className="w-28 h-3 text-cyan-400 mt-1 opacity-80" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5C15 2 25 8 40 5C55 2 65 8 80 5C90 3 95 6 98 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* 11. Four Floating Glass Feature Rows */}
            <div className="space-y-3 pt-1">
              {/* Feature 1 */}
              <div className="group p-3.5 rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:bg-white/25 hover:border-white/35 transition-all duration-300 flex items-center space-x-3.5 transform hover:translate-x-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0866FF]/50 to-[#00C6D7]/50 border border-white/30 flex items-center justify-center shrink-0 text-white shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white leading-snug">
                  Find the best hospitals near you
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-3.5 rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:bg-white/25 hover:border-white/35 transition-all duration-300 flex items-center space-x-3.5 transform hover:translate-x-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0866FF]/50 to-[#00C6D7]/50 border border-white/30 flex items-center justify-center shrink-0 text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white leading-snug">
                  Get instant AI health assistance
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-3.5 rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:bg-white/25 hover:border-white/35 transition-all duration-300 flex items-center space-x-3.5 transform hover:translate-x-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0866FF]/50 to-[#00C6D7]/50 border border-white/30 flex items-center justify-center shrink-0 text-white shadow-md">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white leading-snug">
                  Track your health journey
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group p-3.5 rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:bg-white/25 hover:border-white/35 transition-all duration-300 flex items-center space-x-3.5 transform hover:translate-x-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0866FF]/50 to-[#00C6D7]/50 border border-white/30 flex items-center justify-center shrink-0 text-white shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white leading-snug">
                  Secure your medical records
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Subtle bottom footer info */}
      <footer className="w-full text-center py-3 text-[11px] text-white/60 font-medium z-10 pointer-events-none">
        CareNest Healthcare Platform &nbsp;•&nbsp; Powered by Certified Medical Protocols &amp; Verified Hospital Network
      </footer>
    </div>
  );
}
