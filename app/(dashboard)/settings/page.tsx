import { getStoreSettings } from "@/lib/actions/settings";
import { getCurrentMemberContext } from "@/lib/actions/store-context";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let context;
  try {
    context = await getCurrentMemberContext();
  } catch {
    context = null;
  }

  if (!context || context.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="max-w-md">
          <h1 className="text-xl font-semibold text-ink">Accès réservé aux administrateurs</h1>
          <p className="text-xs text-ink-3 mt-1.5 leading-relaxed">
            Seuls les administrateurs ont l&apos;autorisation de modifier les paramètres, le Pixel Meta, le token CAPI et les coordonnées de facturation de la boutique.
          </p>
        </div>
        <Link href="/orders">
          <Button size="sm" variant="secondary">
            Retourner aux commandes
          </Button>
        </Link>
      </div>
    );
  }

  let store;
  try {
    store = await getStoreSettings();
  } catch {
    store = null;
  }

  if (!store) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Paramètres</h1>
          <p className="text-sm text-ink-3 mt-0.5">Configuration de votre boutique</p>
        </div>
        <div className="rounded-2xl border border-dashed border-line bg-bg-elev/30 p-12 text-center">
          <p className="text-ink font-medium">Aucune boutique configurée</p>
          <p className="text-ink-3 text-sm mt-1">
            Votre compte n&apos;est associé à aucune boutique.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Paramètres</h1>
        <p className="text-sm text-ink-3 mt-0.5">
          Configuration de <span className="text-ink font-medium">{store.name}</span>
        </p>
      </div>

      <SettingsTabs store={store} />
    </div>
  );
}
