import { getOrders } from "@/lib/actions/orders";
import { formatXOF, formatDate, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { Plus, ShoppingCart, Phone } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Commandes</h1>
          <p className="text-sm text-ink-3 mt-0.5">
            {orders.length} commande{orders.length !== 1 ? "s" : ""}
            {urgent > 0 && (
              <span className="ml-2 text-yellow-400 font-medium">
                · {urgent} nécessite{urgent > 1 ? "nt" : ""} une action
              </span>
            )}
          </p>
        </div>
        <Link href="/orders/new">
          <Button icon={<Plus className="w-4 h-4" />}>Nouvelle commande</Button>
        </Link>
      </div>

      {/* Filtre par statuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/orders?status=${opt.value}` : "/orders"}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              statusFilter === opt.value || (!statusFilter && opt.value === "")
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            {opt.label}
            {opt.value && counts[opt.value] ? (
              <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.5 text-[10px]">
                {counts[opt.value]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="text-ink font-medium">Aucune commande</p>
            <p className="text-ink-3 text-sm mt-1">
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

      {/* Table */}
      {orders.length > 0 && (
        <div className="rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Montant
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Produits
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors"
                >
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-ink">{order.customerName}</p>
                      <p className="text-[12px] text-ink-3 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                        {order.quartier && (
                          <span className="text-ink-4 ml-1">· {order.quartier}</span>
                        )}
                      </p>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Montant */}
                  <td className="px-4 py-3 font-mono text-ink font-medium">
                    {formatXOF(order.totalAmount)}
                  </td>

                  {/* Produits */}
                  <td className="px-4 py-3 text-ink-3 text-[12px]">
                    {order.items.length} article{order.items.length !== 1 ? "s" : ""}
                    {order.items[0]?.product?.name && (
                      <p className="text-ink-4 truncate max-w-[140px]">
                        {order.items[0].product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1}`}
                      </p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-ink-3 text-[12px] whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-[12px] text-ink-3 hover:text-ink transition-colors font-medium"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
