'use client';

import React from 'react';
import { Phone, AlertTriangle, Navigation, Heart, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden">
        {/* Header Alert Banner */}
        <div className="bg-red-600 text-white p-6 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-700/80 rounded-2xl animate-pulse">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t.emergency.title}
              </h2>
              <p className="text-red-100 text-sm mt-0.5">
                Immediate Urgent Assistance Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-red-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-sm leading-relaxed flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p>
              CarePath AI is an educational healthcare navigation directory and{' '}
              <strong>does not dispatch ambulances or provide emergency treatment</strong>.
              If you or someone nearby is experiencing acute symptoms, dial emergency dispatch immediately.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Immediate Dispatch Hotlines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-2xl transition group"
              >
                <div>
                  <div className="font-bold text-slate-900 text-lg">112</div>
                  <div className="text-xs text-slate-500">Global / EU Emergency</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Phone className="w-5 h-5" />
                </div>
              </a>

              <a
                href="tel:911"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-2xl transition group"
              >
                <div>
                  <div className="font-bold text-slate-900 text-lg">911</div>
                  <div className="text-xs text-slate-500">USA / Canada Dispatch</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Phone className="w-5 h-5" />
                </div>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-2xl transition group"
              >
                <div>
                  <div className="font-bold text-slate-900 text-lg">108 / 102</div>
                  <div className="text-xs text-slate-500">India Emergency & Ambulance</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Phone className="w-5 h-5" />
                </div>
              </a>

              <a
                href="tel:18002221222"
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-2xl transition group"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">Poison Help</div>
                  <div className="text-xs text-slate-500">Poison Control Center</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Heart className="w-5 h-5" />
                </div>
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <a
              href="/map?emergency=true"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow transition"
            >
              <Navigation className="w-4 h-4 mr-2 text-teal-400" />
              {t.emergency.nearestHospital}
            </a>
            <Button variant="secondary" onClick={onClose}>
              {t.common.close}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
