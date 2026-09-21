'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Moon,
  Sun,
  Bell,
  Sliders,
  ArrowLeft,
  Smartphone,
  ShieldAlert,
  Sparkles,
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
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
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

  // Notification toggles
  const [opdReminders, setOpdReminders] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [journeyAlerts, setJourneyAlerts] = useState(true);

  useEffect(() => {
    setAuditLogs(getAuditLogs('usr-default-001').slice(0, 5));
  }, []);

  const handleExportData = () => {
    const jsonString = repository.exportPersonalData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carenest_health_records_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handlePurgeAccount = () => {
    if (deleteConfirmText !== 'DELETE') return;
    repository.purgeAllUserData();
    setIsDeleteModalOpen(false);
    window.location.href = '/login';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <span className="text-xs text-carenest-primary font-bold">Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            CareNest Settings & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize visual theme, language localization, accessibility, notifications, and local encryption vaults.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Appearance & Theme */}
        <Card className="p-6 space-y-5 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-[#00C6D7] flex items-center justify-center text-white shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance & Visual Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between Mist Light and Midnight Ocean Dark modes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                theme === 'light'
                  ? 'border-carenest-primary bg-carenest-primary/10 text-carenest-primary shadow-sm font-bold ring-2 ring-carenest-primary/20'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#071827]/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#071827]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <div className="text-xs">
                <span className="block font-bold">Mist Light</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Ice White & Blue</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                theme === 'dark'
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-sm font-bold ring-2 ring-cyan-400/20'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#071827]/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#071827]'
              }`}
            >
              <Moon className="w-4 h-4 text-cyan-400" />
              <div className="text-xs">
                <span className="block font-bold">Midnight Dark</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Deep Ocean Navy</span>
              </div>
            </button>
          </div>
        </Card>

        {/* 2. Language & Internationalization */}
        <Card className="p-6 space-y-5 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-carenest-primary/10 dark:bg-carenest-primary/20 text-carenest-primary dark:text-carenest-accent flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Language & Regional Localization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regional dialect support for hospital OPD guidance and AI assistant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[
              { code: 'en', label: 'English', sub: 'Default' },
              { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
              { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code as LanguageCode)}
                className={`p-3 rounded-2xl border text-center transition ${
                  language === item.code
                    ? 'border-carenest-primary bg-gradient-to-r from-[#0866FF]/15 to-[#00C6D7]/15 text-carenest-primary dark:text-cyan-300 font-bold shadow-xs ring-2 ring-carenest-primary/20'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#071827]/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#071827]'
                }`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* 3. Accessibility & Vision */}
        <Card className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.accessibility.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assistive modes for senior citizens and low-vision accessibility.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 dark:bg-[#071827]/50 border border-slate-200 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t.accessibility.easyMode}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {t.accessibility.easyModeDesc}
                </span>
              </div>
              <button
                onClick={() => setEasyMode(!easyMode)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                  easyMode
                    ? 'bg-carenest-primary text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {easyMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 dark:bg-[#071827]/50 border border-slate-200 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t.accessibility.highContrast}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Enhances borders and text contrast for low-light clinical visibility.
                </span>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                  highContrast
                    ? 'bg-carenest-primary text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {highContrast ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </Card>

        {/* 4. Notifications & Alerts */}
        <Card className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Notifications & Alerts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage appointment reminders and 108 emergency sirens.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 dark:bg-[#071827]/50 border border-slate-200 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">OPD Token Reminders</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Push notifications when counter queue reaches your turn</span>
              </div>
              <button
                onClick={() => setOpdReminders(!opdReminders)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  opdReminders ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opdReminders ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 dark:bg-[#071827]/50 border border-slate-200 dark:border-white/10">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">108 Emergency Siren & SMS</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Instant dispatch trigger with live GPS transmission</span>
              </div>
              <button
                onClick={() => setEmergencyAlerts(!emergencyAlerts)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  emergencyAlerts ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {emergencyAlerts ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </Card>

        {/* 5. Privacy Center & Data Portability */}
        <Card className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-carenest-primary/10 text-carenest-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy & Data Portability
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You retain complete ownership over your healthcare records.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your records are stored securely with zero commercial monetization. You can export your clinical history at any time as a portable JSON archive.
          </p>

          <div className="space-y-3 pt-1">
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center space-x-2 text-xs rounded-2xl py-2.5 border-slate-200 dark:border-white/10 hover:bg-carenest-primary/10"
            >
              <FileDown className="w-4 h-4 text-carenest-primary" />
              <span>Export Personal Data (JSON Archive)</span>
            </Button>

            {exportSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs flex items-center space-x-2 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Personal data archive exported successfully!</span>
              </div>
            )}
          </div>
        </Card>

        {/* 6. Security Center & Danger Zone */}
        <Card className="p-6 space-y-4 border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Account Security & Purge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Irreversible account deletion and local cache wipeout.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Deleting your account completely purges all local medical documents, journey timelines, and user profiles permanently.
          </p>

          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full text-xs rounded-2xl py-2.5"
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
          <div className="p-3.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 rounded-2xl">
            Deleting your account will purge all saved facilities, navigation journeys, checklists, uploaded document records, and family associations.
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Type <strong>DELETE</strong> to confirm permanent deletion:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-white/10 rounded-2xl bg-white dark:bg-[#071827] text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handlePurgeAccount}
              className="rounded-xl"
            >
              Permanently Purge Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
