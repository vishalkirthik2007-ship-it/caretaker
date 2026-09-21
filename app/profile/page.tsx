'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Camera,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Heart,
  Droplets,
  Ruler,
  Scale,
  Users,
  Pill,
  Plus,
  X,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { UserProfile } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Personal Information State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Chennai, Tamil Nadu');

  // 2. Emergency Contact State
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('Parent');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // 3. Health Information State
  const [bloodGroup, setBloodGroup] = useState('Unknown / Not sure');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  // UI States
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

    // Emergency Contact
    setEmergencyContactName(user.emergencyContactName || '');
    setEmergencyContactRelationship(user.emergencyContactRelationship || 'Parent');
    setEmergencyContactPhone(user.emergencyContactPhone || '');

    // Health Info
    setBloodGroup(user.bloodGroup || 'Unknown / Not sure');
    setHeight(user.height || '');
    setWeight(user.weight || '');

    if (user.healthConditions) {
      setHealthConditions(
        user.healthConditions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else {
      setHealthConditions([]);
    }

    if (user.allergies && Array.isArray(user.allergies)) {
      setAllergies(user.allergies);
    } else {
      setAllergies([]);
    }

    if (user.currentMedications && Array.isArray(user.currentMedications)) {
      setCurrentMedications(user.currentMedications);
    } else {
      setCurrentMedications([]);
    }

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
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactRelationship: emergencyContactRelationship.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      bloodGroup: bloodGroup !== 'Unknown / Not sure' ? bloodGroup : undefined,
      height: height.trim() || undefined,
      weight: weight.trim() || undefined,
      healthConditions: healthConditions.length > 0 ? healthConditions.join(', ') : undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      currentMedications: currentMedications.length > 0 ? currentMedications : undefined,
      photoUrl: photoUrl || undefined,
    };

    repository.saveCurrentUser(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const calculateFormattedDOB = (dobStr: string) => {
    if (!dobStr) return 'Not provided';
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-in fade-in duration-300">
      {/* 1. TOP HEADER */}
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
          Manage your personal, emergency contact, and healthcare information
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Profile details updated successfully!</span>
        </div>
      )}

      {/* 2. PROFILE PHOTO SECTION */}
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

      {/* ------------------------------------------------------------- */}
      {/* 3. SECTION 1: PERSONAL INFORMATION                           */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/10 pb-2.5">
          <User className="w-4 h-4 text-[#0066FF] dark:text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Personal Information
          </h2>
        </div>

        {/* Row 1: Full Name */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Full Name
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
                {fullName || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Email Address
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
                {email || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Primary Phone */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Primary Phone Number
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
                {phone || 'Not provided'}
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
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {gender || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 6: City / Region */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              City / Region
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
                {city || 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION 2: EMERGENCY CONTACT                              */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/10 pb-2.5">
          <Users className="w-4 h-4 text-[#0066FF] dark:text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Emergency Contact
          </h2>
        </div>

        {/* Row 1: Emergency Contact Name */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Emergency Contact Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Enter emergency contact name"
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {emergencyContactName || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Relationship */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Relationship
            </span>
            {isEditing ? (
              <select
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
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
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {emergencyContactRelationship || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Emergency Contact Phone (+91) */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Emergency Contact Phone
            </span>
            {isEditing ? (
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {emergencyContactPhone || 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECTION 3: HEALTH INFORMATION                             */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-white/85 dark:bg-[#10283B]/85 border border-slate-200/80 dark:border-white/10 p-5 shadow-lg backdrop-blur-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/10 pb-2.5">
          <HeartPulse className="w-4 h-4 text-[#0066FF] dark:text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Health Information
          </h2>
        </div>

        {/* Row 1: Blood Group */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Droplets className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Blood Group
            </span>
            {isEditing ? (
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown / Not sure'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {bloodGroup || 'Not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Height & Weight */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Height & Weight
            </span>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Height (cm)</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Weight (kg)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 68"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {height ? `${height} cm` : 'Height not provided'}&nbsp;&nbsp;•&nbsp;&nbsp;{weight ? `${weight} kg` : 'Weight not provided'}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Current Health Conditions */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <HeartPulse className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Current Health Conditions / Health Issues
            </span>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-1.5">
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
                    placeholder="Add condition (e.g. Diabetes)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                  />
                  <button
                    type="button"
                    onClick={() => addHealthCondition(conditionInput)}
                    className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20"
                    title="Add"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {healthConditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {healthConditions.map((cond) => (
                      <span
                        key={cond}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30"
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
              </div>
            ) : (
              <div className="mt-1">
                {healthConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {healthConditions.map((cond) => (
                      <span
                        key={cond}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">None reported</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Allergies */}
        <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Allergies
            </span>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-1.5">
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
                    placeholder="Add allergy (e.g. Penicillin)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                  />
                  <button
                    type="button"
                    onClick={() => addAllergy(allergyInput)}
                    className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    title="Add"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {allergies.map((all) => (
                      <span
                        key={all}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30"
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
              </div>
            ) : (
              <div className="mt-1">
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((all) => (
                      <span
                        key={all}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30"
                      >
                        {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No known allergies</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Current Medications */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            <Pill className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Current Medications
            </span>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-1.5">
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
                    placeholder="Add medication (e.g. Metformin)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
                  />
                  <button
                    type="button"
                    onClick={() => addMedication(medicationInput)}
                    className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    title="Add"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {currentMedications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentMedications.map((med) => (
                      <span
                        key={med}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30"
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
              </div>
            ) : (
              <div className="mt-1">
                {currentMedications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentMedications.map((med) => (
                      <span
                        key={med}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No current medications</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MAIN ACTION BUTTONS                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2">
        {isEditing ? (
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-full font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              className="flex-1 py-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/25 hover:from-[#0052cc] hover:to-[#00acc1] transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-lg shadow-blue-500/25 hover:from-[#0052cc] hover:to-[#00acc1] transition active:scale-98 cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
