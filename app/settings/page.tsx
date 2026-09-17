'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Eye,
  Shield,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  FileDown,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { getAuditLogs } from '@/lib/security';
import { LanguageCode, AuditLogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const {
    easyMode,
    setEasyMode,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
  } = useAccessibility();

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    setAuditLogs(getAuditLogs('usr-default-001').slice(0, 5));
  }, []);

  const handleExportData = () => {
    const jsonString = repository.exportPersonalData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carepath_ai_personal_data_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handlePurgeAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;
    repository.purgeAllUserData();
    setIsDeleteModalOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.nav.settings} & Privacy Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your accessibility preferences, language dictionaries, security, and personal data rights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Language & Internationalization */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">
              Language & Regional Localization
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose your preferred language for healthcare navigation guidance and clinic details.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिंदी' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code as LanguageCode)}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  language === item.code
                    ? 'border-teal-700 bg-teal-50 text-teal-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        {/* 2. Accessibility & Easy Mode */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t.accessibility.title}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  {t.accessibility.easyMode}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {t.accessibility.easyModeDesc}
                </span>
              </div>
              <button
                onClick={() => setEasyMode(!easyMode)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  easyMode ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {easyMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  {t.accessibility.highContrast}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Enhances borders and text contrast for low vision.
                </span>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  highContrast ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {highContrast ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </Card>

        {/* 3. Privacy Center & Data Portability */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">
              Privacy Center & Data Rights
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            You retain complete ownership over your healthcare navigation records. Your records are never sold or used for targeted commercial ads.
          </p>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center space-x-2 text-xs"
            >
              <FileDown className="w-4 h-4 text-teal-700" />
              <span>Export Personal Data (JSON Archive)</span>
            </Button>

            {exportSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Personal data archive exported successfully!</span>
              </div>
            )}
          </div>
        </Card>

        {/* 4. Security Center & Danger Zone */}
        <Card className="p-6 space-y-4 border-red-100">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              Security Center & Account Deletion
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All user authentication sessions and storage objects conform to zero-knowledge vault boundaries.
          </p>

          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full text-xs"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Purge All Records & Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Account Deletion Confirmation Dialog */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account & Data Deletion"
        description="This action is permanent and irreversible."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl">
            Deleting your account will purge all saved facilities, navigation journeys, checklists, uploaded document records, and family associations.
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Type <strong>DELETE</strong> to confirm permanent deletion:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-red-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handlePurgeAccount}
            >
              Permanently Purge Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
