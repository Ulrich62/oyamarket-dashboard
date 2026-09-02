import { getProducts } from "@/lib/actions/products";
import { NewOrderForm } from "@/components/orders/new-order-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const products = await getProducts();
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-ink-3 hover:text-ink transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Commandes
        </Link>
        <span className="text-ink-4">/</span>
        <span className="text-sm text-ink">Nouvelle commande</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Nouvelle commande</h1>
        <p className="text-sm text-ink-3 mt-0.5">
          Créez une commande manuellement (ex : prise d'appel entrant).
        </p>
      </div>

      {activeProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-bg-elev/30 p-12 text-center">
          <p className="text-ink font-medium">Aucun produit actif</p>
          <p className="text-ink-3 text-sm mt-1">
            Ajoutez et activez des produits avant de créer une commande.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Ajouter un produit →
          </Link>
        </div>
      ) : (
        <NewOrderForm products={activeProducts} />
      )}
    </div>
  );
}
