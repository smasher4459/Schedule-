'use client';

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      // iOS doesn't support beforeinstallprompt — show manual instructions
      setShow(true);
    } else {
      // Android/desktop: listen for the install prompt
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => void }).prompt();
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[var(--primary)] text-white p-3 px-4 flex items-center gap-3 shadow-lg safe-area-top">
      <div className="flex-1 text-sm">
        {isIOS ? (
          <span>
            <strong>Install this app:</strong> Tap{' '}
            <span className="inline-block bg-white/20 rounded px-1.5 py-0.5 text-xs mx-0.5">
              Share ↑
            </span>{' '}
            then{' '}
            <span className="inline-block bg-white/20 rounded px-1.5 py-0.5 text-xs mx-0.5">
              Add to Home Screen
            </span>
          </span>
        ) : (
          <span>
            <strong>Install Staff Scheduler</strong> for quick access from your home screen
          </span>
        )}
      </div>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-white text-[var(--primary)] rounded-lg text-sm font-medium shrink-0"
        >
          Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="text-white/70 hover:text-white text-xl leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}
