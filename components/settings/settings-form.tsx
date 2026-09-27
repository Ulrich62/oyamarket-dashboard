"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Workflow CAPI & Stratégie d'Attribution */}
        <div className="rounded-xl bg-bg-elev border border-line p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-4 font-mono uppercase tracking-wider">Workflow de tracking & Attribution Meta</p>
            <span className="text-[10px] bg-accent/10 text-accent font-medium px-2 py-0.5 rounded-full">
              EMQ Haute Précision
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              {
                step: "1",
                event: "Lead (Pixel + CAPI Dédupliqué)",
                trigger: "Soumission du formulaire vitrine (Recommandé en Cold Launch)",
                color: "text-blue-400",
                desc: "Déclenché simultanément par le navigateur et le serveur avec un event_id identique pour 0 doublon. C'est l'événement recommandé pour optimiser vos campagnes de cold testing (volume rapide)."
              },
              {
                step: "2",
                event: "Purchase (CAPI Post-Livraison)",
                trigger: "Passage au statut 'Livrée & Encaissée' (24h à 72h plus tard)",
                color: "text-accent",
                desc: "Envoyé uniquement après encaissement effectif des espèces à la livraison. Les numéros sont normalisés au format Bénin ARCEP (22901XXXXXXXX) pour un score EMQ maximal."
              },
            ].map((item) => (
              <div key={item.step} className="p-2.5 rounded-lg bg-bg-elev-2/60 border border-line/60 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bg-elev border border-line flex items-center justify-center text-[10px] font-mono text-ink-4 shrink-0">
                    {item.step}
                  </span>
                  <span className={`text-[12px] font-semibold ${item.color}`}>{item.event}</span>
                  <span className="text-[11px] text-ink-4 ml-auto text-right text-[10px]">— {item.trigger}</span>
                </div>
                <p className="text-[11px] text-ink-3 pl-7 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Règle d'attribution COD essentielle */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">⚠️ Règle d'Attribution Meta Ads Manager :</span> Pour le modèle Cash on Delivery au Bénin, la livraison intervient 24h à 72h après la commande. Configurez impérativement la fenêtre d'attribution de vos ensembles de publicités sur <strong className="text-white">« 7 jours après le clic / 1 jour après la vue »</strong> pour relier les événements Purchase CAPI aux annonces sources.
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
