import React, { useState, useEffect } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'kawral_pwa_banner_dismissed';
const DISMISS_DURATION_DAYS = 7;

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already running as installed standalone PWA
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      return isWindowStandalone || isNavStandalone;
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if user dismissed recently
    const dismissedTime = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedTime) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) && !/chrome|crios|fxios|optios|edgios/.test(userAgent);

    if (isAppleDevice) {
      setIsIOS(true);
    }

    // 4. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Reveal banner after brief delay
      setTimeout(() => setIsVisible(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS Safari, reveal banner after slight delay
    if (isAppleDevice && isSafari) {
      const timer = setTimeout(() => setIsVisible(true), 3500);
      return () => clearTimeout(timer);
    }

    // If neither trigger happened within 4s on mobile devices, display guide banner
    const fallbackTimer = setTimeout(() => {
      const isMobile = /android|iphone|ipad|ipod/.test(userAgent);
      if (isMobile && !checkStandalone()) {
        setIsVisible(true);
      }
    }, 4000);

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };
    // Listen for manual trigger (e.g. from footer button)
    const handleManualOpen = () => {
      setIsVisible(true);
      setShowGuide(true);
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleManualOpen);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
      }
    } else {
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  };

  if (!isVisible || isStandalone || isInstalled) {
    return null;
  }

  return (
    <aside
      aria-label="Installation de l'application Kawral"
      className="fixed z-50 transition-all duration-300 animate-slide-up
        bottom-[calc(80px+env(safe-area-inset-bottom,0px))] sm:bottom-6
        left-3 right-3 sm:left-auto sm:right-6 sm:w-[390px]
        bg-white/95 backdrop-blur-xl
        border border-kawral-green/20 rounded-2xl
        shadow-2xl shadow-slate-900/15
        p-4 select-none"
    >
      {/* ── Top Bar: App Icon + Header Info + Close Button ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* App Squircle Icon */}
          <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-kawral-green/10">
            <img
              src="/images/kawral-app-icon.png"
              alt="Kawral App"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                Kawral Sénégal
              </h3>
              <span className="inline-flex items-center gap-0.5 bg-kawral-green/10 text-kawral-green text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                App
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Accès rapide • Sans téléchargement Store
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
          title="Fermer"
          aria-label="Fermer la notification d'installation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Brief Value Pitch ── */}
      <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
        Installez Kawral sur votre écran d'accueil pour une expérience fluide, rapide et accessible en 1 clic.
      </p>

      {/* ── iOS Step-by-Step Guide or Expandable Help ── */}
      {(isIOS || showGuide) && (
        <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2 text-slate-700 animate-fade-in">
          <p className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-kawral-orange" />
            Comment installer sur votre téléphone :
          </p>

          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-kawral-green text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
              1
            </span>
            <span className="text-[11px]">
              Touchez l'icône <strong className="inline-flex items-center gap-1 font-semibold text-slate-900">Partager <Share className="w-3 h-3 inline text-kawral-green" /></strong> dans Safari ou le menu de votre navigateur.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-kawral-green text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
              2
            </span>
            <span className="text-[11px]">
              Faites défiler et appuyez sur <strong className="inline-flex items-center gap-1 font-semibold text-slate-900">« Sur l'écran d'accueil » <PlusSquare className="w-3 h-3 inline text-kawral-orange" /></strong>.
            </span>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-slate-100">
        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-kawral-orange hover:bg-kawral-orange-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Installer l'application
          </button>
        ) : isIOS ? (
          <button
            onClick={handleDismiss}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-kawral-green hover:bg-[#0d2e29] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            J'ai compris
          </button>
        ) : (
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-kawral-green hover:bg-[#0d2e29] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            {showGuide ? 'Masquer le guide' : 'Comment installer ?'}
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Plus tard
        </button>
      </div>
    </aside>
  );
};
