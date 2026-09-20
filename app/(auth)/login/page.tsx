'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const INDIAN_CITIES = [
  'Chennai',
  'Bengaluru',
  'New Delhi',
  'Mumbai',
  'Hyderabad',
  'Kolkata',
  'Pune',
  'Chandigarh',
  'Vellore',
  'Ahmedabad',
  'Jaipur',
  'Coimbatore',
  'Kochi',
  'Other / Regional India',
];

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Chennai');
  const [healthConditions, setHealthConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // UI & Validation State
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [returningProfiles, setReturningProfiles] = useState<UserProfile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for remembered user profiles
    const remembered = repository.getRememberedProfiles();
    const active = repository.getCurrentUser();

    if (active) {
      populateFormWithUser(active);
      setIsReturningUser(true);
      setReturningProfiles(remembered.length > 0 ? remembered : [active]);
    } else if (remembered && remembered.length > 0) {
      setReturningProfiles(remembered);
      populateFormWithUser(remembered[0]);
      setIsReturningUser(true);
    }
  }, []);

  const populateFormWithUser = (u: UserProfile) => {
    setFullName(u.fullName || '');
    setPhone(u.phoneNumber || '');
    setEmail(u.email || '');
    setDateOfBirth(u.dateOfBirth || '');
    if (u.gender) setGender(u.gender);
    if (u.city) setCity(u.city);
    setHealthConditions(u.healthConditions || '');
    setEmergencyContactName(u.emergencyContactName || '');
    setEmergencyContactPhone(u.emergencyContactPhone || '');
  };

  const handleClearForNewUser = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setDateOfBirth('');
    setGender('Male');
    setCity('Chennai');
    setHealthConditions('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setIsReturningUser(false);
    setErrors({});
  };

  const handleQuickLogin = (userToLogin: UserProfile) => {
    setIsSubmitting(true);
    repository.saveCurrentUser(userToLogin);
    setTimeout(() => {
      router.replace('/dashboard');
    }, 350);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (minimum 2 characters).';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Mobile phone number is required for healthcare alerts.';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (+91).';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!city.trim()) {
      newErrors.city = 'Please select your current city / region.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Calculate approximate age if dateOfBirth provided
    let calculatedAge: number | undefined;
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        calculatedAge = Math.max(1, new Date().getFullYear() - birthYear);
      }
    }

    const updatedProfile: UserProfile = {
      id: `usr-${email.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'patient-001'}`,
      email: email.trim(),
      fullName: fullName.trim(),
      phoneNumber: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      age: calculatedAge,
      gender,
      city,
      healthConditions: healthConditions.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      preferredLanguage: 'en',
      theme: 'light',
      easyModeEnabled: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      preferences: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'default',
        locationEnabled: true,
        lastKnownLatitude:
          city === 'Chennai'
            ? 13.0827
            : city === 'Bengaluru'
            ? 12.9716
            : city === 'Mumbai'
            ? 19.076
            : 28.6139,
        lastKnownLongitude:
          city === 'Chennai'
            ? 80.2707
            : city === 'Bengaluru'
            ? 77.5946
            : city === 'Mumbai'
            ? 72.8777
            : 77.209,
        shareAnonymousAnalytics: true,
      },
    };

    repository.saveCurrentUser(updatedProfile);

    setTimeout(() => {
      setIsSubmitting(false);
      router.replace('/dashboard');
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Dynamic Animated Indian Healthcare Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-50/80 via-slate-50 to-emerald-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/40" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 dark:from-teal-600 dark:to-emerald-500 text-white shadow-lg shadow-teal-700/20">
              <Compass className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              CarePath<span className="text-teal-700 dark:text-teal-400">AI</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Healthcare Login & Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Find the right care. Complete your verified healthcare identity below to access personalized navigation.
          </p>

          <div className="flex items-center justify-center space-x-2 pt-1">
            <Badge variant="outline" className="text-[11px] bg-white/70 dark:bg-slate-800/80">
              🇮🇳 Dedicated for India
            </Badge>
            <Badge variant="success" className="text-[11px]">
              🔒 Encrypted & Private
            </Badge>
          </div>
        </div>

        {/* Returning User Notification Banner */}
        {isReturningUser && returningProfiles.length > 0 && (
          <div className="p-4 bg-teal-50/90 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {fullName ? fullName.slice(0, 2).toUpperCase() : 'CP'}
              </div>
              <div className="text-xs">
                <span className="font-bold text-teal-950 dark:text-teal-100 text-sm block">
                  Welcome back, {fullName || 'Patient'}!
                </span>
                <span className="text-teal-800 dark:text-teal-300 text-[11px]">
                  Saved profile detected for {city}, India.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearForNewUser}
                className="text-xs py-1 px-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                New User
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin(returningProfiles[0])}
                className="text-xs py-1 px-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold"
              >
                Continue to App →
              </Button>
            </div>
          </div>
        )}

        {/* Main Onboarding / Login Form Card */}
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl rounded-3xl space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Section 1: Basic Identity */}
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <UserCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  1. Personal & Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vishal K."
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border ${
                        errors.fullName
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-slate-300 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vishal@carepath.in"
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-slate-300 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (India) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98401 23456"
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-slate-300 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Current City / Region <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Demographics */}
            <div className="pt-2">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  2. Demographics & Age
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition ${
                          gender === g
                            ? 'border-teal-700 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Healthcare Information */}
            <div className="pt-2">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <HeartPulse className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  3. Health Context & Emergency
                </h3>
              </div>

              <div className="p-4 rounded-2xl border border-teal-100 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 space-y-2 mt-4">
                <div className="flex items-center space-x-2 text-teal-900 dark:text-teal-200">
                  <span className="text-xs font-bold">
                    Relevant Health Information & Medical Conditions
                  </span>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-full font-bold ml-auto">
                    Encrypted Local Storage
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Helps CarePath AI tailor hospital triage and consultation notes (e.g., allergies, asthma, diabetes). Never shared publicly.
                </p>
                <textarea
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Penicillin allergy, Hypertension, Asthma (Optional)"
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Dr. S. Kirthik (Family Physician)"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. +91 98409 87654"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Check */}
            <div className="flex items-start space-x-2 pt-2 text-slate-600 dark:text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>
                By continuing, you agree to access CarePath AI's educational navigation system. Your data is isolated to your private account.
              </span>
            </div>

            {/* Continue / Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-sm font-bold rounded-2xl shadow-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center space-x-2 transition-transform active:scale-[0.99]"
            >
              <span>{isSubmitting ? 'Securing Healthcare Profile...' : 'Continue to Main Application'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
