'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Lock,
  Phone,
  Calendar,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { FamilyProfile } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function FamilyPage() {
  const { t } = useLanguage();
  const [familyMembers, setFamilyMembers] = useState<FamilyProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<
    'Child' | 'Parent' | 'Spouse' | 'Elder' | 'Other'
  >('Child');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [canManageDocs, setCanManageDocs] = useState(true);
  const [canManageNav, setCanManageNav] = useState(true);

  useEffect(() => {
    setFamilyMembers(repository.getFamilyProfiles());
  }, []);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newProfile: FamilyProfile = {
      id: `fam-${Date.now()}`,
      primaryUserId: 'usr-default-001',
      fullName: fullName.trim(),
      relationship,
      emergencyContact: emergencyContact.trim() || undefined,
      canManageDocuments: canManageDocs,
      canManageNavigation: canManageNav,
      createdAt: new Date().toISOString(),
    };

    repository.saveFamilyProfile(newProfile);
    setFamilyMembers(repository.getFamilyProfiles());
    setIsModalOpen(false);
    setFullName('');
    setEmergencyContact('');
  };

  const handleDeleteProfile = (id: string) => {
    repository.deleteFamilyProfile(id);
    setFamilyMembers(repository.getFamilyProfiles());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <span className="text-xs text-carenest-primary font-bold">CareNest Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Family Care Circle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Coordinate hospital journeys, appointments, and medical vaults for dependents, elders, and loved ones.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="btn-gradient-carenest rounded-2xl shadow-md flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Add Family Member</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {familyMembers.map((member) => (
          <Card
            key={member.id}
            className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl hover:border-carenest-primary/40 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-carenest-primary/10 text-carenest-primary dark:text-cyan-300 border-carenest-primary/20 text-xs font-bold">
                  {member.relationship}
                </Badge>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                  {member.fullName}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteProfile(member.id)}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                title="Remove profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-3 border-t border-slate-100 dark:border-white/10">
              {member.emergencyContact && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Emergency: {member.emergencyContact}</span>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-1">
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Navigation Permitted
                </span>
                <span className="flex items-center text-carenest-primary dark:text-cyan-300 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Vault Isolated
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Family Member Profile"
        description="Create a dependent profile with isolated healthcare records."
      >
        <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:border-carenest-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Relationship
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:border-carenest-primary focus:outline-none"
            >
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Elder">Elder Family Member</option>
              <option value="Other">Other</option>
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
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:border-carenest-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="btn-gradient-carenest rounded-xl">
              Save Member Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
