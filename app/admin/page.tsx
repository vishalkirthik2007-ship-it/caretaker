'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { getAuditLogs } from '@/lib/security';
import { Facility, AuditLogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
            <Badge variant="warning">Admin & Regulatory Control</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            CarePath Administration Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage healthcare facilities verification, monitor aggregated AI navigation triage, and inspect compliance audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'facilities'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Facility Verification ({facilities.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_monitor')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'ai_monitor'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          AI Safety & Triage Metrics
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'audit_logs'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Facility Verification Management */}
      {activeTab === 'facilities' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Healthcare Facility Verification & Roster
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">City / State</th>
                  <th className="py-3 px-4">Emergency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {fac.name}
                    </td>
                    <td className="py-3.5 px-4">{fac.facilityType}</td>
                    <td className="py-3.5 px-4">
                      {fac.location.city}, {fac.location.state}
                    </td>
                    <td className="py-3.5 px-4">
                      {fac.emergencyAvailable ? (
                        <span className="text-red-600 font-semibold">24/7 ER</span>
                      ) : (
                        <span className="text-slate-400">Routine</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {fac.verified ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={fac.verified ? 'outline' : 'primary'}
                        onClick={() => handleToggleVerify(fac.id)}
                        className="text-xs py-1"
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
            <Card className="p-5">
              <span className="text-xs font-bold uppercase text-slate-400">Total Nav Inquiries</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">1,428</div>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">100% Non-diagnostic compliance</p>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold uppercase text-slate-400">Emergency Red-Flags Triaged</span>
              <div className="text-2xl font-extrabold text-red-600 mt-1">42</div>
              <p className="text-[11px] text-slate-500 mt-1">Direct emergency hotlines presented</p>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-bold uppercase text-slate-400">Most Requested Category</span>
              <div className="text-2xl font-extrabold text-teal-800 mt-1">Specialists</div>
              <p className="text-[11px] text-slate-500 mt-1">Dermatology & Cardiology leads</p>
            </Card>
          </div>

          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">AI Safety Escalation Safeguards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CarePath enforces an immutable safety pre-flight layer. Any prompt referencing stroke symptoms, acute chest pressure, choking, or severe blood loss bypasses normal routing and renders an emergency escalation banner.
            </p>
          </Card>
        </div>
      )}

      {/* Tab 3: Security Audit Logs */}
      {activeTab === 'audit_logs' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Security & Compliance Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
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
