import { getOrders } from "@/lib/actions/orders";
import { formatXOF, formatDate, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { Plus, ShoppingCart, Phone, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(ORDER_STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params?.status as OrderStatus | undefined;

  const orders = await getOrders(
    statusFilter ? { status: statusFilter } : undefined
  );

  // Compteurs par statut
  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const urgent = (counts["NEW"] || 0) + (counts["PENDING_CONFIRMATION"] || 0);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">Commandes</h1>
          <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
            {orders.length} commande{orders.length !== 1 ? "s" : ""}
            {urgent > 0 && (
              <span className="ml-1.5 text-yellow-400 font-medium">
                · {urgent} requi{urgent > 1 ? "èrent" : "ert"} action
              </span>
            )}
          </p>
        </div>
        <Link href="/orders/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            <span className="hidden sm:inline">Nouvelle commande</span>
            <span className="sm:hidden">Créer</span>
          </Button>
        </Link>
      </div>

      {/* Filtre par statuts */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/orders?status=${opt.value}` : "/orders"}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              statusFilter === opt.value || (!statusFilter && opt.value === "")
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            {opt.label}
            {opt.value && counts[opt.value] ? (
              <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.2 text-[10px]">
                {counts[opt.value]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 py-16 sm:py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="text-ink font-medium">Aucune commande</p>
            <p className="text-ink-3 text-xs sm:text-sm mt-1">
              Les commandes de votre boutique apparaîtront ici.
            </p>
          </div>
          <Link href="/orders/new">
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Créer une commande manuelle
            </Button>
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <>
          {/* Mobile Order Cards View (visible on < md) */}
          <div className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => {
              const totalUnits = order.items.reduce(
                (sum, item) => sum + (item.unitsCount || item.quantity),
                0
              );
              const cleanPhone = order.customerPhone.replace(/\D/g, "");

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-line bg-bg-elev/40 p-4 flex flex-col gap-3 hover:border-ink-3/40 transition-colors"
                >
                  {/* Top row: Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-ink text-[15px] hover:text-accent transition-colors truncate block"
                      >
                        {order.customerName}
                      </Link>
                      <span className="text-[10px] font-mono text-ink-4">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Contact & Location Info */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Call button */}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 active:scale-95 transition-all"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </a>

                    {/* WhatsApp button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {order.quartier && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-3 bg-bg-elev px-2 py-1 rounded-lg border border-line-soft">
                        <MapPin className="w-3 h-3 text-ink-4" />
                        <span className="truncate max-w-[150px]">{order.quartier}</span>
                      </span>
                    )}
                  </div>

                  {/* Product items summary */}
                  <div className="text-xs text-ink-3 bg-bg-elev-2/50 rounded-xl p-2.5 border border-line-soft flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="font-semibold text-ink">
                        {totalUnits} unité{totalUnits > 1 ? "s" : ""}
                      </span>
                      {order.items[0] && (
                        <span className="text-ink-4 ml-1.5">
                          · {order.items[0].packName || order.items[0].product?.name}
                          {order.items.length > 1 && ` (+${order.items.length - 1})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: Total + Date + Link */}
                  <div className="flex items-center justify-between pt-1 border-t border-line-soft">
                    <div>
                      <p className="font-mono text-base font-bold text-ink">
                        {formatXOF(order.totalAmount)}
                      </p>
                      <p className="text-[10px] text-ink-4">{formatDate(order.createdAt)}</p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
                    >
                      <span>Détails</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/Tablet Table View (visible on >= md) */}
          <div className="hidden md:block rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Client
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Statut
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Montant
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Produits
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors"
                    >
                      {/* Client */}
                      <td className="px-4 py-3 min-w-[200px]">
                        <div>
                          <p className="font-medium text-ink">{order.customerName}</p>
                          <p className="text-[12px] text-ink-3 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Phone className="w-3 h-3 shrink-0" />
                            {order.customerPhone}
                            {order.quartier && (
                              <span className="text-ink-4 ml-1">· {order.quartier}</span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3 font-mono text-ink font-medium whitespace-nowrap">
                        {formatXOF(order.totalAmount)}
                      </td>

                      {/* Produits */}
                      <td className="px-4 py-3 text-ink-3 text-[12px] whitespace-nowrap">
                        {order.items.reduce((sum, item) => sum + (item.unitsCount || item.quantity), 0)} unité{order.items.reduce((sum, item) => sum + (item.unitsCount || item.quantity), 0) > 1 ? "s" : ""}
                        {order.items[0] && (
                          <p className="text-ink-4 truncate max-w-[180px]">
                            {order.items[0].packName || order.items[0].product?.name}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-ink-3 text-[12px] whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink transition-colors font-medium px-2 py-1 rounded-md hover:bg-bg-elev"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
