import { getOrders } from "@/lib/actions/orders";
import { getDeliveryAgents, getCurrentUserRole } from "@/lib/actions/team";
import { formatXOF, formatDate, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { Plus, ShoppingCart, Phone, MapPin, MessageCircle, ArrowRight, Truck, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { cn, formatWhatsAppPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
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
  const rawStatus = params?.status;

  // Récupérer toutes les commandes pour des compteurs complets et stables
  const [allOrders, deliveryAgents, userContext] = await Promise.all([
    getOrders(),
    getDeliveryAgents(),
    getCurrentUserRole(),
  ]);

  const isDeliveryUser = userContext?.role === "DELIVERY";

  // Tab par défaut : "TO_PROCESS" pour admin/closer, "ALL" pour livreur
  const activeStatus = rawStatus || (isDeliveryUser ? "ALL" : "TO_PROCESS");

  const agentMap = new Map(
    deliveryAgents.map((a) => [
      a.userId,
      a.user.name || a.user.email || "Livreur",
    ])
  );

  // Compteurs globaux par statut
  const counts = allOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Compteur dédié pour les commandes à traiter (NEW + PENDING_CONFIRMATION + UNREACHABLE)
  const toProcessCount =
    (counts["NEW"] || 0) +
    (counts["PENDING_CONFIRMATION"] || 0) +
    (counts["UNREACHABLE"] || 0);

  // Filtrage des commandes selon l'onglet actif
  let orders = allOrders;
  if (activeStatus === "TO_PROCESS") {
    orders = allOrders.filter(
      (o) =>
        o.status === "NEW" ||
        o.status === "PENDING_CONFIRMATION" ||
        o.status === "UNREACHABLE"
    );
  } else if (activeStatus === "ALL") {
    orders = allOrders;
  } else {
    orders = allOrders.filter((o) => o.status === activeStatus);
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            {isDeliveryUser ? "Mes Livraisons" : "Commandes"}
          </h1>
          <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
            {orders.length} {isDeliveryUser ? "course" : "commande"}
            {orders.length !== 1 ? "s" : ""}
            {isDeliveryUser && " assignée" + (orders.length !== 1 ? "s" : "")}
            {activeStatus === "TO_PROCESS" && !isDeliveryUser && (
              <span className="text-amber-400 font-medium ml-1">
                à traiter ({toProcessCount})
              </span>
            )}
            {activeStatus !== "TO_PROCESS" && toProcessCount > 0 && !isDeliveryUser && (
              <span className="ml-1.5 text-amber-400 font-medium">
                · {toProcessCount} à traiter
              </span>
            )}
          </p>
        </div>
        {!isDeliveryUser && (
          <Link href="/orders/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Nouvelle commande</span>
              <span className="sm:hidden">Créer</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filtre par statuts avec Tab À traiter par défaut */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {/* TAB 1: À traiter (NEW + PENDING_CONFIRMATION + UNREACHABLE) - PAR DÉFAUT */}
        {!isDeliveryUser && (
          <Link
            href="/orders"
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap",
              activeStatus === "TO_PROCESS"
                ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm"
                : "bg-bg-elev border-line text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/30"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>À traiter</span>
            {toProcessCount > 0 && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.2 text-[10px] font-bold",
                  activeStatus === "TO_PROCESS"
                    ? "bg-amber-500/30 text-amber-200"
                    : "bg-amber-500/20 text-amber-400"
                )}
              >
                {toProcessCount}
              </span>
            )}
          </Link>
        )}

        {/* TAB 2: Toutes les commandes */}
        <Link
          href="/orders?status=ALL"
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
            activeStatus === "ALL"
              ? "bg-bg-elev-2 border-ink-3 text-ink"
              : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
          )}
        >
          Toutes
          {allOrders.length > 0 && (
            <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.2 text-[10px]">
              {allOrders.length}
            </span>
          )}
        </Link>

        {/* TABS INDIVIDUELLES PAR STATUT */}
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/orders?status=${opt.value}`}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              activeStatus === opt.value
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            {opt.label}
            {counts[opt.value] ? (
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
            {activeStatus === "TO_PROCESS" ? (
              <Clock className="w-7 h-7 text-amber-400" />
            ) : (
              <ShoppingCart className="w-7 h-7 text-ink-3" />
            )}
          </div>
          <div>
            <p className="text-ink font-medium">
              {activeStatus === "TO_PROCESS"
                ? "Aucune commande à traiter"
                : isDeliveryUser
                ? "Aucune livraison assignée"
                : "Aucune commande"}
            </p>
            <p className="text-ink-3 text-xs sm:text-sm mt-1">
              {activeStatus === "TO_PROCESS"
                ? "Toutes les commandes entrantes ont été confirmées ou traitées."
                : isDeliveryUser
                ? "Aucune course ne vous a été assignée pour le moment."
                : "Les commandes de votre boutique apparaîtront ici."}
            </p>
          </div>
          {activeStatus === "TO_PROCESS" ? (
            <Link href="/orders?status=ALL">
              <Button size="sm" variant="secondary">
                Voir toutes les commandes
              </Button>
            </Link>
          ) : (
            !isDeliveryUser && (
              <Link href="/orders/new">
                <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                  Créer une commande manuelle
                </Button>
              </Link>
            )
          )}
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
              const cleanPhone = formatWhatsAppPhone(order.customerPhone);

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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-ink-4">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        {order.assignedToId ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            <Truck className="w-3 h-3" />
                            <span className="truncate max-w-[110px]">{agentMap.get(order.assignedToId) || "Livreur"}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-ink-4/80 bg-bg-elev px-1.5 py-0.2 rounded border border-line-soft">
                            Non assigné
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Note preview if any */}
                  {order.notes && (
                    <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/25 text-[11px] text-yellow-300">
                      <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
                      <span className="line-clamp-2">{order.notes}</span>
                    </div>
                  )}

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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95 transition-all shadow-sm"
                        title="Ouvrir WhatsApp (+229)"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
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
                      Livreur
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
                  {orders.map((order) => {
                    const cleanPhone = formatWhatsAppPhone(order.customerPhone);
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors"
                      >
                        {/* Client */}
                        <td className="px-4 py-3 min-w-[210px]">
                          <div>
                            <p className="font-medium text-ink">{order.customerName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="text-[12px] text-ink-3 hover:text-ink flex items-center gap-1 whitespace-nowrap transition-colors"
                              >
                                <Phone className="w-3 h-3 shrink-0 text-ink-4" />
                                {order.customerPhone}
                              </a>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all shadow-sm"
                                  title="Contacter sur WhatsApp (+229)"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                            {order.notes && (
                              <p className="text-[11px] text-yellow-400/90 flex items-center gap-1 mt-1 truncate max-w-[230px]" title={order.notes}>
                                <FileText className="w-3 h-3 shrink-0 text-yellow-400" />
                                <span className="truncate">{order.notes}</span>
                              </p>
                            )}
                            {order.quartier && (
                              <span className="text-[11px] text-ink-4 block mt-0.5 truncate max-w-[220px]">
                                📍 {order.quartier}
                              </span>
                            )}
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
                          <p className="text-ink-4 truncate max-w-[160px]">
                            {order.items[0].packName || order.items[0].product?.name}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </p>
                        )}
                      </td>

                      {/* Livreur */}
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap">
                        {order.assignedToId ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[130px]">{agentMap.get(order.assignedToId) || "Livreur"}</span>
                          </span>
                        ) : (
                          <span className="text-ink-4 text-[11px] italic bg-bg-elev/50 px-2 py-0.5 rounded-md border border-line-soft">
                            Non assigné
                          </span>
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
