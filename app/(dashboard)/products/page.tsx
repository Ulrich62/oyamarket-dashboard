import { getProducts } from "@/lib/actions/products";
import { formatXOF } from "@/lib/constants";
import Link from "next/link";
import { Plus, Package, ImageOff, ToggleLeft, ToggleRight, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleFeaturedButton } from "@/components/products/toggle-featured-button";
import { DeleteProductButton } from "@/components/products/delete-product-button";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">Catalogue</h1>
            {featuredCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 sm:px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400" />
                {featuredCount} en vedette
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
            {products.length} produit{products.length !== 1 ? "s" : ""} au catalogue
          </p>
        </div>
        <Link href="/products/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            <span className="hidden sm:inline">Nouveau produit</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 py-16 sm:py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev flex items-center justify-center">
            <Package className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="text-ink font-medium">Aucun produit</p>
            <p className="text-ink-3 text-xs sm:text-sm mt-1">
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

      {/* Products list */}
      {products.length > 0 && (
        <>
          {/* Mobile Product Cards (visible on < md) */}
          <div className="flex flex-col gap-3 md:hidden">
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
                <div
                  key={product.id}
                  className="rounded-2xl border border-line bg-bg-elev/40 p-4 flex flex-col gap-3 hover:border-ink-3/40 transition-colors"
                >
                  {/* Top: Image + Name + Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-bg-elev border border-line flex items-center justify-center overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-ink-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-ink text-sm hover:text-accent transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                            <ToggleRight className="w-3 h-3" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-4 bg-bg-elev border border-line px-2 py-0.5 rounded-full">
                            <ToggleLeft className="w-3 h-3" />
                            Brouillon
                          </span>
                        )}
                        {product.category && (
                          <span className="text-[11px] text-ink-4 truncate">
                            · {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Margin info */}
                  <div className="grid grid-cols-2 gap-2 bg-bg-elev-2/40 p-2.5 rounded-xl border border-line-soft text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-ink-4 block">
                        Prix vente
                      </span>
                      <span className="font-mono font-bold text-ink text-[13px]">
                        {formatXOF(product.price)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-ink-4 block">
                        Marge nette
                      </span>
                      {margin != null ? (
                        <span
                          className={
                            margin >= 0
                              ? "text-green-400 font-mono font-semibold"
                              : "text-red-400 font-mono font-semibold"
                          }
                        >
                          {formatXOF(margin)}
                          {marginPct != null && ` (${marginPct}%)`}
                        </span>
                      ) : (
                        <span className="text-ink-4">—</span>
                      )}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between pt-1 border-t border-line-soft gap-2">
                    <ToggleFeaturedButton
                      productId={product.id}
                      initialFeatured={product.isFeatured}
                      productName={product.name}
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 hover:text-ink bg-bg-elev hover:bg-bg-elev-2 border border-line px-3 py-1.5 rounded-xl transition-colors active:scale-95"
                      >
                        <span>Modifier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                        variant="icon"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/Tablet Table (visible on >= md) */}
          <div className="hidden md:block rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Produit
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Prix de vente
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Coût d'achat
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Marge
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Statut
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Accueil (Best-seller)
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Actions
                    </th>
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
                        <td className="px-4 py-3 min-w-[220px]">
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
                            <span className="font-medium text-ink line-clamp-1">{product.name}</span>
                          </div>
                        </td>

                        {/* Prix de vente */}
                        <td className="px-4 py-3 font-mono text-ink whitespace-nowrap">
                          {formatXOF(product.price)}
                        </td>

                        {/* Coût d'achat */}
                        <td className="px-4 py-3 font-mono text-ink-3 whitespace-nowrap">
                          {product.costPrice != null
                            ? formatXOF(product.costPrice)
                            : "—"}
                        </td>

                        {/* Marge */}
                        <td className="px-4 py-3 whitespace-nowrap">
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
                        <td className="px-4 py-3 whitespace-nowrap">
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

                        {/* Featured / Best-seller */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ToggleFeaturedButton
                            productId={product.id}
                            initialFeatured={product.isFeatured}
                            productName={product.name}
                          />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            <Link
                              href={`/products/${product.id}`}
                              className="inline-flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink transition-colors font-medium px-2.5 py-1.5 rounded-lg hover:bg-bg-elev shrink-0 whitespace-nowrap"
                            >
                              <span>Modifier</span>
                              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                            </Link>
                            <DeleteProductButton
                              productId={product.id}
                              productName={product.name}
                              variant="icon"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
