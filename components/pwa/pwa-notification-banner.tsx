"use client";

import { useState, useEffect } from "react";
import { BellRing, CheckCircle2, Download, Loader2, X, AlertCircle } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";

interface PwaNotificationBannerProps {
  storeId?: string;
}

export function PwaNotificationBanner({ storeId }: PwaNotificationBannerProps) {
  const [dismissed, setDismissed] = useState(true);
  const { permission, isSubscribed, loading, subscribe, sendTest } = usePushNotifications(storeId);
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  useEffect(() => {
    // Check if dismissed in localStorage
    const isDismissed = localStorage.getItem("oyamarket_pwa_banner_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("oyamarket_pwa_banner_dismissed", "true");
  };

  // If already subscribed and notifications granted, banner is not needed
  if (permission === "granted" && isSubscribed && !isInstallable) {
    return null;
  }

  // If user dismissed it
  if (dismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-bg-elev to-bg-elev p-4 text-ink shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="absolute top-0 right-0 p-3">
        <button
          onClick={handleDismiss}
          className="text-ink-4 hover:text-ink transition-colors p-1 rounded-lg hover:bg-bg-elev-2"
          aria-label="Fermer l'alerte"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <BellRing className="h-5 w-5 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <span>Ne manquez aucune commande OyaMarket</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA & Push
              </span>
            </h4>
            <p className="text-xs text-ink-3">
              Activez les notifications pour être averti instantanément (son + bannière Mac) dès qu'un client passe commande, même fenêtre réduite.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(!isSubscribed || permission !== "granted") && (
            <button
              onClick={async () => {
                const ok = await subscribe();
                if (ok) {
                  // Send a test immediately to confirm
                  setTimeout(() => {
                    sendTest();
                  }, 800);
                }
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Activer les alertes push</span>
            </button>
          )}

          {isInstallable && !isInstalled && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-bg border border-line text-ink-2 hover:text-ink hover:bg-bg-elev transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Installer l'App Mac</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
