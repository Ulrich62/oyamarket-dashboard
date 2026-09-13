"use client";

import { useState } from "react";
import {
  Download,
  Smartphone,
  CheckCircle,
  X,
  Share,
  Laptop,
  Sparkles,
} from "lucide-react";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";

export function PwaInstallButton() {
  const { isInstallable, isInstalled, isIOS, isMac, promptInstall } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running as standalone PWA
  if (isInstalled) {
    return (
      <div
        title="Application installée et active en mode autonome sur cet appareil"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none cursor-default"
      >
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="hidden sm:inline font-semibold">App Active</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await promptInstall();
      if (ok) return;
    }

    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    // If native prompt is not directly available (Mac Chrome / Safari / Edge)
    setShowDesktopGuide(true);
  };

  return (
    <>
      {/* Visible PWA Install Button in Topbar */}
      <button
        onClick={handleClick}
        title={
          isMac
            ? "Installer OyaMarket sur votre Mac (PWA)"
            : "Installer l'application OyaMarket sur votre appareil"
        }
        aria-label="Installer l'application OyaMarket"
        className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/25 transition-all cursor-pointer active:scale-95 select-none"
      >
        <Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
        <span className="hidden sm:inline">
          {isMac ? "Installer sur Mac" : "Installer l'App"}
        </span>
        {/* Subtle Pulse Dot to catch user attention */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200" />
        </span>
      </button>

      {/* iOS Install Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-bg-elev border border-line rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 text-ink-3 hover:text-ink transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Installer sur iPhone / iPad</h4>
                <p className="text-[11px] text-ink-3">Recevez les alertes commandes en direct</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-ink-2 bg-bg-elev-2/50 p-3.5 rounded-xl border border-line-soft">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                  1
                </span>
                <p>
                  Appuyez sur le bouton de <strong>Partage</strong>{" "}
                  <Share className="inline h-3.5 w-3.5 text-indigo-400 mx-0.5" /> dans Safari.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                  2
                </span>
                <p>
                  Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                  3
                </span>
                <p>Lancez l'application depuis votre écran d'accueil et profitez des alertes push !</p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}

      {/* Mac / Desktop Install Guide Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-bg-elev border border-line rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowDesktopGuide(false)}
              className="absolute top-4 right-4 text-ink-3 hover:text-ink transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-ink">
                  {isMac ? "Installer OyaMarket sur votre Mac" : "Installer OyaMarket sur votre PC"}
                </h4>
                <p className="text-[11px] sm:text-xs text-ink-3">
                  Fonctionne comme une vraie application de bureau (Dock, fenêtres dédiées, alertes)
                </p>
              </div>
            </div>

            {/* Direct install try button if supported */}
            {isInstallable && (
              <button
                onClick={async () => {
                  const ok = await promptInstall();
                  if (ok) setShowDesktopGuide(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Installer maintenant (1 clic)</span>
              </button>
            )}

            <div className="space-y-3 text-xs text-ink-2 bg-bg-elev-2/60 p-4 rounded-xl border border-line-soft">
              <div className="font-semibold text-ink flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400">
                <span>Option 1 : Google Chrome / Brave / Edge</span>
              </div>
              <div className="space-y-2 pl-1">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                    A
                  </span>
                  <p>
                    Regardez <strong>tout à droite de votre barre d'adresse URL</strong> : cliquez sur la petite icône d'installation <strong>⊕</strong> (ou l'écran avec une flèche).
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                    B
                  </span>
                  <p>
                    Ou cliquez sur les <strong>3 petits points ⋮</strong> en haut à droite du navigateur ➔ <strong>Enregistrer et partager</strong> ➔ <strong>Installer OyaMarket</strong>.
                  </p>
                </div>
              </div>

              {isMac && (
                <>
                  <div className="pt-2 border-t border-line-soft font-semibold text-ink flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-indigo-400">
                    <span>Option 2 : Safari sur Mac</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                        1
                      </span>
                      <p>
                        Dans la barre de menu Apple tout en haut de votre écran, cliquez sur <strong>Fichier</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                        2
                      </span>
                      <p>
                        Sélectionnez <strong>« Ajouter au Dock... »</strong> pour épingler l'application !
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="w-full py-2.5 bg-bg-elev-2 hover:bg-bg-elev-3 text-ink-2 hover:text-ink font-medium text-xs rounded-xl border border-line transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
