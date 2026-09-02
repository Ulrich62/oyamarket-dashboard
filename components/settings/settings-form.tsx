"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStoreSettings } from "@/lib/actions/settings";
import { Eye, EyeOff, Save, ExternalLink } from "lucide-react";
import type { Store } from "@prisma/client";

interface SettingsFormProps {
  store: Store;
}

const CURRENCY_OPTIONS = [
  { value: "XOF", label: "Franc CFA (XOF / FCFA)" },
  { value: "USD", label: "Dollar américain (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

export function SettingsForm({ store }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [showCapiToken, setShowCapiToken] = useState(false);

  const [formData, setFormData] = useState({
    name: store.name,
    currency: store.currency,
    pixelId: store.pixelId ?? "",
    capiToken: store.capiToken ?? "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateStoreSettings(formData);
      if ("error" in result && result.error) {
        toast.error("Erreur lors de l'enregistrement");
      } else {
        toast.success("Paramètres enregistrés");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Général */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-ink">Paramètres généraux</h2>

        <Input
          id="name"
          label="Nom de la boutique *"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
            Devise principale
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            className="w-full rounded-lg bg-bg-elev border border-line py-2.5 px-3.5 text-[13px] text-ink outline-none transition focus:border-ink-3"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#111]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracking Meta */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Tracking Meta Pixel & CAPI</h2>
            <p className="text-[12px] text-ink-3 mt-1">
              L'événement <code className="text-accent text-[11px] bg-accent/10 px-1 py-0.5 rounded">Purchase</code> est
              déclenché automatiquement via CAPI lorsqu'une commande passe au statut{" "}
              <span className="text-accent">Livrée & Encaissée</span>.
            </p>
          </div>
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink transition-colors"
          >
            Events Manager <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <Input
          id="pixelId"
          label="ID du Meta Pixel"
          placeholder="ex: 1234567890123456"
          value={formData.pixelId}
          onChange={(e) => handleChange("pixelId", e.target.value)}
          hint="Trouvez cet ID dans votre Events Manager → Paramètres du pixel"
        />

        <div className="flex flex-col gap-1.5">
          <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
            Token d'accès CAPI
          </label>
          <div className="relative">
            <input
              type={showCapiToken ? "text" : "password"}
              value={formData.capiToken}
              onChange={(e) => handleChange("capiToken", e.target.value)}
              placeholder="EAA…"
              className="w-full rounded-lg bg-bg-elev border border-line py-2.5 px-3.5 pr-10 text-[13px] text-ink placeholder:text-ink-4 outline-none transition focus:border-ink-3"
            />
            <button
              type="button"
              onClick={() => setShowCapiToken(!showCapiToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors"
            >
              {showCapiToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-ink-4">
            Générez ce token dans Events Manager → Paramètres → Conversions API
          </p>
        </div>

        {/* Workflow CAPI */}
        <div className="rounded-xl bg-bg-elev border border-line p-4">
          <p className="text-[11px] text-ink-4 font-mono mb-3 uppercase tracking-wider">Workflow de tracking</p>
          <div className="flex flex-col gap-2">
            {[
              { step: "1", event: "Lead (Pixel + CAPI)", trigger: "Soumission du formulaire vitrine", color: "text-blue-400" },
              { step: "2", event: "Purchase (CAPI uniquement)", trigger: "Passage au statut Livrée & Encaissée", color: "text-accent" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-bg-elev-2 border border-line flex items-center justify-center text-[10px] font-mono text-ink-4 shrink-0">
                  {item.step}
                </span>
                <div className="flex-1">
                  <span className={`text-[12px] font-medium ${item.color}`}>{item.event}</span>
                  <span className="text-[11px] text-ink-4 ml-2">— {item.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        loading={isPending}
        icon={<Save className="w-4 h-4" />}
        className="self-start"
      >
        Enregistrer les paramètres
      </Button>
    </form>
  );
}
