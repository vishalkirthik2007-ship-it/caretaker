'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Users,
  Search,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { getAuditLogs } from '@/lib/security';
import { Facility, AuditLogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AdminPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'facilities' | 'ai_monitor' | 'audit_logs'>('facilities');

  useEffect(() => {
    setFacilities(repository.getFacilities());
    setAuditLogs(getAuditLogs());
  }, []);

  const handleToggleVerify = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, verified: !f.verified } : f))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
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
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold">
              Admin & Regulatory Control
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            CareNest Administration Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage hospital accreditation rosters, monitor non-diagnostic AI triage safeguards, and inspect cryptographic audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'facilities'
              ? 'border-carenest-primary text-carenest-primary dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Facility Verification ({facilities.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_monitor')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'ai_monitor'
              ? 'border-carenest-primary text-carenest-primary dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          AI Safety & Triage Metrics
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'audit_logs'
              ? 'border-carenest-primary text-carenest-primary dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Facility Verification Management */}
      {activeTab === 'facilities' && (
        <Card className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Healthcare Facility Verification & Roster
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/70 dark:bg-[#071827]/70 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">City / State</th>
                  <th className="py-3 px-4">Emergency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {fac.name}
                    </td>
                    <td className="py-3.5 px-4">{fac.facilityType}</td>
                    <td className="py-3.5 px-4">
                      {fac.location.city}, {fac.location.state}
                    </td>
                    <td className="py-3.5 px-4">
                      {fac.emergencyAvailable ? (
                        <span className="text-rose-500 font-semibold">24/7 ER</span>
                      ) : (
                        <span className="text-slate-400">Routine</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {fac.verified ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={fac.verified ? 'outline' : 'primary'}
                        onClick={() => handleToggleVerify(fac.id)}
                        className="text-xs py-1 rounded-xl"
                      >
                        {fac.verified ? 'Revoke Verification' : 'Mark Verified'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: AI Safety & Triage Metrics */}
      {activeTab === 'ai_monitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
              <span className="text-xs font-bold uppercase text-slate-400">Total Nav Inquiries</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,428</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">100% Non-diagnostic compliance</p>
            </Card>

            <Card className="p-5 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
              <span className="text-xs font-bold uppercase text-slate-400">Emergency Red-Flags Triaged</span>
              <div className="text-2xl font-extrabold text-rose-500 mt-1">42</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Direct emergency hotlines presented</p>
            </Card>

            <Card className="p-5 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
              <span className="text-xs font-bold uppercase text-slate-400">Most Requested Category</span>
              <div className="text-2xl font-extrabold text-carenest-primary dark:text-cyan-400 mt-1">Cardiology</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cardiology & Paediatrics leads</p>
            </Card>
          </div>

          <Card className="p-6 space-y-3 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Safety Escalation Safeguards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              CareNest enforces an immutable safety pre-flight layer. Any prompt referencing stroke symptoms, acute chest pressure, choking, or severe blood loss bypasses normal routing and renders an emergency escalation banner.
            </p>
          </Card>
        </div>
      )}

      {/* Tab 3: Security Audit Logs */}
      {activeTab === 'audit_logs' && (
        <Card className="p-6 space-y-4 border-white/60 dark:border-white/10 bg-white/85 dark:bg-[#10283B]/90 backdrop-blur-xl shadow-lg rounded-3xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Compliance Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/70 dark:bg-[#071827]/70 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="py-3 px-4">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs font-mono text-[10px]">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
