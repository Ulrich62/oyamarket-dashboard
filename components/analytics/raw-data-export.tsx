"use client";

import { useState } from "react";
import { Download, FileJson, Database, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RawDataExport({ currentPeriod = "30d" }: { currentPeriod?: string }) {
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (format: "json" | "sql") => {
    setDownloading(format);
    const url = `/api/v1/analytics/export?format=${format}&period=${selectedPeriod}`;
    
    // Créer un lien dynamique pour lancer le téléchargement natif du navigateur
    const a = document.createElement("a");
    a.href = url;
    a.download = `oyamarket-analytics.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloading(null);
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-line bg-gradient-to-r from-bg-elev via-bg-elev to-emerald-950/20 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Titre & Explication */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-semibold text-ink flex items-center gap-2">
              Export Télémétrie Brute & Données de Parcours
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                1st-Party
              </span>
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-3 leading-relaxed">
            Téléchargez l&apos;intégralité des micro-interactions de vos visiteurs (scroll, hésitations formulaires, choix de packs, rage clicks, réseau 3G/4G). Prêt pour vos analyses locales, Python ou IA.
          </p>
        </div>

        {/* Contrôles de téléchargement */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-9 px-3 text-xs bg-bg border border-line rounded-xl text-ink font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="today">Aujourd&apos;hui</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="all">Tout l&apos;historique</option>
          </select>

          {/* Bouton JSON */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDownload("json")}
            disabled={downloading !== null}
            className="gap-2 border-line hover:border-emerald-500/50 hover:bg-emerald-500/10 text-ink text-xs font-semibold rounded-xl h-9 cursor-pointer"
          >
            {downloading === "json" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Télécharger JSON</span>
          </Button>

          {/* Bouton SQL */}
          <Button
            size="sm"
            onClick={() => handleDownload("sql")}
            disabled={downloading !== null}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 text-xs font-semibold rounded-xl h-9 cursor-pointer"
          >
            {downloading === "sql" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Database className="w-3.5 h-3.5 text-white" />
            )}
            <span>Télécharger SQL</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
