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
  Lock,
  Heart,
  Edit3,
  X,
  Upload,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Chennai, Tamil Nadu');
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
    setFullName(user.fullName || 'Kirthik');
    setPhone(user.phoneNumber || '+91 98765 43210');
    setEmail(user.email || 'kirthik@gmail.com');
    setDateOfBirth(user.dateOfBirth || '2005-08-15');
    if (user.gender) setGender(user.gender);
    if (user.city) {
      setCity(user.city.includes('Tamil Nadu') ? user.city : `${user.city}, Tamil Nadu`);
    } else {
      setCity('Chennai, Tamil Nadu');
    }
    setHealthConditions(user.healthConditions || 'None');
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

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      city: city.replace(', Tamil Nadu', '').trim(),
      healthConditions: healthConditions.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      photoUrl: photoUrl || undefined,
    };

    repository.saveCurrentUser(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const calculateFormattedDOB = (dobStr: string) => {
    if (!dobStr) return '15 Aug 2005 (20 years)';
    try {
      const d = new Date(dobStr);
      if (isNaN(d.getTime())) return dobStr;
      const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const age = Math.max(1, new Date().getFullYear() - d.getFullYear());
      return `${formatted} (${age} years)`;
    } catch {
      return dobStr;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-in fade-in duration-300">
      {/* 1. TOP HEADER matching Reference Poster */}
      <div className="space-y-0.5">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Profile
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
          Manage your personal and health information
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Profile details saved successfully!</span>
        </div>
      )}

      {/* 2. PROFILE PHOTO SECTION matching Reference Poster */}
      <div className="flex items-center space-x-4 pt-1">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-[#10283B] shadow-md flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#0066FF] to-[#00C6D7] text-white flex items-center justify-center font-bold text-xl sm:text-2xl">
                {fullName ? fullName.slice(0, 1).toUpperCase() : 'K'}
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0066FF] dark:text-[#42D9FF] hover:underline cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="sr-only"
          />
          {photoError && <p className="text-[11px] text-rose-500 mt-1">{photoError}</p>}
        </div>
      </div>

      {/* 3. INFORMATION ROWS in Glass Card matching Reference Poster */}
      <div className="rounded-2xl bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl space-y-4">
        {/* Row 1: Name */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {fullName}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Phone Number */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Phone Number
            </span>
            {isEditing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {phone}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Email */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Email
            </span>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Date of Birth */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Date of Birth
            </span>
            {isEditing ? (
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {calculateFormattedDOB(dateOfBirth)}
              </p>
            )}
          </div>
        </div>

        {/* Row 5: Gender */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Gender
            </span>
            {isEditing ? (
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {gender}
              </p>
            )}
          </div>
        </div>

        {/* Row 6: Location */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Location
            </span>
            {isEditing ? (
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {city}
              </p>
            )}
          </div>
        </div>

        {/* Row 7: Health Conditions */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Health Conditions
            </span>
            {isEditing ? (
              <input
                type="text"
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                placeholder="None (or add if any)"
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {healthConditions || 'None (or add if any)'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN ACTION BUTTON matching Reference Poster: "Edit Profile" pill gradient button */}
      <div className="pt-2">
        {isEditing ? (
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-full font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              className="flex-1 py-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/25 hover:from-[#0052cc] hover:to-[#00acc1] transition"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/25 hover:from-[#0052cc] hover:to-[#00acc1] transition active:scale-98"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
