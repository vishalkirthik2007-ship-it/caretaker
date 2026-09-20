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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

const INDIAN_HUBS: Record<string, { name: string; lat: number; lon: number }> = {
  chennai: { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  bengaluru: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  delhi: { name: 'New Delhi (NCR)', lat: 28.6139, lon: 77.2090 },
  mumbai: { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  hyderabad: { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  kolkata: { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
  chandigarh: { name: 'Chandigarh, Punjab/Haryana', lat: 30.7333, lon: 76.7794 },
  vellore: { name: 'Vellore, Tamil Nadu', lat: 12.9165, lon: 79.1325 },
};

function MapPageContent() {
  const searchParams = useSearchParams();
  const initialEmergency = searchParams.get('emergency') === 'true';

  const { t } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(initialEmergency);
  const router = useRouter();
  const [currentCityKey, setCurrentCityKey] = useState<string>('chennai');
  const [userLocation, setUserLocation] = useState({ lat: 13.0827, lon: 80.2707 });
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'traffic'>('default');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const user = repository.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user?.city) {
      const matchedKey = Object.keys(INDIAN_HUBS).find((k) =>
        INDIAN_HUBS[k].name.toLowerCase().includes(user.city?.toLowerCase() || '')
      );
      if (matchedKey) {
        setCurrentCityKey(matchedKey);
        setUserLocation({
          lat: INDIAN_HUBS[matchedKey].lat,
          lon: INDIAN_HUBS[matchedKey].lon,
        });
      }
    }
  }, [router]);

  useEffect(() => {
    const list = repository.getFacilities({
      emergencyOnly,
      userLat: userLocation.lat,
      userLon: userLocation.lon,
    });
    setFacilities(list);
    if (list.length > 0 && !selectedFacility) {
      setSelectedFacility(list[0]);
    }
  }, [emergencyOnly, userLocation]);

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
    const hub = INDIAN_HUBS[key];
    if (hub) {
      setUserLocation({ lat: hub.lat, lon: hub.lon });
    }
  };

  // Estimate travel time (approximating Indian urban traffic at ~25 km/h -> ~2.4 min/km)
  const calculateETA = (distanceKm?: number) => {
    if (!distanceKm) return '5 - 10 mins';
    const minutes = Math.max(5, Math.round(distanceKm * 2.4));
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours} hr ${rem} mins`;
    }
    return `${minutes} mins`;
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar / Facilities List Panel */}
      <div className="w-full lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-teal-700 dark:text-teal-400" />
              {t.nav.map}
            </h1>

            <button
              onClick={requestUserLocation}
              disabled={locationStatus === 'locating'}
              className="inline-flex items-center text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 transition"
              title="Locate via GPS"
            >
              <LocateFixed className={`w-3.5 h-3.5 mr-1 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>{locationStatus === 'locating' ? 'Locating...' : 'My GPS'}</span>
            </button>
          </div>

          {/* Location Permission Status / Manual City Switcher */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Active City / Region (India):
            </label>
            <select
              value={currentCityKey}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-teal-700"
            >
              {Object.entries(INDIAN_HUBS).map(([k, hub]) => (
                <option key={k} value={k}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>

          {locationStatus === 'denied' && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
              GPS permission denied. Showing facilities using manual city selection.
            </p>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                emergencyOnly
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              🚨 24/7 Casualty Only
            </button>
            <span className="text-xs text-slate-400">
              {facilities.length} locations
            </span>
          </div>
        </div>

        {/* Scrollable Facility Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {facilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-teal-600 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {fac.facilityType}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {fac.name}
                    </h3>
                  </div>
                  {fac.distanceKm !== undefined && (
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md shrink-0">
                      {formatDistance(fac.distanceKm)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {fac.location.addressLine1}, {fac.location.city}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center text-[11px]">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    ETA: {calculateETA(fac.distanceKm)}
                  </span>
                  <Link
                    href={`/facilities/${fac.id}`}
                    className="text-teal-700 dark:text-teal-400 font-bold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Canvas (Google Maps Style) */}
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden">
        {/* Google Maps Style Controls Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>
              Google Maps Style • {INDIAN_HUBS[currentCityKey]?.name || 'India'}
            </span>
          </div>

          <div className="hidden sm:flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-1">
            <button
              onClick={() => setMapStyle('default')}
              className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition ${
                mapStyle === 'default'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition ${
                mapStyle === 'satellite'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('traffic')}
              className={`px-2.5 py-1 text-xs rounded-xl font-semibold transition ${
                mapStyle === 'traffic'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Traffic
            </button>
          </div>
        </div>

        {/* Live Coordinates Pill */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-[11px] text-slate-500 dark:text-slate-400">
          Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)}
        </div>

        {/* Embedded Map Canvas */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {apiKey ? (
            <iframe
              title="Google Map View"
              width="100%"
              height="100%"
              loading="lazy"
              className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner"
              src={`https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=hospitals+in+${encodeURIComponent(
                INDIAN_HUBS[currentCityKey]?.name || 'India'
              )}&center=${userLocation.lat},${userLocation.lon}&zoom=13`}
            />
          ) : (
            /* High-Fidelity Google Maps Vector Grid Simulation Canvas */
            <div
              className={`w-full h-full relative rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col justify-between p-6 overflow-hidden transition-colors ${
                mapStyle === 'satellite'
                  ? 'bg-slate-900 text-slate-100'
                  : 'bg-slate-100 dark:bg-slate-900/90'
              }`}
            >
              {/* Grid Roads & Highways SVG Background */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Simulated Highways */}
                <path d="M -100 200 Q 300 150 900 300" stroke="#f59e0b" strokeWidth="4" fill="none" />
                <path d="M 400 -100 Q 450 300 500 800" stroke="#3b82f6" strokeWidth="3" fill="none" />
                {mapStyle === 'traffic' && (
                  <>
                    <path d="M 100 220 Q 350 260 700 240" stroke="#ef4444" strokeWidth="4" fill="none" />
                    <path d="M 250 80 Q 400 160 550 400" stroke="#10b981" strokeWidth="3" fill="none" />
                  </>
                )}
              </svg>

              {/* Pins Scatter Canvas */}
              <div className="relative w-full h-full my-auto flex items-center justify-center">
                {/* User Current Location Pin */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30"
                  title="Your Current Location"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-4 ring-blue-400/40 animate-pulse" />
                  <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md mt-1 shadow-sm">
                    You are here
                  </span>
                </div>

                {/* Simulated Geographic Facility Pins */}
                {facilities.map((fac, idx) => {
                  const isSelected = selectedFacility?.id === fac.id;
                  const offsets = [
                    { top: '22%', left: '28%' },
                    { top: '30%', left: '72%' },
                    { top: '68%', left: '32%' },
                    { top: '78%', left: '68%' },
                    { top: '18%', left: '55%' },
                    { top: '82%', left: '22%' },
                    { top: '45%', left: '85%' },
                    { top: '55%', left: '15%' },
                  ];
                  const pos = offsets[idx % offsets.length];

                  return (
                    <div
                      key={fac.id}
                      style={{ top: pos.top, left: pos.left }}
                      onClick={() => setSelectedFacility(fac)}
                      className={`absolute cursor-pointer transition-all duration-200 z-20 flex flex-col items-center group ${
                        isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-2xl shadow-lg border-2 transition ${
                          isSelected
                            ? 'bg-teal-700 text-white border-white ring-4 ring-teal-500/40'
                            : fac.emergencyAvailable
                            ? 'bg-red-600 text-white border-white'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 mt-1 max-w-[130px] truncate shadow-xs">
                        {fac.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Facility Floating Bottom Card (Google Maps Style) */}
        {selectedFacility && (
          <div className="absolute bottom-6 left-4 right-4 max-w-xl mx-auto z-30">
            <Card className="p-4 sm:p-5 shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {selectedFacility.facilityType}
                  </span>
                  {selectedFacility.verified && (
                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                  {selectedFacility.emergencyAvailable && (
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded">
                      24/7 Trauma
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedFacility.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedFacility.location.addressLine1}, {selectedFacility.location.city}
                </p>

                <div className="flex items-center space-x-3 text-xs pt-1">
                  {selectedFacility.distanceKm !== undefined && (
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      📍 {formatDistance(selectedFacility.distanceKm)}
                    </span>
                  )}
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center">
                    <Car className="w-3.5 h-3.5 mr-1" />
                    ~{calculateETA(selectedFacility.distanceKm)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl"
                  title="Call Facility"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.location.latitude},${selectedFacility.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  Directions
                </a>

                <Link href={`/facilities/${selectedFacility.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Details
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading Google Maps Interactive Navigation...
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
