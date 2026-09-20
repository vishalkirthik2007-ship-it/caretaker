import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/hooks/use-language';
import { AccessibilityProvider } from '@/hooks/use-accessibility';
import { ThemeProvider } from '@/hooks/use-theme';


export const metadata: Metadata = {
  title: 'CarePath AI | Find the right care. Take the right next step.',
  description:
    'CarePath AI is an educational healthcare navigation platform guiding users in India to verified medical facilities, care categories, and practical appointment next steps.',
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

import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900 dark:selection:text-teal-100 transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              <AuthGuard>
                <AppShell>{children}</AppShell>
              </AuthGuard>
            </AccessibilityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
