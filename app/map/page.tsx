'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Navigation,
  Building2,
  Phone,
  ShieldCheck,
  Filter,
  Layers,
  ArrowRight,
  Crosshair,
  Car,
  Clock,
  ExternalLink,
  LocateFixed,
  AlertCircle,
  Compass,
  Star,
  Search,
  CheckCircle2,
  X,
  Stethoscope,
  Pill,
  Microscope,
  AlertTriangle,
  ArrowLeft,
  Maximize2,
  Plus,
  Minus,
  Globe,
  Radio,
} from 'lucide-react';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDistance } from '@/lib/utils';

const TAMIL_NADU_AND_INDIAN_HUBS: Record<string, { name: string; lat: number; lon: number }> = {
  chennai: { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  coimbatore: { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  madurai: { name: 'Madurai, Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  trichy: { name: 'Tiruchirappalli (Trichy), Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  salem: { name: 'Salem, Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  tirunelveli: { name: 'Tirunelveli, Tamil Nadu', lat: 8.7139, lon: 77.7567 },
  vellore: { name: 'Vellore, Tamil Nadu', lat: 12.9165, lon: 79.1325 },
  erode: { name: 'Erode, Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  tiruppur: { name: 'Tiruppur, Tamil Nadu', lat: 11.1085, lon: 77.3411 },
  thanjavur: { name: 'Thanjavur, Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  hosur: { name: 'Hosur, Tamil Nadu', lat: 12.7409, lon: 77.8253 },
  dindigul: { name: 'Dindigul, Tamil Nadu', lat: 10.3673, lon: 77.9803 },
  thoothukudi: { name: 'Thoothukudi, Tamil Nadu', lat: 8.7642, lon: 78.1348 },
  nagercoil: { name: 'Nagercoil, Tamil Nadu', lat: 8.1960, lon: 77.4119 },
  karur: { name: 'Karur, Tamil Nadu', lat: 10.9601, lon: 78.0766 },
  kanchipuram: { name: 'Kanchipuram, Tamil Nadu', lat: 12.8342, lon: 79.7036 },
};

// 5 Exact Category Chips from Reference Poster (Map View)
const MAP_CHIPS = [
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'clinics', label: 'Clinics' },
  { id: 'pharmacy', label: 'Pharmacies' },
  { id: 'diagnostics', label: 'Diagnostic Centres' },
  { id: 'government', label: 'Government Hospitals' },
];

function CareNestMapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmergency = searchParams.get('emergency') === 'true';

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('hospitals');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCityKey, setCurrentCityKey] = useState<string>('chennai');
  const [userLocation, setUserLocation] = useState({ lat: 13.0827, lon: 80.2707 });
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [liveTraffic, setLiveTraffic] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [showPinPopup, setShowPinPopup] = useState(true);
  const [isCardDismissed, setIsCardDismissed] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user?.city) {
      const userCityNorm = user.city.toLowerCase().trim();
      const matchedKey = Object.keys(TAMIL_NADU_AND_INDIAN_HUBS).find((k) => {
        const hubName = TAMIL_NADU_AND_INDIAN_HUBS[k].name.toLowerCase();
        return hubName.includes(userCityNorm) || k.includes(userCityNorm) || userCityNorm.includes(k);
      });
      if (matchedKey) {
        setCurrentCityKey(matchedKey);
        setUserLocation({
          lat: TAMIL_NADU_AND_INDIAN_HUBS[matchedKey].lat,
          lon: TAMIL_NADU_AND_INDIAN_HUBS[matchedKey].lon,
        });
      }
    }
  }, [router]);

  useEffect(() => {
    const list = repository.getFacilities({
      emergencyOnly: initialEmergency,
      userLat: userLocation.lat,
      userLon: userLocation.lon,
    });
    setFacilities(list);

    // Prefer Apollo Greams Road if in Chennai, else first in list
    const apollo = list.find((f) => f.id === 'fac-apollo-chennai') || list[0];
    if (apollo) {
      setSelectedFacility(apollo);
    }
  }, [userLocation, initialEmergency]);

  const requestUserLocation = () => {
    if ('geolocation' in navigator) {
      setLocationStatus('locating');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setLocationStatus('granted');
        },
        () => {
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  const calculateETA = (distanceKm?: number) => {
    if (!distanceKm) return '12 mins';
    const minutes = Math.max(5, Math.round(distanceKm * 2.4));
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours} hr ${rem} mins`;
    }
    return `${minutes} mins`;
  };

  const activeHubName = TAMIL_NADU_AND_INDIAN_HUBS[currentCityKey]?.name || 'Chennai, Tamil Nadu';
  const queryToSearch = searchQuery.trim()
    ? `${searchQuery} in ${activeHubName}`
    : `${activeCategory} in ${activeHubName}`;

  const googleMapsUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(queryToSearch)}&center=${userLocation.lat},${userLocation.lon}&zoom=${zoomLevel}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(queryToSearch)}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#F4F8FC] dark:bg-[#071827]">
      {/* ============================================================
          TOP HEADER & CONTROLS matching Reference Poster
         ============================================================ */}
      <div className="absolute top-3 left-4 right-4 z-30 flex flex-col gap-2 max-w-2xl mx-auto pointer-events-auto">
        {/* Header Bar: < Map View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-white transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Map View
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* City selector dropdown */}
            <select
              value={currentCityKey}
              onChange={(e) => {
                const key = e.target.value;
                setCurrentCityKey(key);
                const hub = TAMIL_NADU_AND_INDIAN_HUBS[key];
                if (hub) setUserLocation({ lat: hub.lat, lon: hub.lon });
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#10283B]/90 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-medium focus:outline-none shadow-xs"
            >
              {Object.entries(TAMIL_NADU_AND_INDIAN_HUBS).map(([k, hub]) => (
                <option key={k} value={k} className="bg-white dark:bg-[#071827] text-slate-900 dark:text-white">
                  {hub.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar Pill matching Reference Poster */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, areas, or specialties..."
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white/95 dark:bg-[#10283B]/95 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 shadow-md backdrop-blur-md"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <X className="absolute right-3.5 w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-60" />
          )}
        </div>

        {/* Category Chips matching Reference Poster: Hospitals, Clinics, Pharmacies, Diagnostic Centres, Government Hospitals */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MAP_CHIPS.map((chip) => {
            const isSelected = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveCategory(chip.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-[#102033] dark:bg-white text-white dark:text-[#071827] shadow-sm'
                    : 'bg-white/90 dark:bg-[#10283B]/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#15344d]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          MAP CANVAS: Real Google Map Integration
         ============================================================ */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          title="Google Maps CareNest Healthcare Radar"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={googleMapsUrl}
          className="w-full h-full"
        />

        {/* Selected Marker Pin Preview Card (Floating on Map) */}
        {selectedFacility && showPinPopup && (
          <div className="absolute top-36 sm:top-32 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-white/95 dark:bg-[#10283B]/95 rounded-2xl p-3 shadow-xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl max-w-xs text-center space-y-1">
              <button
                onClick={() => setShowPinPopup(false)}
                className="absolute top-1.5 right-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {selectedFacility.name}
              </h4>
              <div className="flex items-center justify-center space-x-1 text-[11px] text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{selectedFacility.rating || '4.6'}</span>
                <span className="text-slate-400 font-normal">
                  ({selectedFacility.reviewCount || '12.5k'})
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1 text-[#0066FF]" />
                {calculateETA(selectedFacility.distanceKm)} • {formatDistance(selectedFacility.distanceKm || 3.2)}
              </p>
              <div className="pt-1">
                <Link
                  href={`/facilities/${selectedFacility.id}`}
                  className="inline-block px-3 py-1 text-[11px] font-bold text-white bg-[#0066FF] hover:bg-[#0052cc] rounded-lg shadow-xs"
                >
                  View Details
                </Link>
              </div>
              {/* Arrow bubble tail */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#10283B] rotate-45 border-r border-b border-slate-200/80 dark:border-white/10" />
            </div>
          </div>
        )}

        {/* Map Floating Controls Right Edge: Fullscreen, GPS, Zoom +, Zoom -, Live Traffic */}
        <div className="absolute bottom-28 sm:bottom-32 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          {/* Live Traffic Toggle */}
          <button
            onClick={() => setLiveTraffic((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition ${
              liveTraffic
                ? 'bg-white/95 dark:bg-[#10283B]/95 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
                : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveTraffic ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Live Traffic</span>
          </button>

          {/* GPS Locate Button */}
          <button
            onClick={requestUserLocation}
            className="w-9 h-9 rounded-full bg-white/95 dark:bg-[#10283B]/95 text-slate-700 dark:text-slate-200 hover:text-[#0066FF] flex items-center justify-center shadow-lg border border-slate-200/80 dark:border-white/10 transition"
            title="My GPS Location"
          >
            <LocateFixed className="w-4.5 h-4.5" />
          </button>

          {/* Zoom Controls */}
          <div className="bg-white/95 dark:bg-[#10283B]/95 rounded-2xl shadow-lg border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col">
            <button
              onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
              className="w-9 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(8, z - 1))}
              className="w-9 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Small Google Branding Marker bottom-left */}
        <div className="absolute bottom-28 left-4 z-20 pointer-events-none">
          <span className="text-[11px] font-bold text-slate-500/80 bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded backdrop-blur-xs">
            Google Maps Platform
          </span>
        </div>
      </div>

      {/* ============================================================
          BOTTOM DRAWER CARD matching Reference Poster
         ============================================================ */}
      {selectedFacility && !isCardDismissed && (
        <div className="absolute bottom-3 left-4 right-4 z-30 max-w-xl mx-auto pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl bg-white/95 dark:bg-[#10283B]/95 p-3.5 sm:p-4 shadow-2xl border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl space-y-3">
            <div className="flex items-center space-x-3.5">
              {/* Exterior Photo Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <img
                  src="/images/apollo_chennai.jpg"
                  alt={selectedFacility.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title, rating, distance */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedFacility.name}
                  </h3>
                  <button
                    onClick={() => setIsCardDismissed(true)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 -mt-1 -mr-1"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{selectedFacility.rating || '4.6'}</span>
                  <span className="text-slate-400 font-normal">
                    ({selectedFacility.reviewCount || '12.5k'})
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Multi-speciality Hospital
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {formatDistance(selectedFacility.distanceKm || 3.2)} • {calculateETA(selectedFacility.distanceKm)}
                </p>
              </div>
            </div>

            {/* 3 Pill Action Buttons matching Reference Poster: Directions, Call, Website */}
            <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-white/10">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.location.latitude},${selectedFacility.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-xs bg-gradient-to-r from-[#0066FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white shadow-md shadow-blue-500/20 transition active:scale-98"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                Directions
              </a>

              {selectedFacility.phone && (
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-full font-semibold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-white/10 transition active:scale-98"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-[#0066FF] dark:text-[#42D9FF]" />
                  Call
                </a>
              )}

              {selectedFacility.website && (
                <a
                  href={selectedFacility.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-full font-semibold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-white/10 transition active:scale-98"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-[#00C6D7]" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading CareNest Real Google Map...
        </div>
      }
    >
      <CareNestMapPageContent />
    </Suspense>
  );
}
