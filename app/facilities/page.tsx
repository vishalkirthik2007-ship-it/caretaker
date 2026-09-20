'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ExternalLink,
  ArrowRight,
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
  const router = useRouter();
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
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({
    lat: 13.0827,
    lon: 80.2707,
  });

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user?.preferences?.lastKnownLatitude && user?.preferences?.lastKnownLongitude) {
      setUserLocation({
        lat: Number(user.preferences.lastKnownLatitude),
        lon: Number(user.preferences.lastKnownLongitude),
      });
      if (user.city) {
        // Default to user's city if available
        setSelectedCity('all');
      }
    }
  }, [router]);

  useEffect(() => {
    setSavedIds(repository.getSavedFacilityIds());
    loadFacilities();
  }, [search, emergencyOnly, wheelchairOnly, openNowOnly, selectedCity]);

  const loadFacilities = () => {
    let data = repository.getFacilities({
      search: search.trim() || undefined,
      category: initialCategory || undefined,
      emergencyOnly,
      wheelchairOnly,
      openNowOnly,
      userLat: userLocation.lat,
      userLon: userLocation.lon,
    });

    if (selectedCity !== 'all') {
      data = data.filter((f) =>
        f.location.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        f.location.state.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    setFacilities(data);
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    repository.toggleSaveFacility(id);
    setSavedIds(repository.getSavedFacilityIds());
  };

  const handleCardClick = (facilityId: string) => {
    router.push(`/facilities/${facilityId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Map View Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-xs">
              🇮🇳 Verified Indian Healthcare Institutions
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {t.facilities.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Hospitals, super-speciality clinics, Jan Aushadhi pharmacies, and trauma centers across India.
          </p>
        </div>
        <Link href="/map">
          <Button variant="outline" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>Interactive Map View</span>
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals by name, speciality (e.g. AIIMS, Apollo, Oncology, Cardiology, Jan Aushadhi)..."
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Filters:
          </span>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-teal-700"
          >
            <option value="all">All India (National)</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Chennai">Chennai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Vellore">Vellore</option>
          </select>

          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              emergencyOnly
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            🚨 24/7 Casualty & Trauma
          </button>

          <button
            onClick={() => setWheelchairOnly(!wheelchairOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              wheelchairOnly
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            ♿ Wheelchair Accessible
          </button>

          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              openNowOnly
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            Open Now
          </button>
        </div>
      </div>

      {/* Facilities Result List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Showing {facilities.length} verified hospitals & clinics</span>
          <span className="hidden sm:inline">Click anywhere on a hospital card to view complete verified details</span>
        </div>

        {facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {facilities.map((fac) => {
              const isSaved = savedIds.includes(fac.id);
              return (
                <Card
                  key={fac.id}
                  onClick={() => handleCardClick(fac.id)}
                  className="p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {fac.facilityType}
                          </Badge>
                          {fac.verified && (
                            <span className="inline-flex items-center text-xs text-teal-800 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-700 dark:text-teal-400" />
                              {t.facilities.verifiedBadge}
                            </span>
                          )}
                          {fac.emergencyAvailable && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                              24/7 Emergency
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {fac.name}
                        </h2>
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(fac.id, e)}
                        aria-label="Save facility"
                        title={isSaved ? 'Remove from saved' : 'Save in My Care'}
                        className={`p-2 rounded-xl border transition ${
                          isSaved
                            ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {fac.description}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {fac.location.addressLine1}, {fac.location.city}, {fac.location.state}
                        </span>
                        {fac.distanceKm !== undefined && (
                          <span className="ml-auto font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md shrink-0">
                            {formatDistance(fac.distanceKm)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span>{fac.phone}</span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    {fac.services && fac.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {fac.services.slice(0, 3).map((srv) => (
                          <span
                            key={srv}
                            className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
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
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <a
                      href={`tel:${fac.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1 text-teal-700 dark:text-teal-400" />
                      {t.facilities.callFacility}
                    </a>

                    <div className="flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:underline">
                      <span>View Hospital Details</span>
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Facilities Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No verified facilities match your search. Try changing city filters or clearing search text.
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
