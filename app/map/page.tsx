'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { repository } from '@/lib/data/repository';
import { Facility } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/utils';

function MapPageContent() {
  const searchParams = useSearchParams();
  const initialEmergency = searchParams.get('emergency') === 'true';

  const { t } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(initialEmergency);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lon: -74.006 });
  const [locating, setLocating] = useState(false);

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
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setLocating(false);
        },
        () => {
          // Geolocation unavailable; continue with default coordinates
          setLocating(false);
        }
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar / Facilities List Panel */}
      <div className="w-full lg:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">{t.nav.map}</h1>
            <button
              onClick={requestUserLocation}
              disabled={locating}
              className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg transition"
            >
              <Crosshair className={`w-3.5 h-3.5 mr-1 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'Locating...' : 'My Location'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                emergencyOnly
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              24/7 Emergency Only
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
                    ? 'border-teal-600 bg-teal-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {fac.facilityType}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {fac.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                    {formatDistance(fac.distanceKm)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {fac.location.addressLine1}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
                    Open Now
                  </span>
                  <Link
                    href={`/facilities/${fac.id}`}
                    className="text-teal-700 font-bold hover:underline"
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

      {/* Main Interactive Map Canvas (Map visualization abstraction) */}
      <div className="flex-1 relative bg-slate-100 flex flex-col">
        {/* Visual Map Canvas Representation */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-6">
          <div className="w-full h-full max-w-4xl relative rounded-3xl border border-slate-300 bg-slate-50 shadow-inner flex flex-col justify-between p-6 overflow-hidden">
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-700 flex items-center space-x-2">
                <Navigation className="w-3.5 h-3.5 text-teal-700" />
                <span>Metropolis Health District Grid</span>
              </div>
              <div className="text-[11px] text-slate-400 bg-white/80 px-2 py-1 rounded-lg">
                Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)}
              </div>
            </div>

            {/* Pins Scatter Simulation */}
            <div className="relative w-full h-80 my-auto">
              {/* User location pin */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 group"
                title="Your Current Location"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md ring-4 ring-blue-400/40 animate-pulse" />
                <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md mt-1 shadow-sm">
                  You are here
                </span>
              </div>

              {/* Facility Pins */}
              {facilities.map((fac, idx) => {
                const isSelected = selectedFacility?.id === fac.id;
                // Distributed offsets for simulation
                const offsets = [
                  { top: '25%', left: '30%' },
                  { top: '35%', left: '70%' },
                  { top: '65%', left: '35%' },
                  { top: '75%', left: '65%' },
                  { top: '20%', left: '60%' },
                  { top: '80%', left: '20%' },
                ];
                const pos = offsets[idx % offsets.length];

                return (
                  <div
                    key={fac.id}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedFacility(fac)}
                    className="absolute cursor-pointer transition-transform hover:scale-110 z-10 flex flex-col items-center"
                  >
                    <div
                      className={`p-2 rounded-2xl shadow-md border-2 transition ${
                        isSelected
                          ? 'bg-teal-700 text-white border-white scale-125'
                          : fac.emergencyAvailable
                          ? 'bg-red-600 text-white border-white'
                          : 'bg-white text-slate-800 border-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold bg-white/95 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 mt-1 max-w-[120px] truncate shadow-xs">
                      {fac.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Facility Floating Bottom Card */}
            {selectedFacility && (
              <div className="z-10 bg-white rounded-2xl p-4 shadow-xl border border-slate-200 max-w-lg mx-auto w-full animate-in slide-in-from-bottom duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {selectedFacility.facilityType}
                    </span>
                    {selectedFacility.verified && (
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedFacility.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedFacility.location.addressLine1} •{' '}
                    <strong>{formatDistance(selectedFacility.distanceKm)}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={`tel:${selectedFacility.phone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                    title="Call Facility"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <Link href={`/facilities/${selectedFacility.id}`}>
                    <Button size="sm" className="text-xs">
                      Details & Hours
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading Interactive Map...
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
