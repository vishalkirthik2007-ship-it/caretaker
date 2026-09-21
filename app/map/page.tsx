'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  thoothukudi: { name: 'Thoothukudi (Tuticorin), Tamil Nadu', lat: 8.7642, lon: 78.1348 },
  nagercoil: { name: 'Nagercoil (Kanyakumari), Tamil Nadu', lat: 8.1960, lon: 77.4119 },
  karur: { name: 'Karur, Tamil Nadu', lat: 10.9601, lon: 78.0766 },
  kanchipuram: { name: 'Kanchipuram, Tamil Nadu', lat: 12.8342, lon: 79.7036 },
  kumbakonam: { name: 'Kumbakonam, Tamil Nadu', lat: 10.9602, lon: 79.3845 },
  cuddalore: { name: 'Cuddalore, Tamil Nadu', lat: 11.7480, lon: 79.7714 },
  pudukkottai: { name: 'Pudukkottai, Tamil Nadu', lat: 10.3797, lon: 78.8208 },
  villupuram: { name: 'Villupuram, Tamil Nadu', lat: 11.9922, lon: 79.5160 },
  puducherry: { name: 'Puducherry', lat: 11.9416, lon: 79.8083 },
  bengaluru: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  kochi: { name: 'Kochi, Kerala', lat: 9.9312, lon: 76.2673 },
  hyderabad: { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  delhi: { name: 'New Delhi (NCR)', lat: 28.6139, lon: 77.2090 },
  mumbai: { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
};

// Section 21 Category Chips: Hospitals, Clinics, Emergency, Pharmacy, Diagnostics
const MAP_CATEGORIES = [
  { id: 'all', label: 'All Healthcare', icon: Building2 },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'clinics', label: 'Clinics', icon: Stethoscope },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'diagnostics', label: 'Diagnostics', icon: Microscope },
];

function CareNestMapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmergency = searchParams.get('emergency') === 'true';

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(initialEmergency ? 'emergency' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCityKey, setCurrentCityKey] = useState<string>('chennai');
  const [userLocation, setUserLocation] = useState({ lat: 13.0827, lon: 80.2707 });
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

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
      emergencyOnly: activeCategory === 'emergency',
      userLat: userLocation.lat,
      userLon: userLocation.lon,
    });
    setFacilities(list);
    if (list.length > 0 && !selectedFacility) {
      setSelectedFacility(list[0]);
    }
  }, [activeCategory, userLocation]);

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

  const handleCityChange = (key: string) => {
    setCurrentCityKey(key);
    const hub = TAMIL_NADU_AND_INDIAN_HUBS[key];
    if (hub) {
      setUserLocation({ lat: hub.lat, lon: hub.lon });
    }
  };

  const calculateETA = (distanceKm?: number) => {
    if (!distanceKm) return '8 mins';
    const minutes = Math.max(5, Math.round(distanceKm * 2.4));
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours} hr ${rem} mins`;
    }
    return `${minutes} mins`;
  };

  // Filter facilities based on search and category
  const displayedFacilities = facilities.filter((f) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchCity = f.location.city.toLowerCase().includes(q);
      const matchType = f.facilityType.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchType) return false;
    }

    if (activeCategory === 'emergency') {
      return f.emergencyAvailable;
    }
    if (activeCategory === 'clinics') {
      return f.facilityType.toLowerCase().includes('clinic') || f.facilityType.toLowerCase().includes('centre');
    }
    if (activeCategory === 'pharmacy') {
      return f.facilityType.toLowerCase().includes('pharmacy');
    }
    if (activeCategory === 'diagnostics') {
      return f.facilityType.toLowerCase().includes('diagnostic') || f.facilityType.toLowerCase().includes('lab');
    }

    return true;
  });

  // Target query string for real Google Maps embed / search API
  const activeHubName = TAMIL_NADU_AND_INDIAN_HUBS[currentCityKey]?.name || 'Tamil Nadu, India';
  const mapSearchQuery = searchQuery.trim()
    ? `${searchQuery} in ${activeHubName}`
    : `${activeCategory === 'emergency' ? 'emergency hospitals' : activeCategory === 'all' ? 'hospitals' : activeCategory} in ${activeHubName}`;

  // Safe Google Maps URL
  const googleMapsUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(mapSearchQuery)}&center=${userLocation.lat},${userLocation.lon}&zoom=13&maptype=${mapType}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=${mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : 'm'}&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100 dark:bg-[#071827]">
      {/* ============================================================
          TOP SECTION (Section 21): Search Bar + Category Chips
         ============================================================ */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-2.5 max-w-4xl mx-auto pointer-events-auto">
        {/* Search Bar & City Selector Bar */}
        <div className="glass-panel p-2.5 sm:p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-white/70 dark:border-white/10">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-[#0866FF] dark:text-[#48DFFF] absolute left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, facilities, clinics or areas in Tamil Nadu..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl glass-input text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            {/* City Hub Switcher */}
            <select
              value={currentCityKey}
              onChange={(e) => handleCityChange(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-[#10283B]/90 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0866FF]/20"
            >
              {Object.entries(TAMIL_NADU_AND_INDIAN_HUBS).map(([k, hub]) => (
                <option key={k} value={k} className="bg-white dark:bg-[#071827] text-slate-900 dark:text-white">
                  {hub.name}
                </option>
              ))}
            </select>

            {/* GPS Location Button */}
            <button
              onClick={requestUserLocation}
              disabled={locationStatus === 'locating'}
              className="inline-flex items-center text-xs font-semibold text-[#0866FF] dark:text-[#48DFFF] hover:bg-blue-50/90 dark:hover:bg-blue-950/70 bg-white/80 dark:bg-[#10283B]/80 px-3 py-2 rounded-xl border border-blue-200/80 dark:border-blue-900/80 transition shrink-0 shadow-xs"
              title="Locate via GPS"
            >
              <LocateFixed className={`w-3.5 h-3.5 mr-1 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{locationStatus === 'locating' ? 'Locating...' : 'My GPS'}</span>
            </button>
          </div>
        </div>

        {/* Category Chips: Hospitals, Clinics, Emergency, Pharmacy, Diagnostics */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MAP_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0866FF] to-[#00C6D7] text-white shadow-blue-500/25 scale-105'
                    : 'glass-panel text-slate-700 dark:text-slate-200 hover:bg-white/95 dark:hover:bg-[#10283B]'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          CENTER SECTION (Section 20 & 21): Real Google Map Canvas
         ============================================================ */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          title="Google Maps CareNest Navigation"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={googleMapsUrl}
          className="w-full h-full"
        />

        {/* Map Type Controls (Roadmap / Satellite) */}
        <div className="absolute top-28 sm:top-24 right-4 z-20 hidden sm:flex bg-white/90 dark:bg-[#10283B]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition ${
              mapType === 'roadmap'
                ? 'bg-[#0866FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition ${
              mapType === 'satellite'
                ? 'bg-[#0866FF] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Floating Quick Markers Switcher / Hospital Carousel on Map */}
        <div className="absolute bottom-28 sm:bottom-32 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-2 pointer-events-auto max-w-4xl mx-auto scrollbar-none">
          {displayedFacilities.slice(0, 8).map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <button
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-lg border flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#0866FF] text-white border-[#0866FF] scale-105 shadow-blue-500/30 ring-2 ring-white/60 dark:ring-[#48DFFF]'
                    : 'glass-card text-slate-800 dark:text-slate-200 border-white/80 dark:border-slate-700/80 hover:scale-102'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#00C6D7]" />
                <span className="truncate max-w-[140px]">{fac.name}</span>
                {fac.distanceKm !== undefined && (
                  <span className="text-[10px] opacity-80">({formatDistance(fac.distanceKm)})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          BOTTOM SECTION (Section 21): Selected Hospital Glass Panel
         ============================================================ */}
      {selectedFacility && (
        <div className="absolute bottom-4 left-4 right-4 z-30 max-w-4xl mx-auto pointer-events-auto animate-in slide-in-from-bottom-6 duration-300">
          <div className="glass-panel p-4 sm:p-5 rounded-[2rem] shadow-2xl border border-white/70 dark:border-[#48DFFF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0866FF] dark:text-[#48DFFF] bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md">
                  {selectedFacility.facilityType}
                </span>
                {selectedFacility.emergencyAvailable && (
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/70 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                    🚨 24/7 Casualty
                  </span>
                )}
                {selectedFacility.rating && (
                  <span className="text-xs font-bold text-amber-500 flex items-center">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                    {selectedFacility.rating} ★
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {selectedFacility.name}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#0866FF] shrink-0" />
                  {selectedFacility.location.addressLine1}, {selectedFacility.location.city}
                </span>
                {selectedFacility.distanceKm !== undefined && (
                  <span className="font-bold text-[#0866FF] dark:text-[#48DFFF]">
                    • {formatDistance(selectedFacility.distanceKm)}
                  </span>
                )}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  ~{calculateETA(selectedFacility.distanceKm)}
                </span>
              </div>
            </div>

            {/* Action Buttons: [Directions] [Call] [Details] */}
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.location.latitude},${selectedFacility.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#0866FF] to-[#00C6D7] hover:from-[#0052cc] hover:to-[#00acc1] text-white shadow-md shadow-blue-500/25 transition active:scale-98"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                Directions
              </a>

              {selectedFacility.phone && (
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="inline-flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl font-semibold text-xs glass-card text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition active:scale-98"
                  title={`Call ${selectedFacility.phone}`}
                >
                  <Phone className="w-3.5 h-3.5 sm:mr-1 text-[#0866FF] dark:text-[#48DFFF]" />
                  <span className="hidden sm:inline">Call</span>
                </a>
              )}

              <Link
                href={`/facilities/${selectedFacility.id}`}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-2xl font-semibold text-xs glass-card text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition active:scale-98"
              >
                Details →
              </Link>
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
