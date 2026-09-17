'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Navigation,
  Globe,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAccessibility } from '@/hooks/use-accessibility';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistance } from '@/lib/utils';

function FacilitiesPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialEmergency = searchParams.get('emergency') === 'true';

  const { t } = useLanguage();
  const { easyMode } = useAccessibility();

  const [search, setSearch] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [emergencyOnly, setEmergencyOnly] = useState(initialEmergency);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({
    lat: 40.7128,
    lon: -74.006,
  });

  useEffect(() => {
    setSavedIds(repository.getSavedFacilityIds());
    loadFacilities();
  }, [search, emergencyOnly, wheelchairOnly, openNowOnly]);

  const loadFacilities = () => {
    const data = repository.getFacilities({
      search: search.trim() || undefined,
      emergencyOnly,
      wheelchairOnly,
      openNowOnly,
      userLat: userLocation.lat,
      userLon: userLocation.lon,
    });
    setFacilities(data);
  };

  const handleToggleSave = (id: string) => {
    repository.toggleSaveFacility(id);
    setSavedIds(repository.getSavedFacilityIds());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Map View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.facilities.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Verified healthcare providers, clinics, and emergency centers.
          </p>
        </div>
        <Link href="/map">
          <Button variant="outline" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-700" />
            <span>Switch to Interactive Map</span>
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.facilities.searchPlaceholder}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Filters:
          </span>

          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              emergencyOnly
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.facilities.filterEmergency}
          </button>

          <button
            onClick={() => setWheelchairOnly(!wheelchairOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              wheelchairOnly
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.facilities.filterWheelchair}
          </button>

          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              openNowOnly
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.facilities.filterOpenNow}
          </button>
        </div>
      </div>

      {/* Facilities Result List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {facilities.length} verified facilities near you</span>
          <span>Sorted by factual distance & services</span>
        </div>

        {facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {facilities.map((fac) => {
              const isSaved = savedIds.includes(fac.id);
              return (
                <Card
                  key={fac.id}
                  className="p-6 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {fac.facilityType}
                          </Badge>
                          {fac.verified && (
                            <span className="inline-flex items-center text-xs text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-700" />
                              {t.facilities.verifiedBadge}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {fac.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleToggleSave(fac.id)}
                        aria-label="Save facility"
                        className={`p-2 rounded-xl border transition ${
                          isSaved
                            ? 'bg-teal-50 border-teal-300 text-teal-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-teal-700" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {fac.description}
                    </p>

                    <div className="text-xs text-slate-500 space-y-1 pt-1">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span>
                          {fac.location.addressLine1}, {fac.location.city}
                        </span>
                        <span className="ml-auto font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          {formatDistance(fac.distanceKm)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span>{fac.phone}</span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    {fac.services && fac.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {fac.services.slice(0, 3).map((srv) => (
                          <span
                            key={srv}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {srv}
                          </span>
                        ))}
                        {fac.services.length > 3 && (
                          <span className="text-[11px] text-slate-400 self-center">
                            +{fac.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <a
                      href={`tel:${fac.phone}`}
                      className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-900"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      {t.facilities.callFacility}
                    </a>

                    <Link href={`/facilities/${fac.id}`}>
                      <Button size="sm" variant="outline" className="text-xs font-semibold">
                        View Facility Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Facilities Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No verified facilities match your current search and filter settings. Try relaxing filters or expanding your search term.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading Facilities Directory...
        </div>
      }
    >
      <FacilitiesPageContent />
    </Suspense>
  );
}
