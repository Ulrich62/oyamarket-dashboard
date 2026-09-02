import { getProducts } from "@/lib/actions/products";
import { formatXOF } from "@/lib/constants";
import Link from "next/link";
import { Plus, Package, ImageOff, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Catalogue</h1>
          <p className="text-sm text-ink-3 mt-0.5">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/products/new">
          <Button icon={<Plus className="w-4 h-4" />}>Nouveau produit</Button>
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev flex items-center justify-center">
            <Package className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="text-ink font-medium">Aucun produit</p>
            <p className="text-ink-3 text-sm mt-1">
              Commencez par ajouter votre premier produit.
            </p>
          </div>
          <Link href="/products/new">
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Ajouter un produit
            </Button>
          </Link>
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Produit
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Prix de vente
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Coût d'achat
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Marge
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Statut
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const margin =
                  product.costPrice != null
                    ? product.price - product.costPrice
                    : null;
                const marginPct =
                  margin != null && product.price > 0
                    ? Math.round((margin / product.price) * 100)
                    : null;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors"
                  >
                    {/* Produit */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-elev flex items-center justify-center overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="w-4 h-4 text-ink-4" />
                          )}
                        </div>
                        <span className="font-medium text-ink">{product.name}</span>
                      </div>
                    </td>

                    {/* Prix de vente */}
                    <td className="px-4 py-3 font-mono text-ink">
                      {formatXOF(product.price)}
                    </td>

                    {/* Coût d'achat */}
                    <td className="px-4 py-3 font-mono text-ink-3">
                      {product.costPrice != null
                        ? formatXOF(product.costPrice)
                        : "—"}
                    </td>

                    {/* Marge */}
                    <td className="px-4 py-3">
                      {margin != null ? (
                        <span
                          className={
                            margin >= 0
                              ? "text-green-400 font-mono text-[12px]"
                              : "text-red-400 font-mono text-[12px]"
                          }
                        >
                          {formatXOF(margin)}
                          {marginPct != null && (
                            <span className="text-ink-4 ml-1">({marginPct}%)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-ink-4">—</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-400">
                          <ToggleRight className="w-4 h-4" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-4">
                          <ToggleLeft className="w-4 h-4" />
                          Brouillon
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-[12px] text-ink-3 hover:text-ink transition-colors font-medium"
                      >
                        Modifier →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
