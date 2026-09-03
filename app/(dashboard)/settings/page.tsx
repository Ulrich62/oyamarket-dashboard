import { getStoreSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { ApiIntegrationCard } from "@/components/settings/api-integration-card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
            Votre compte n'est associé à aucune boutique.
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

      <SettingsForm store={store} />
      
      <ApiIntegrationCard storeId={store.id} />
    </div>
  );
}
