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
      <div className="glass-panel p-5 rounded-3xl shadow-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-sky-600 dark:text-sky-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals by name, speciality (e.g. Apollo, Ganga, AIIMS, Oncology, Cardiology, NIMS, Jan Aushadhi)..."
            className="w-full rounded-2xl glass-input pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* City Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#0066FF] dark:text-[#42D9FF]" />
              Filter by Hub / City (Tamil Nadu & South India Priority):
            </span>
            {selectedCity !== 'all' && (
              <button
                onClick={() => setSelectedCity('all')}
                className="text-[#0066FF] dark:text-[#42D9FF] hover:underline text-[11px]"
              >
                Clear city filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
            {[
              { id: 'all', label: 'All India' },
              { id: 'Chennai', label: 'Chennai' },
              { id: 'Coimbatore', label: 'Coimbatore' },
              { id: 'Madurai', label: 'Madurai' },
              { id: 'Tiruchirappalli', label: 'Trichy' },
              { id: 'Salem', label: 'Salem' },
              { id: 'Tirunelveli', label: 'Tirunelveli' },
              { id: 'Vellore', label: 'Vellore' },
              { id: 'Erode', label: 'Erode' },
              { id: 'Tiruppur', label: 'Tiruppur' },
              { id: 'Thanjavur', label: 'Thanjavur' },
              { id: 'Hosur', label: 'Hosur' },
              { id: 'Dindigul', label: 'Dindigul' },
              { id: 'Thoothukudi', label: 'Thoothukudi' },
              { id: 'Nagercoil', label: 'Nagercoil' },
              { id: 'Karur', label: 'Karur' },
              { id: 'Kanchipuram', label: 'Kanchipuram' },
              { id: 'Kumbakonam', label: 'Kumbakonam' },
              { id: 'Cuddalore', label: 'Cuddalore' },
              { id: 'Pudukkottai', label: 'Pudukkottai' },
              { id: 'Villupuram', label: 'Villupuram' },
              { id: 'Puducherry', label: 'Puducherry' },
              { id: 'Bengaluru', label: 'Bengaluru' },
              { id: 'Hyderabad', label: 'Hyderabad' },
              { id: 'Delhi', label: 'Delhi NCR' },
              { id: 'Mumbai', label: 'Mumbai' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCity(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  selectedCity.toLowerCase() === c.id.toLowerCase()
                    ? 'bg-gradient-to-r from-[#0066FF] to-[#00C6D7] text-white shadow-md shadow-[#0066FF]/20'
                    : 'glass-card hover:bg-white/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Quick Tags:
          </span>

          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs ${
              emergencyOnly
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white/90'
            }`}
          >
            🚨 24/7 Casualty & Trauma
          </button>

          <button
            onClick={() => setWheelchairOnly(!wheelchairOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs ${
              wheelchairOnly
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white/90'
            }`}
          >
            ♿ Wheelchair Accessible
          </button>

          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs ${
              openNowOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white/90'
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
                <div
                  key={fac.id}
                  onClick={() => handleCardClick(fac.id)}
                  className="p-6 rounded-3xl glass-card flex flex-col justify-between border border-white/60 dark:border-white/10 hover:border-sky-400/60 dark:hover:border-sky-500/60 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs glass-panel px-2.5 py-0.5 font-bold">
                            {fac.facilityType}
                          </Badge>
                          {fac.verified && (
                            <span className="inline-flex items-center text-xs text-sky-800 dark:text-sky-300 font-bold bg-sky-100/80 dark:bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-600 dark:text-sky-400" />
                              {t.facilities.verifiedBadge}
                            </span>
                          )}
                          {fac.emergencyAvailable && (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/80 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
                              24/7 Emergency
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {fac.name}
                        </h2>
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(fac.id, e)}
                        aria-label="Save facility"
                        title={isSaved ? 'Remove from saved' : 'Save in My Care'}
                        className={`p-2 rounded-2xl border transition ${
                          isSaved
                            ? 'bg-sky-100 dark:bg-sky-950 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 shadow-sm'
                            : 'glass-card border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {fac.description}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-sky-600 shrink-0" />
                        <span className="truncate">
                          {fac.location.addressLine1}, {fac.location.city}, {fac.location.state}
                        </span>
                        {fac.distanceKm !== undefined && (
                          <span className="ml-auto font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-2 py-0.5 rounded-lg shrink-0 border border-sky-200 dark:border-sky-800">
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
                            className="text-[11px] glass-card text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg font-medium border border-slate-200/60 dark:border-slate-800"
                          >
                            {srv}
                          </span>
                        ))}
                        {fac.services.length > 3 && (
                          <span className="text-[11px] text-slate-400 self-center font-medium">
                            +{fac.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
                    <a
                      href={`tel:${fac.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1 text-sky-600 dark:text-sky-400" />
                      {t.facilities.callFacility}
                    </a>

                    <div className="flex items-center text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                      <span>View Hospital Details</span>
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
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
