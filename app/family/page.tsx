'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Lock,
  Phone,
  Calendar,
  Check,
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
            <Badge variant="default">Family Care Coordination</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t.nav.family}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Coordinate navigation journeys and records for dependents, parents, and loved ones with explicit privacy controls.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add Family Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {familyMembers.map((member) => (
          <Card key={member.id} className="p-6 space-y-4 hover:border-slate-300 transition">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="text-xs">
                  {member.relationship}
                </Badge>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {member.fullName}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteProfile(member.id)}
                className="text-slate-400 hover:text-red-500 p-1"
                title="Remove profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
              {member.emergencyContact && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Emergency Contact: {member.emergencyContact}</span>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-1">
                <span className="flex items-center text-emerald-700 font-semibold text-[11px]">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Navigation Permitted
                </span>
                <span className="flex items-center text-teal-700 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Record Isolation Active
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
            <label className="font-semibold text-slate-700 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.g. Maya Patel"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Relationship
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-xl bg-white"
            >
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Spouse">Spouse</option>
              <option value="Elder">Elder Family Member</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Member Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
