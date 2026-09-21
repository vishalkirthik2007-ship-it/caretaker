'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Building2,
  Sparkles,
  Rocket,
  MapPin,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Calendar,
  HeartPulse,
  Droplets,
  Ruler,
  Scale,
  Users,
  Pill,
  X,
  Plus,
  Heart,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { useTheme } from '@/hooks/use-theme';

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Form States - Core
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Form States - Additive Personal & Demographics
  const [city, setCity] = useState('Chennai');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');

  // Form States - Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('Parent');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Form States - Health Information
  const [bloodGroup, setBloodGroup] = useState('Unknown / Not sure');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returningUser, setReturningUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Detect returning citizen profile for quick sign-in
    const active = repository.getCurrentUser();
    const remembered = repository.getRememberedProfiles();
    const existing = active || (remembered && remembered.length > 0 ? remembered[0] : null);

    if (existing) {
      setReturningUser(existing);
      setFullName(existing.fullName || '');
      setPhone(existing.phoneNumber || '');
      setEmail(existing.email || '');
      if (existing.city) setCity(existing.city);
      if (existing.dateOfBirth) setDateOfBirth(existing.dateOfBirth);
      if (existing.gender) setGender(existing.gender);
      if (existing.emergencyContactName) setEmergencyContactName(existing.emergencyContactName);
      if (existing.emergencyContactRelationship) setEmergencyContactRelationship(existing.emergencyContactRelationship);
      if (existing.emergencyContactPhone) setEmergencyContactPhone(existing.emergencyContactPhone);
      if (existing.bloodGroup) setBloodGroup(existing.bloodGroup);
      if (existing.height) setHeight(existing.height);
      if (existing.weight) setWeight(existing.weight);
      if (existing.healthConditions) {
        setHealthConditions(
          existing.healthConditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }
      if (existing.allergies) setAllergies(existing.allergies);
      if (existing.currentMedications) setCurrentMedications(existing.currentMedications);
    }
  }, []);

  const addHealthCondition = (cond: string) => {
    const trimmed = cond.trim();
    if (!trimmed) return;
    if (trimmed === 'None' || trimmed === 'Prefer not to say') {
      setHealthConditions([trimmed]);
      setConditionInput('');
      return;
    }
    const filtered = healthConditions.filter((c) => c !== 'None' && c !== 'Prefer not to say');
    if (!filtered.includes(trimmed)) {
      setHealthConditions([...filtered, trimmed]);
    }
    setConditionInput('');
  };

  const removeHealthCondition = (cond: string) => {
    setHealthConditions(healthConditions.filter((c) => c !== cond));
  };

  const addAllergy = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (trimmed === 'No known allergies') {
      setAllergies([trimmed]);
      setAllergyInput('');
      return;
    }
    const filtered = allergies.filter((a) => a !== 'No known allergies');
    if (!filtered.includes(trimmed)) {
      setAllergies([...filtered, trimmed]);
    }
    setAllergyInput('');
  };

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter((a) => a !== item));
  };

  const addMedication = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (trimmed === 'No current medications') {
      setCurrentMedications([trimmed]);
      setMedicationInput('');
      return;
    }
    const filtered = currentMedications.filter((m) => m !== 'No current medications');
    if (!filtered.includes(trimmed)) {
      setCurrentMedications([...filtered, trimmed]);
    }
    setMedicationInput('');
  };

  const removeMedication = (item: string) => {
    setCurrentMedications(currentMedications.filter((m) => m !== item));
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

    if (emergencyContactPhone.trim()) {
      const cleanEmerg = emergencyContactPhone.replace(/[^0-9]/g, '');
      if (cleanEmerg.length < 10) {
        newErrors.emergencyContactPhone = 'Emergency phone should be a valid 10-digit Indian number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const userName = fullName.trim() || (returningUser?.fullName ?? 'CareNest Member');
    const userCity = city.trim() || returningUser?.city || 'Chennai';

    let calculatedAge = returningUser?.age || 28;
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        calculatedAge = Math.max(1, new Date().getFullYear() - birthYear);
      }
    }

    const userProfile: UserProfile = {
      id: returningUser?.id || `usr-${Date.now()}`,
      email: email.trim(),
      fullName: userName,
      phoneNumber: phone.trim(),
      city: userCity,
      dateOfBirth: dateOfBirth || returningUser?.dateOfBirth,
      age: calculatedAge,
      gender: gender || returningUser?.gender || 'Male',
      emergencyContactName: emergencyContactName.trim() || returningUser?.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone.trim() || returningUser?.emergencyContactPhone,
      emergencyContactRelationship: emergencyContactRelationship || returningUser?.emergencyContactRelationship || 'Parent',
      bloodGroup: bloodGroup || returningUser?.bloodGroup || 'Unknown / Not sure',
      height: height.trim() || returningUser?.height,
      weight: weight.trim() || returningUser?.weight,
      healthConditions: healthConditions.length > 0 ? healthConditions.join(', ') : returningUser?.healthConditions,
      allergies: allergies.length > 0 ? allergies : returningUser?.allergies,
      currentMedications: currentMedications.length > 0 ? currentMedications : returningUser?.currentMedications,
      photoUrl: returningUser?.photoUrl,
      preferredLanguage: returningUser?.preferredLanguage || 'en',
      theme: (theme as 'light' | 'dark') || 'light',
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

  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. FULL-SCREEN CINEMATIC MOUNTAIN BACKGROUND                              */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        {/* Light Mode Mountain Background */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: "url('/images/carenest_login_bg_light.jpg')",
            backgroundPosition: 'left 35% center',
          }}
        />

        {/* Dark Mode Mountain Background */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: "url('/images/carenest_login_bg_dark.jpg')",
            backgroundPosition: 'left 35% center',
          }}
        />

        {/* 2. Delicate Cinematic Gradient Overlay for Depth & Contrast */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-[#071827]/40 via-[#071827]/30 to-[#071827]/65'
              : 'bg-gradient-to-b from-sky-950/15 via-transparent to-sky-950/20'
          }`}
        />

        {/* Soft Ambient Horizon Glows */}
        <div className="absolute -top-32 left-1/3 w-[36rem] h-[36rem] rounded-full bg-[#0866FF]/15 dark:bg-[#0866FF]/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[32rem] h-[32rem] rounded-full bg-[#00C6D7]/20 dark:bg-[#00C6D7]/15 blur-[120px] pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 20. TOP-RIGHT THEME TOGGLE (PILL SWITCH EXACTLY LIKE REFERENCE)           */}
      {/* ========================================================================= */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-50">
        <div
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`relative flex items-center p-1 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-xl border shadow-lg ${
            isDark
              ? 'bg-[#0f243d]/80 border-cyan-500/30 shadow-cyan-950/30'
              : 'bg-white/80 border-white/90 shadow-slate-300/40'
          }`}
          style={{ width: '74px', height: '36px' }}
          role="button"
          aria-label="Toggle Light/Dark Theme"
        >
          {/* Active Thumb Indicator */}
          <div
            className={`absolute top-1 bottom-1 w-7 rounded-full transition-transform duration-300 ease-out flex items-center justify-center shadow-md ${
              isDark
                ? 'translate-x-9 bg-[#002b4d] text-cyan-300'
                : 'translate-x-0 bg-white text-amber-500'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4 fill-cyan-400" /> : <Sun className="w-4 h-4" />}
          </div>

          {/* Background Icons */}
          <div className="w-full flex items-center justify-between px-2 text-xs font-bold pointer-events-none">
            <span className={`transition-opacity duration-300 ${!isDark ? 'opacity-0' : 'text-slate-400'}`}>
              <Sun className="w-3.5 h-3.5" />
            </span>
            <span className={`transition-opacity duration-300 ${isDark ? 'opacity-0' : 'text-slate-400'}`}>
              <Moon className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: THREE-ZONE BALANCED LAYOUT                                */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex-1 flex flex-col justify-between">
        
        {/* UPPER ROW: LEFT BRANDING + CENTER LOGIN CARD + RIGHT FEATURES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center flex-1 my-auto">

          {/* --------------------------------------------------------------------- */}
          {/* 3. LEFT-SIDE CARENEST BRANDING                                        */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 flex flex-col justify-between self-stretch py-4 lg:py-6 order-1">
            {/* Logo & Tagline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                {/* Heartbeat / Medical Heart Icon */}
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] p-[1.5px] shadow-xl shadow-cyan-500/25 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      <path d="M3.22 12H7l2.5-4 3 8 2.5-4h4.78" strokeWidth="2.2" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-[#102033]'
                  }`}>
                    CareNest
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight pt-1 ${
                isDark ? 'text-white/95' : 'text-[#102033]'
              }`}>
                Your Health, Our Priority
              </h2>

              {/* Sub-tagline */}
              <p className={`text-xs sm:text-sm font-medium tracking-wide ${
                isDark ? 'text-white/75' : 'text-slate-600'
              }`}>
                Smarter Care &nbsp;•&nbsp; Better Decisions &nbsp;•&nbsp; Healthier Tomorrow
              </p>
            </div>

            {/* SPACER for the Traveler Mountain Scene visible naturally underneath */}
            <div className="hidden lg:block flex-1 min-h-[160px]" />

            {/* 5. BOTTOM-LEFT QUOTE (on the mountain rock) */}
            <div className="pt-6 lg:pt-0">
              <blockquote className="font-serif italic text-lg sm:text-xl lg:text-2xl leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] max-w-sm">
                &ldquo;Good health<br />
                is the foundation<br />
                of a brighter future.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* 6. CENTRAL LOGIN CARD — THE PRIMARY FLOATING BUBBLE                   */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex justify-center order-2 my-3 lg:my-0">
            <div
              className={`w-full max-w-[490px] rounded-[32px] sm:rounded-[36px] p-5 sm:p-7 md:p-8 max-h-[86vh] overflow-y-auto pr-2 scrollbar-thin transition-all duration-500 shadow-2xl relative backdrop-blur-2xl ${
                isDark
                  ? 'bg-[#0a1e38]/50 border border-cyan-400/25 shadow-black/60 text-white'
                  : 'bg-white/50 border border-white/80 shadow-slate-900/15 text-[#102033]'
              }`}
              style={{
                boxShadow: isDark
                  ? '0 30px 60px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 198, 215, 0.2) inset'
                  : '0 30px 60px -12px rgba(10, 40, 90, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.7) inset',
              }}
            >
              {/* Specular Top-Edge Reflection Glow */}
              <div
                className={`absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 blur-xl pointer-events-none rounded-full ${
                  isDark ? 'bg-cyan-400/35' : 'bg-white/70'
                }`}
              />

              {/* 7. Card Header */}
              <div className="text-center space-y-1 pb-1">
                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#102033]'
                }`}>
                  {isLoginMode ? 'Welcome Back' : 'Welcome to CareNest'}
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDark ? 'text-cyan-100/80' : 'text-slate-600'
                }`}>
                  {isLoginMode
                    ? 'Sign in to continue your healthcare journey'
                    : '“Your health journey starts here.”'}
                </p>
                {!isLoginMode && (
                  <p className={`text-[11px] leading-snug pt-0.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    Find the right care. Take the right next step safely with verified Indian healthcare providers.
                  </p>
                )}
              </div>

              {/* Returning User Quick Indicator */}
              {returningUser && (
                <div className={`mt-3 p-2 px-3 rounded-full flex items-center justify-between text-xs ${
                  isDark ? 'bg-white/10 text-cyan-200 border border-white/10' : 'bg-white/70 text-slate-700 border border-white/80'
                }`}>
                  <span className="truncate font-semibold text-[11px]">
                    Hi, {returningUser.fullName || 'Member'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFullName('');
                      setPhone('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-[10px] text-cyan-400 hover:underline shrink-0 font-bold ml-1.5"
                  >
                    Not you?
                  </button>
                </div>
              )}

              {/* 8. Bubble / Pill Input Fields */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                
                {/* ------------------------------------------------------------- */}
                {/* IF LOGIN MODE: COMPACT LOGIN VIEW                             */}
                {/* ------------------------------------------------------------- */}
                {isLoginMode ? (
                  <>
                    {/* Primary Identifier: Phone or Email */}
                    <div className="space-y-1">
                      <div
                        className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                          isDark
                            ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                            : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        <Phone className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                        <div className="flex-1 flex flex-col justify-center text-left">
                          <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                            isDark ? 'text-cyan-200/90' : 'text-slate-500'
                          }`}>
                            Phone Number or Email *
                          </span>
                          <input
                            type="text"
                            value={phone || email}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.includes('@')) {
                                setEmail(val);
                              } else {
                                setPhone(val);
                              }
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            placeholder="e.g. +91 98401 23456 or name@domain.com"
                            className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                              isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                          <AlertCircle className="w-2.5 h-2.5 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ----------------------------------------------------------- */}
                    {/* SECTION 1: PERSONAL & CONTACT INFORMATION                   */}
                    {/* ----------------------------------------------------------- */}
                    <div className="pt-1">
                      <div className="flex items-center space-x-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-500 dark:text-cyan-300">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>1. Personal & Contact Information</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <User className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Full Name *
                              </span>
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => {
                                  setFullName(e.target.value);
                                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                                }}
                                placeholder="e.g. Vishal Kirthik"
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                }`}
                              />
                            </div>
                          </div>
                          {errors.fullName && (
                            <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Mail className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Email Address *
                              </span>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                                }}
                                placeholder="vishal@carepath.in"
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                }`}
                              />
                            </div>
                          </div>
                          {errors.email && (
                            <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone Number (India) +91 */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Phone className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Phone Number (India) *
                              </span>
                              <div className="flex items-center pt-0.5">
                                <span className={`text-xs font-bold mr-1.5 ${isDark ? 'text-cyan-300' : 'text-slate-700'}`}>
                                  +91
                                </span>
                                <input
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                                  }}
                                  placeholder="98401 23456"
                                  className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight ${
                                    isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                          {errors.phone && (
                            <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        {/* Current City / Region */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <MapPin className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Current City / Region *
                              </span>
                              <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 cursor-pointer ${
                                  isDark ? 'text-white bg-[#102640]' : 'text-[#102033] bg-white'
                                }`}
                              >
                                <option value="Chennai">Chennai</option>
                                <option value="Bengaluru">Bengaluru</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Delhi NCR">Delhi NCR</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Kolkata">Kolkata</option>
                                <option value="Pune">Pune</option>
                                <option value="Ahmedabad">Ahmedabad</option>
                                <option value="Coimbatore">Coimbatore</option>
                                <option value="Kochi">Kochi</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ----------------------------------------------------------- */}
                    {/* SECTION 2: DEMOGRAPHICS & AGE                               */}
                    {/* ----------------------------------------------------------- */}
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-500 dark:text-cyan-300">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>2. Demographics & Age</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Date of Birth */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Calendar className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Date of Birth
                              </span>
                              <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white' : 'text-[#102033]'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Gender Pill Buttons */}
                        <div className="space-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider pl-2 block ${
                            isDark ? 'text-cyan-200/90' : 'text-slate-500'
                          }`}>
                            Gender
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {['Male', 'Female', 'Other', 'Prefer not to say'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setGender(opt)}
                                className={`py-2 px-2 rounded-full text-xs font-semibold transition-all duration-200 border text-center ${
                                  gender === opt
                                    ? 'bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white border-transparent shadow-sm'
                                    : isDark
                                    ? 'bg-[#102640]/50 border-white/10 text-slate-300 hover:border-cyan-400/40'
                                    : 'bg-white/70 border-white/90 text-slate-700 hover:bg-white'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ----------------------------------------------------------- */}
                    {/* SECTION 3: EMERGENCY CONTACT                                */}
                    {/* ----------------------------------------------------------- */}
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-500 dark:text-cyan-300">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>3. Emergency Contact</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Emergency Contact Name */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <User className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Emergency Contact Name
                              </span>
                              <input
                                type="text"
                                value={emergencyContactName}
                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                placeholder="Enter emergency contact name"
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Relationship to Emergency Contact */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Heart className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Relationship to Emergency Contact
                              </span>
                              <select
                                value={emergencyContactRelationship}
                                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 cursor-pointer ${
                                  isDark ? 'text-white bg-[#102640]' : 'text-[#102033] bg-white'
                                }`}
                              >
                                {[
                                  'Parent',
                                  'Mother',
                                  'Father',
                                  'Spouse',
                                  'Partner',
                                  'Sibling',
                                  'Brother',
                                  'Sister',
                                  'Child',
                                  'Son',
                                  'Daughter',
                                  'Guardian',
                                  'Friend',
                                  'Other',
                                ].map((rel) => (
                                  <option key={rel} value={rel}>{rel}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact Phone Number (+91) */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Phone className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Emergency Contact Phone Number
                              </span>
                              <div className="flex items-center pt-0.5">
                                <span className={`text-xs font-bold mr-1.5 ${isDark ? 'text-cyan-300' : 'text-slate-700'}`}>
                                  +91
                                </span>
                                <input
                                  type="tel"
                                  value={emergencyContactPhone}
                                  onChange={(e) => {
                                    setEmergencyContactPhone(e.target.value);
                                    if (errors.emergencyContactPhone) setErrors((prev) => ({ ...prev, emergencyContactPhone: '' }));
                                  }}
                                  placeholder="98765 43210"
                                  className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight ${
                                    isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                          {errors.emergencyContactPhone && (
                            <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              {errors.emergencyContactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ----------------------------------------------------------- */}
                    {/* SECTION 4: HEALTH INFORMATION                               */}
                    {/* ----------------------------------------------------------- */}
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-500 dark:text-cyan-300">
                        <HeartPulse className="w-3.5 h-3.5 shrink-0" />
                        <span>4. Health Information</span>
                      </div>

                      <div className="space-y-2.5">
                        {/* Blood Group */}
                        <div className="space-y-1">
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Droplets className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Blood Group
                              </span>
                              <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 cursor-pointer ${
                                  isDark ? 'text-white bg-[#102640]' : 'text-[#102033] bg-white'
                                }`}
                              >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown / Not sure'].map((bg) => (
                                  <option key={bg} value={bg}>{bg}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Optional Height & Weight (Side by Side) */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Height */}
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Ruler className={`w-4 h-4 shrink-0 mr-2.5 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Height (cm)
                              </span>
                              <input
                                type="text"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="e.g. 175"
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Weight */}
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <Scale className={`w-4 h-4 shrink-0 mr-2.5 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <div className="flex-1 flex flex-col justify-center text-left">
                              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                                isDark ? 'text-cyan-200/90' : 'text-slate-500'
                              }`}>
                                Weight (kg)
                              </span>
                              <input
                                type="text"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g. 68"
                                className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                                  isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Current Health Conditions / Issues (Chips UX) */}
                        <div className="space-y-1.5 pt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider pl-2 block ${
                            isDark ? 'text-cyan-200/90' : 'text-slate-500'
                          }`}>
                            Current Health Conditions / Health Issues
                          </span>
                          
                          {/* Search / Enter condition input */}
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500'
                            }`}
                          >
                            <input
                              type="text"
                              value={conditionInput}
                              onChange={(e) => setConditionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addHealthCondition(conditionInput);
                                }
                              }}
                              placeholder="Search or enter health condition..."
                              className={`w-full bg-transparent border-0 p-0 text-xs font-medium focus:outline-none focus:ring-0 ${
                                isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => addHealthCondition(conditionInput)}
                              className="p-1 rounded-full text-cyan-500 hover:bg-cyan-500/10 ml-1 shrink-0"
                              title="Add condition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Selected Condition Chips */}
                          {healthConditions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {healthConditions.map((cond) => (
                                <span
                                  key={cond}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30"
                                >
                                  <span>{cond}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeHealthCondition(cond)}
                                    className="hover:text-rose-500 ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick shortcuts for Conditions */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => addHealthCondition('None')}
                              className={`px-2 py-0.5 rounded-full border transition ${
                                healthConditions.includes('None')
                                  ? 'bg-cyan-500 text-white border-transparent'
                                  : 'bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                              }`}
                            >
                              None
                            </button>
                            <button
                              type="button"
                              onClick={() => addHealthCondition('Prefer not to say')}
                              className={`px-2 py-0.5 rounded-full border transition ${
                                healthConditions.includes('Prefer not to say')
                                  ? 'bg-cyan-500 text-white border-transparent'
                                  : 'bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                              }`}
                            >
                              Prefer not to say
                            </button>
                            {['Diabetes', 'Hypertension', 'Asthma'].map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => addHealthCondition(item)}
                                className="px-2 py-0.5 rounded-full border bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10 transition"
                              >
                                + {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Allergies (Chips UX) */}
                        <div className="space-y-1.5 pt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider pl-2 block ${
                            isDark ? 'text-cyan-200/90' : 'text-slate-500'
                          }`}>
                            Allergies
                          </span>
                          
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500'
                            }`}
                          >
                            <input
                              type="text"
                              value={allergyInput}
                              onChange={(e) => setAllergyInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addAllergy(allergyInput);
                                }
                              }}
                              placeholder="e.g. Penicillin, Peanuts, Pollen..."
                              className={`w-full bg-transparent border-0 p-0 text-xs font-medium focus:outline-none focus:ring-0 ${
                                isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => addAllergy(allergyInput)}
                              className="p-1 rounded-full text-cyan-500 hover:bg-cyan-500/10 ml-1 shrink-0"
                              title="Add allergy"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {allergies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {allergies.map((all) => (
                                <span
                                  key={all}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/30"
                                >
                                  <span>{all}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAllergy(all)}
                                    className="hover:text-rose-500 ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => addAllergy('No known allergies')}
                              className={`px-2 py-0.5 rounded-full border transition ${
                                allergies.includes('No known allergies')
                                  ? 'bg-amber-500 text-white border-transparent'
                                  : 'bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                              }`}
                            >
                              No known allergies
                            </button>
                          </div>
                        </div>

                        {/* Current Medications (Chips UX) */}
                        <div className="space-y-1.5 pt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider pl-2 block ${
                            isDark ? 'text-cyan-200/90' : 'text-slate-500'
                          }`}>
                            Current Medications
                          </span>
                          
                          <div
                            className={`relative rounded-full flex items-center px-4 py-2 transition-all duration-200 border shadow-xs ${
                              isDark
                                ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400'
                                : 'bg-white/85 border-white/95 focus-within:border-cyan-500'
                            }`}
                          >
                            <Pill className={`w-3.5 h-3.5 shrink-0 mr-2.5 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                            <input
                              type="text"
                              value={medicationInput}
                              onChange={(e) => setMedicationInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addMedication(medicationInput);
                                }
                              }}
                              placeholder="e.g. Metformin 500mg, Atorvastatin..."
                              className={`w-full bg-transparent border-0 p-0 text-xs font-medium focus:outline-none focus:ring-0 ${
                                isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => addMedication(medicationInput)}
                              className="p-1 rounded-full text-cyan-500 hover:bg-cyan-500/10 ml-1 shrink-0"
                              title="Add medication"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {currentMedications.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {currentMedications.map((med) => (
                                <span
                                  key={med}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30"
                                >
                                  <span>{med}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeMedication(med)}
                                    className="hover:text-rose-500 ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => addMedication('No current medications')}
                              className={`px-2 py-0.5 rounded-full border transition ${
                                currentMedications.includes('No current medications')
                                  ? 'bg-emerald-500 text-white border-transparent'
                                  : 'bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                              }`}
                            >
                              No current medications
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ------------------------------------------------------------- */}
                {/* PASSWORD FIELD (Common to both modes)                         */}
                {/* ------------------------------------------------------------- */}
                <div className="space-y-1 pt-1">
                  <div
                    className={`relative rounded-full flex items-center px-4 py-2.5 transition-all duration-200 border shadow-xs ${
                      isDark
                        ? 'bg-[#102640]/70 border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20'
                        : 'bg-white/85 border-white/95 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <Lock className={`w-4 h-4 shrink-0 mr-3 ${isDark ? 'text-cyan-300/80' : 'text-slate-400'}`} />
                    <div className="flex-1 flex flex-col justify-center text-left">
                      <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                        isDark ? 'text-cyan-200/90' : 'text-slate-500'
                      }`}>
                        Password *
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        placeholder={isLoginMode ? 'Enter your password' : 'Create a password'}
                        className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 leading-tight pt-0.5 ${
                          isDark ? 'text-white placeholder:text-slate-500' : 'text-[#102033] placeholder:text-slate-400'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
                        isDark ? 'text-cyan-300/80' : 'text-slate-400'
                      }`}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-rose-400 pl-4 font-semibold flex items-center">
                      <AlertCircle className="w-2.5 h-2.5 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 10. Get Started / Login Action Button (Blue -> Cyan Gradient) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group relative py-3.5 px-6 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00C6D7] hover:from-[#0055e6] hover:to-[#00b5c4] text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/35 hover:shadow-cyan-400/50 active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>{isLoginMode ? 'Signing In...' : 'Getting Started...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isLoginMode ? 'Sign In' : 'Get Started'}</span>
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>

                {/* 11. Mode Toggle Link */}
                <div className="text-center pt-2">
                  <p className={`text-xs ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
                    {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(!isLoginMode)}
                      className="text-[#0084FF] dark:text-[#00C6D7] font-bold hover:underline cursor-pointer ml-1"
                    >
                      {isLoginMode ? 'Get Started' : 'Login'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* 12 & 14. RIGHT-SIDE DECORATION + 4 FLOATING FEATURE BUBBLES           */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-4 order-3 pl-0 lg:pl-2">
            
            {/* 14. Handwritten-Style Decorative Message */}
            <div className="text-right lg:text-right pr-2 space-y-0.5">
              <div className="relative inline-block">
                {/* Tiny Sparkle Stars */}
                <span className="absolute -top-2 -right-3 text-cyan-300 animate-pulse text-xs">✦</span>
                <span className="absolute top-4 -left-3 text-cyan-200 animate-pulse text-[10px]" style={{ animationDelay: '1s' }}>✧</span>
                <span className="absolute bottom-2 -right-4 text-cyan-300 animate-pulse text-[9px]" style={{ animationDelay: '2s' }}>✦</span>

                <h3
                  aria-label="Your Health Matters"
                  className={`font-serif italic text-2xl sm:text-3xl leading-tight font-normal select-none ${
                    isDark ? 'text-white/95' : 'text-[#102033]'
                  }`}
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: isDark ? '0 2px 10px rgba(0, 198, 215, 0.4)' : '0 1px 4px rgba(255,255,255,0.8)',
                  }}
                >
                  <span className="sr-only">Your Health Matters</span>
                  Your<br />
                  Health<br />
                  Matters
                </h3>

                {/* Hand-Drawn Curved Line / Underline Accent */}
                <svg
                  className="w-24 h-3.5 text-cyan-400 mt-1 ml-auto opacity-85"
                  viewBox="0 0 100 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C18 2 30 10 48 5C66 0 78 10 98 4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 12 & 13. FOUR FLOATING GLASS FEATURE BUBBLES */}
            <div className="space-y-2.5 pt-2">
              
              {/* Feature 1: Find best hospitals */}
              <div
                className={`group p-2.5 px-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center space-x-3 shadow-md hover:translate-x-1 ${
                  isDark
                    ? 'bg-[#0e233c]/55 border-white/10 hover:border-cyan-400/40 text-white'
                    : 'bg-white/40 border-white/70 hover:border-white text-[#102033]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isDark ? 'bg-[#0c2a4b] text-cyan-300' : 'bg-white/85 text-[#0066FF]'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold leading-tight">
                  <div>Find the best hospitals</div>
                  <div className={isDark ? 'text-cyan-200/70' : 'text-slate-600'}>near you</div>
                </div>
              </div>

              {/* Feature 2: Get instant AI health assistance */}
              <div
                className={`group p-2.5 px-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center space-x-3 shadow-md hover:translate-x-1 ${
                  isDark
                    ? 'bg-[#0e233c]/55 border-white/10 hover:border-cyan-400/40 text-white'
                    : 'bg-white/40 border-white/70 hover:border-white text-[#102033]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isDark ? 'bg-[#0c2a4b] text-cyan-300' : 'bg-white/85 text-[#0066FF]'
                  }`}
                >
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold leading-tight">
                  <div>Get instant AI health</div>
                  <div className={isDark ? 'text-cyan-200/70' : 'text-slate-600'}>assistance</div>
                </div>
              </div>

              {/* Feature 3: Track your health journey */}
              <div
                className={`group p-2.5 px-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center space-x-3 shadow-md hover:translate-x-1 ${
                  isDark
                    ? 'bg-[#0e233c]/55 border-white/10 hover:border-cyan-400/40 text-white'
                    : 'bg-white/40 border-white/70 hover:border-white text-[#102033]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isDark ? 'bg-[#0c2a4b] text-cyan-300' : 'bg-white/85 text-[#0066FF]'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold leading-tight">
                  Track your health journey
                </div>
              </div>

              {/* Feature 4: Secure your medical records */}
              <div
                className={`group p-2.5 px-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center space-x-3 shadow-md hover:translate-x-1 ${
                  isDark
                    ? 'bg-[#0e233c]/55 border-white/10 hover:border-cyan-400/40 text-white'
                    : 'bg-white/40 border-white/70 hover:border-white text-[#102033]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isDark ? 'bg-[#0c2a4b] text-cyan-300' : 'bg-white/85 text-[#0066FF]'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold leading-tight">
                  <div>Secure your medical</div>
                  <div className={isDark ? 'text-cyan-200/70' : 'text-slate-600'}>records</div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM CORNER CYAN LEAF / WATERMARK ACCENT (EXACTLY AS IN REFERENCE) */}
        <div className="flex items-center justify-end pt-2 pb-1 pr-1 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-cyan-400/20 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-400/20">
            <svg className="w-4 h-4 text-cyan-400 transform rotate-45" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-2.48 0-4.5-2.02-4.5-4.5 0-1.75 1.01-3.26 2.47-3.99l.03.49c0 2.21 1.79 4 4 4h.49c-.73 1.46-2.24 2.47-3.99 2.47z" />
            </svg>
          </div>
        </div>

      </div>

    </div>
  );
}
