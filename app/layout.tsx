import type { Metadata, Viewport } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/hooks/use-language';
import { AccessibilityProvider } from '@/hooks/use-accessibility';
import { ThemeProvider } from '@/hooks/use-theme';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

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
  themeColor: '#0066FF',
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
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${poppins.className} antialiased selection:bg-[#0066FF]/20 selection:text-[#0066FF] dark:selection:bg-[#42D9FF]/20 dark:selection:text-[#42D9FF] transition-colors duration-200`}>
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
