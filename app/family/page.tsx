'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Phone,
  Calendar,
  Check,
  ArrowLeft,
  X,
  Edit3,
  MapPin,
  HeartPulse,
  FileText,
  Bot,
  Search,
  Navigation,
  AlertTriangle,
  Heart,
  Lock,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { FamilyProfile, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Mother',
  'Father',
  'Child',
  'Son',
  'Daughter',
  'Spouse',
  'Partner',
  'Sibling',
  'Brother',
  'Sister',
  'Grandparent',
  'Grandmother',
  'Grandfather',
  'Elder',
  'Guardian',
  'Other',
];

export default function FamilyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyProfile[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyProfile | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<FamilyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Female');
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [healthcareNotes, setHealthcareNotes] = useState('');
  const [canManageNav, setCanManageNav] = useState(true);
  const [canManageDocs, setCanManageDocs] = useState(true);

  // Validation error
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
    loadFamilyMembers();
  }, [router]);

  const loadFamilyMembers = () => {
    const list = repository.getFamilyProfiles();
    setFamilyMembers(list);
  };

  const resetForm = () => {
    setFullName('');
    setRelationship('Parent');
    setPhone('');
    setDateOfBirth('');
    setGender('Female');
    setLocation('');
    setEmergencyContact('');
    setHealthcareNotes('');
    setCanManageNav(true);
    setCanManageDocs(true);
    setFormError(null);
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: FamilyProfile) => {
    setFullName(member.fullName);
    setRelationship(member.relationship);
    setPhone(member.phone || '');
    setDateOfBirth(member.dateOfBirth || '');
    setGender(member.gender || 'Female');
    setLocation(member.location || '');
    setEmergencyContact(member.emergencyContact || '');
    setHealthcareNotes(member.healthcareNotes || '');
    setCanManageNav(member.canManageNavigation);
    setCanManageDocs(member.canManageDocuments);
    setFormError(null);
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Please enter a valid full name.');
      return;
    }
    if (!relationship.trim()) {
      setFormError('Please select a relationship.');
      return;
    }

    const memberId = isEditing && selectedMember ? selectedMember.id : `fam-${Date.now()}`;
    const profile: FamilyProfile = {
      id: memberId,
      primaryUserId: currentUser?.id || 'usr-default-001',
      fullName: fullName.trim(),
      relationship,
      phone: phone.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      location: location.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      healthcareNotes: healthcareNotes.trim() || undefined,
      canManageNavigation: canManageNav,
      canManageDocuments: canManageDocs,
      vaultIsolated: canManageDocs,
      createdAt: isEditing && selectedMember ? selectedMember.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repository.saveFamilyProfile(profile);
    loadFamilyMembers();
    setIsAddModalOpen(false);
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember(profile);
    }
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (!memberToDelete) return;
    repository.deleteFamilyProfile(memberToDelete.id);
    loadFamilyMembers();
    if (selectedMember?.id === memberToDelete.id) {
      setSelectedMember(null);
    }
    setMemberToDelete(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 animate-in fade-in duration-300">
      {/* 1. TOP HEADER matching Reference Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Family Care Circle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Coordinate hospital journeys, appointments, and medical vaults for dependents, elders, and loved ones.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-md shadow-blue-500/20 transition active:scale-98 shrink-0 self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* 2. FAMILY MEMBER CARDS matching Reference Screenshot */}
      {familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="rounded-3xl bg-white/90 dark:bg-[#071827] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-xl hover:border-[#0066FF]/40 dark:hover:border-[#42D9FF]/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Relationship Pill Badge + Trash Icon */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-cyan-300 border border-blue-200/60 dark:border-blue-900/50">
                    {member.relationship}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMemberToDelete(member);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition"
                    title="Remove family member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Member Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#0066FF] dark:group-hover:text-[#42D9FF] transition">
                  {member.fullName}
                </h3>
              </div>

              {/* Bottom Section: Emergency contact + Permission indicators */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                {member.emergencyContact && (
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Emergency: {member.emergencyContact}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-0.5">
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                    {member.canManageNavigation ? 'Navigation Permitted' : 'Navigation Restricted'}
                  </span>

                  <span className="inline-flex items-center text-xs font-semibold text-[#0066FF] dark:text-[#00C6D7]">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    {member.canManageDocuments !== false ? 'Vault Isolated' : 'Shared Vault'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 3. EMPTY STATE (When no family members exist) */
        <div className="rounded-3xl bg-white/80 dark:bg-[#071827] border border-slate-200/80 dark:border-white/10 p-12 text-center space-y-4 shadow-sm backdrop-blur-xl max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-cyan-300 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Family Care
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Keep your loved ones&apos; healthcare journeys organized in one place.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-md shadow-blue-500/20 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Add Family Member</span>
          </button>
        </div>
      )}

      {/* ============================================================
          4. DETAILED MEMBER PROFILE MODAL (Clicking Card)
         ============================================================ */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#071827] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-cyan-300 border border-blue-200/60 dark:border-blue-900/50">
                  {selectedMember.relationship}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {selectedMember.fullName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Details */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-[#10283B]/60 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              {selectedMember.emergencyContact && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-400 font-medium">Emergency Phone:</span>
                  <a
                    href={`tel:${selectedMember.emergencyContact}`}
                    className="font-semibold text-[#0066FF] dark:text-[#42D9FF] hover:underline"
                  >
                    {selectedMember.emergencyContact}
                  </a>
                </div>
              )}
              {selectedMember.dateOfBirth && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-400 font-medium">Date of Birth:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedMember.dateOfBirth}
                  </span>
                </div>
              )}
              {selectedMember.gender && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-400 font-medium">Gender:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedMember.gender}
                  </span>
                </div>
              )}
              {selectedMember.location && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-400 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedMember.location}
                  </span>
                </div>
              )}
              {selectedMember.healthcareNotes && (
                <div className="py-1">
                  <span className="text-slate-400 font-medium block mb-1">Healthcare Notes:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#071827] p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                    {selectedMember.healthcareNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Integrated Care Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Coordinate Care for {selectedMember.fullName.split(' ')[0]}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/find-care?q=${encodeURIComponent(selectedMember.fullName)}`}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#10283B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#15344d] transition text-xs font-semibold"
                >
                  <Search className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>Find Care</span>
                </Link>

                <Link
                  href="/map"
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#10283B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#15344d] transition text-xs font-semibold"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#00C6D7]" />
                  <span>Hospital Map</span>
                </Link>

                <Link
                  href={`/journey?member=${encodeURIComponent(selectedMember.id)}`}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#10283B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#15344d] transition text-xs font-semibold"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Care Journey</span>
                </Link>

                <Link
                  href={`/documents?member=${encodeURIComponent(selectedMember.id)}`}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#10283B] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#15344d] transition text-xs font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Isolated Vault</span>
                </Link>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  openEditModal(m);
                }}
                className="inline-flex items-center text-xs font-semibold text-[#0066FF] dark:text-[#42D9FF] hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  setMemberToDelete(m);
                }}
                className="inline-flex items-center text-xs font-semibold text-rose-500 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          5. ADD / EDIT FAMILY MEMBER MODAL
         ============================================================ */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#071827] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Family Member Profile' : 'Add Family Member'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Devi Patel"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Relationship *
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-white dark:bg-[#071827]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Healthcare Notes (Allergies, chronic conditions, prescriptions)
                </label>
                <textarea
                  value={healthcareNotes}
                  onChange={(e) => setHealthcareNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Hypertension, penicillin allergy..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10283B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* Permissions & Vault Isolation Toggles */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#10283B]/80 border border-slate-100 dark:border-white/5 space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageNav}
                    onChange={(e) => setCanManageNav(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Navigation Permission (Allow coordinating travel & hospital routes)
                  </span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageDocs}
                    onChange={(e) => setCanManageDocs(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Medical Vault Access (Enforce isolated, private records)
                  </span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-md shadow-blue-500/20 transition"
                >
                  {isEditing ? 'Save Changes' : 'Add Family Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          6. REMOVE FAMILY MEMBER CONFIRMATION MODAL
         ============================================================ */}
      {memberToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMemberToDelete(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#071827] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove this family member?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-200">{memberToDelete.fullName}</span> from your Family Care Circle?
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
