import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Search,
  Building2,
  FileCheck,
  HeartHandshake,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200/80 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-teal-700" />
            <span>Healthcare Navigation & Information Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            Find the right care.{' '}
            <span className="text-teal-700 block mt-1">Take the right next step.</span>
          </h1>

          <p className="text-lg text-slate-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            CarePath AI understands your healthcare-navigation questions and guides you
            toward appropriate verified facilities, specialist services, and practical appointment preparation.
          </p>

          {/* Core CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 shadow-md">
                <span>Enter Navigation Dashboard</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/assistant" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Bot className="w-5 h-5 mr-2 text-teal-700" />
                <span>Ask CarePath AI</span>
              </Button>
            </Link>
          </div>

          {/* Crucial Ethical Boundary Notice */}
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-left flex items-start space-x-3 text-amber-900 text-xs sm:text-sm max-w-2xl mx-auto mt-6">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Care Navigation Disclaimer</span>
              <p className="text-amber-800 leading-relaxed text-xs">
                CarePath AI is an educational navigation system. It does not provide medical diagnoses, write prescriptions, or replace consultation with licensed healthcare professionals. In life-threatening emergencies, dial 112, 911, or 108 immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Service Finder</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Search naturally using everyday language. CarePath maps symptoms and needs to verified medical categories—from primary clinics to specialized imaging labs.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Facility Directory</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find nearby hospitals, urgent care centers, and clinics with verified opening hours, accessibility notes, languages supported, and direct contact details.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Guided Care Journeys</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Step-by-step checklists, doctor question generators, and a client-encrypted document vault so you walk into appointments confident and organized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
