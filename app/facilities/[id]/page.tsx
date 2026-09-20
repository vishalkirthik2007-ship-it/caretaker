'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Navigation,
  Car,
  Accessibility,
  Languages,
  CalendarCheck,
  ExternalLink,
  HeartPulse,
  Share2,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function FacilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { t } = useLanguage();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (id) {
      const fac = repository.getFacilityById(id);
      if (fac) {
        setFacility(fac);
        const saved = repository.getSavedFacilityIds();
        setIsSaved(saved.includes(id));
      }
    }
  }, [id, router]);

  if (!facility) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Facility Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested Indian healthcare institution does not exist or has been updated.
        </p>
        <Link href="/facilities">
          <Button variant="outline" size="sm">
            Return to Facilities Directory
          </Button>
        </Link>
      </div>
    );
  }

  const handleToggleSave = () => {
    const updated = repository.toggleSaveFacility(facility.id);
    setIsSaved(updated);
  };

  const handleStartJourney = () => {
    router.push(`/journey?facilityId=${facility.id}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/facilities"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Facilities Directory
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
        >
          <Share2 className="w-3.5 h-3.5 mr-1" />
          {copiedLink ? 'Link Copied!' : 'Share Facility Profile'}
        </button>
      </div>

      {/* Main Header Banner */}
      <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{facility.facilityType}</Badge>
              {facility.verified && (
                <span className="inline-flex items-center text-xs text-teal-800 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md">
                  <ShieldCheck className="w-4 h-4 mr-1 text-teal-700 dark:text-teal-400" />
                  Verified Healthcare Provider (India)
                </span>
              )}
              {facility.emergencyAvailable && (
                <Badge variant="danger">24/7 Casualty & Trauma Unit</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {facility.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {facility.description}
            </p>

            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              <MapPin className="w-4 h-4 mr-1.5 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                {facility.location.addressLine1}, {facility.location.city}, {facility.location.state} - {facility.location.postalCode}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <Button
              onClick={handleToggleSave}
              variant={isSaved ? 'primary' : 'outline'}
              size="sm"
              className="w-full"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-1.5" />
                  Saved in My Care
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-1.5" />
                  Save Facility
                </>
              )}
            </Button>

            <Button
              onClick={handleStartJourney}
              variant="secondary"
              size="sm"
              className="w-full text-xs"
            >
              <CalendarCheck className="w-4 h-4 mr-1.5 text-teal-700 dark:text-teal-400" />
              Prepare Appointment
            </Button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <a
            href={`tel:${facility.phone}`}
            className="inline-flex items-center px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Call {facility.phone}
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.location.latitude},${facility.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            <Navigation className="w-3.5 h-3.5 mr-1.5 text-teal-700 dark:text-teal-400" />
            Get Google Maps Directions
          </a>

          {facility.website && (
            <a
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Official Portal
              <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Departments & Guidance */}
        <div className="md:col-span-2 space-y-6">
          {/* Departments & Specialities Offered */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <HeartPulse className="w-4 h-4 mr-2 text-teal-700 dark:text-teal-400" />
              Specialities & Departments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facility.services?.map((service) => (
                <div
                  key={service}
                  className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Before You Visit Guidance for Indian Hospitals */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.facilities.beforeYouVisit} (Indian Healthcare Workflow)
            </h2>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  1
                </span>
                <span>
                  <strong>Government ID & Health Cards:</strong> Carry your Aadhaar card, Voter ID, or Ayushman Bharat PM-JAY card along with cashless TPA insurance policy number.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  2
                </span>
                <span>
                  <strong>OPD Registration Token:</strong> For government hospitals (AIIMS, PGIMER, KEM), arrive early for OPD counter registration or book an online appointment via e-Hospital / ORS portal.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  3
                </span>
                <span>
                  <strong>Previous Test Records:</strong> Carry all previous diagnostic scans, blood tests (CBC, Blood Sugar), discharge summaries, and currently active doctor prescriptions.
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Location, Operating Hours & Accessibility */}
        <div className="space-y-6">
          {/* Location & Parking */}
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hospital Location & Address
            </h2>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                {facility.location.addressLine1}
              </div>
              <div>
                {facility.location.city}, {facility.location.state} - {facility.location.postalCode}
              </div>
              <div className="text-slate-400 dark:text-slate-500">{facility.location.country}</div>
            </div>

            {facility.location.parkingInfo && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                <Car className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{facility.location.parkingInfo}</span>
              </div>
            )}
          </Card>

          {/* Operating Hours */}
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-teal-700 dark:text-teal-400" />
              {t.facilities.openingHours}
            </h2>
            <div className="space-y-1.5 text-xs">
              {facility.hours ? (
                facility.hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {DAYS_OF_WEEK[h.dayOfWeek]}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {h.is24Hours ? '24 Hours Emergency' : `${h.openTime} - ${h.closeTime}`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400">
                  OPD Hours: Mon - Sat 08:30 - 17:00. 24/7 Casualty available for acute medical emergencies.
                </div>
              )}
            </div>
          </Card>

          {/* Languages & Accessibility */}
          <Card className="p-5 space-y-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Languages & Accessibility
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Accessibility className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>
                  {facility.wheelchairAccessible
                    ? 'Wheelchair Ramp & Stretcher Lifts Available'
                    : 'Contact hospital helpdesk for wheelchair assistance'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Languages className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>
                  Supported: {facility.languagesSupported.join(', ')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
