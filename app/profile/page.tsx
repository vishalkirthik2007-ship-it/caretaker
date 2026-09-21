'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Camera,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Save,
  ArrowLeft,
  Sparkles,
  Lock,
  Trash2,
  Activity,
  Heart,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Chennai');
  const [healthConditions, setHealthConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setProfile(user);
    setFullName(user.fullName || '');
    setPhone(user.phoneNumber || '');
    setEmail(user.email || '');
    setDateOfBirth(user.dateOfBirth || '');
    if (user.gender) setGender(user.gender);
    if (user.city) setCity(user.city);
    setHealthConditions(user.healthConditions || '');
    setEmergencyContactName(user.emergencyContactName || '');
    setEmergencyContactPhone(user.emergencyContactPhone || '');
    setPhotoUrl(user.photoUrl || null);
  }, [router]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('Profile photo must be less than 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
      repository.updateProfilePhoto(dataUrl);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    repository.updateProfilePhoto('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let calculatedAge = profile.age;
    if (dateOfBirth) {
      const birthYear = new Date(dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        calculatedAge = Math.max(1, new Date().getFullYear() - birthYear);
      }
    }

    const updated: UserProfile = {
      ...profile,
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phone.trim(),
      dateOfBirth: dateOfBirth || undefined,
      age: calculatedAge,
      gender,
      city,
      healthConditions: healthConditions.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      photoUrl: photoUrl || undefined,
    };

    repository.saveCurrentUser(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleLogout = () => {
    repository.logout();
    router.replace('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-carenest-primary flex items-center transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-carenest-primary font-bold">CareNest Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            My Healthcare Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal healthcare identity, emergency contacts, and encrypted profile photo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="text-xs rounded-xl shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">Profile updates and encrypted records synchronized successfully!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="p-6 sm:p-8 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-xl rounded-3xl space-y-8">
        {/* Profile Picture Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#071827] flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-carenest-primary font-black text-2xl sm:text-3xl">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : 'CN'}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Upload new profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {fullName || 'CareNest Patient'}
              </h2>
              <Badge className="bg-carenest-primary/10 text-carenest-primary dark:text-cyan-300 border-carenest-primary/20 text-[10px] font-bold">
                Verified Citizen ID
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {email} • {city || 'Tamil Nadu, India'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-carenest-primary dark:text-carenest-accent hover:underline cursor-pointer"
              >
                Change Photo
              </button>
              {photoUrl && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </>
              )}
            </div>
            {photoError && (
              <p className="text-[11px] text-rose-500 mt-1">{photoError}</p>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number (+91)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#071827]/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Sensitive Health Info with Vault Badge */}
          <div className="p-4 sm:p-5 rounded-2xl border border-carenest-primary/20 dark:border-carenest-primary/30 bg-carenest-primary/5 dark:bg-[#0866FF]/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <HeartPulse className="w-4 h-4 text-carenest-primary dark:text-carenest-accent" />
                <span className="text-xs font-bold">Health Information & Chronic Conditions</span>
              </div>
              <Badge className="bg-carenest-primary/10 text-carenest-primary dark:text-cyan-300 border-carenest-primary/20 text-[10px] font-bold flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5 mr-1" />
                <span>Encrypted Storage</span>
              </Badge>
            </div>
            <textarea
              value={healthConditions}
              onChange={(e) => setHealthConditions(e.target.value)}
              rows={2}
              placeholder="e.g., Hypertension, Type-2 Diabetes, Penicillin allergy..."
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#071827]/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-carenest-primary/30 focus:border-carenest-primary transition"
            />
          </div>

          {/* Emergency Contact */}
          <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Emergency Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Spouse, Parent, Sibling"
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071827]/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Emergency Phone Number
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071827]/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-white/10">
            <Button
              type="submit"
              className="btn-gradient-carenest flex items-center space-x-2 px-8 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
