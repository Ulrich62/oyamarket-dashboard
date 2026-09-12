"use client";

import { useState } from "react";
import { Download, Smartphone, CheckCircle, X, Share } from "lucide-react";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";

export function PwaInstallButton() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalled) {
    return (
      <div 
        title="Application installée et active en mode autonome"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none"
      >
        <CheckCircle className="h-3 w-3 text-emerald-400" />
        <span>PWA Active</span>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIosGuide(true)}
          title="Installer OyaMarket sur votre iPhone / iPad"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-elev hover:bg-bg-elev-2 text-ink-2 hover:text-ink border border-line transition-all cursor-pointer"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Installer l'App</span>
        </button>

        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-bg-elev border border-line rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 text-ink-3 hover:text-ink transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">Installer sur iPhone / iPad</h4>
                  <p className="text-[11px] text-ink-3">Recevez les notifications push de commandes</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-ink-2 bg-bg-elev-2/50 p-3.5 rounded-xl border border-line-soft">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">1</span>
                  <p>Appuyez sur le bouton de <strong>Partage</strong> <Share className="inline h-3.5 w-3.5 text-indigo-400 mx-0.5" /> dans la barre de Safari.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">2</span>
                  <p>Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">3</span>
                  <p>Ouvrez l'application depuis votre écran et autorisez les notifications !</p>
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
      </>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={promptInstall}
        title="Installer l'application OyaMarket sur votre ordinateur ou mobile"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/20 transition-all cursor-pointer animate-in zoom-in-95 duration-150"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Installer l'App</span>
      </button>
    );
  }

  return null;
}
