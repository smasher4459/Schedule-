import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import InstallBanner from '@/components/layout/InstallBanner';
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Staff Scheduler',
  description: 'Staff scheduling application for multi-service venues',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Staff Scheduler',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen">
        <ServiceWorkerRegistrar />
        <InstallBanner />
        <div className="flex h-screen">
          <Navigation />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
