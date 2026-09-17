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

  useEffect(() => {
    if (id) {
      const fac = repository.getFacilityById(id);
      if (fac) {
        setFacility(fac);
        const saved = repository.getSavedFacilityIds();
        setIsSaved(saved.includes(id));
      }
    }
  }, [id]);

  if (!facility) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Facility Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested healthcare facility does not exist or has been deactivated.
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        href="/facilities"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Facilities Directory
      </Link>

      {/* Main Header Banner */}
      <Card className="p-6 sm:p-8 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{facility.facilityType}</Badge>
              {facility.verified && (
                <span className="inline-flex items-center text-xs text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-4 h-4 mr-1 text-teal-700" />
                  Verified Healthcare Provider
                </span>
              )}
              {facility.emergencyAvailable && (
                <Badge variant="danger">24/7 Emergency Services</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {facility.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {facility.description}
            </p>
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
              className="w-full"
            >
              <CalendarCheck className="w-4 h-4 mr-1.5 text-teal-700" />
              Navigate Care Journey
            </Button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
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
            className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            <Navigation className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
            Get Driving Directions
          </a>

          {facility.website && (
            <a
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Official Website
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Services & Guidance */}
        <div className="md:col-span-2 space-y-6">
          {/* Services Offered */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {t.facilities.servicesOffered}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facility.services?.map((service) => (
                <div
                  key={service}
                  className="flex items-center space-x-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Before You Visit Guidance */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {t.facilities.beforeYouVisit}
            </h2>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  1
                </span>
                <span>
                  <strong>Photo Identification & Insurance Cards:</strong> Bring a government-issued photo ID and current healthcare coverage documents or copay payment method.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  2
                </span>
                <span>
                  <strong>Current Medication List:</strong> Bring all active prescription bottles or a documented list of dosages and supplements.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  3
                </span>
                <span>
                  <strong>Previous Records & Imaging:</strong> If visiting for a specialist consultation, upload or bring previous MRI/CT discs or laboratory reports.
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Location, Hours & Accessibility */}
        <div className="space-y-6">
          {/* Location & Parking */}
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Location & Address
            </h2>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900 text-sm">
                {facility.location.addressLine1}
              </div>
              <div>
                {facility.location.city}, {facility.location.state} {facility.location.postalCode}
              </div>
              <div className="text-slate-400">{facility.location.country}</div>
            </div>

            {facility.location.parkingInfo && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
                <Car className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{facility.location.parkingInfo}</span>
              </div>
            )}
          </Card>

          {/* Opening Hours */}
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-teal-700" />
              {t.facilities.openingHours}
            </h2>
            <div className="space-y-1.5 text-xs">
              {facility.hours ? (
                facility.hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-medium text-slate-600">
                      {DAYS_OF_WEEK[h.dayOfWeek]}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {h.is24Hours ? '24 Hours Open' : `${h.openTime} - ${h.closeTime}`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">
                  Standard Hours: Mon-Fri 08:00 - 18:00. Call facility for holiday schedule.
                </div>
              )}
            </div>
          </Card>

          {/* Accessibility & Languages */}
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Facility Features
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <Accessibility className="w-4 h-4 text-teal-700" />
                <span>
                  {facility.wheelchairAccessible
                    ? 'Full ADA Wheelchair Accessibility'
                    : 'Contact facility for accessibility options'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Languages className="w-4 h-4 text-teal-700" />
                <span>
                  Languages: {facility.languagesSupported.join(', ')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
