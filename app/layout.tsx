import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/hooks/use-language';
import { AccessibilityProvider } from '@/hooks/use-accessibility';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { OfflineBanner } from '@/components/layout/offline-banner';

export const metadata: Metadata = {
  title: 'CarePath AI | Find the right care. Take the right next step.',
  description:
    'CarePath AI is an educational healthcare navigation platform guiding users to verified medical facilities, care categories, and practical appointment next steps.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'CarePath AI | Healthcare Navigation Platform',
    description: 'Find the right care. Take the right next step safely.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-teal-100 selection:text-teal-900">
        <LanguageProvider>
          <AccessibilityProvider>
            <div className="flex min-h-screen flex-col bg-slate-50/60">
              <Header />
              <OfflineBanner />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 pb-20 lg:pb-12 overflow-y-auto">
                  {children}
                </main>
              </div>
              <BottomNav />
            </div>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
