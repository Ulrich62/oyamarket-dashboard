import { getDashboardKPIs, getOrdersOverTime, getStatusBreakdown, type PeriodFilter } from "@/lib/actions/analytics";
import { RevenueChart, FunnelChart, StatusPie } from "@/components/analytics/charts";
import { formatXOF } from "@/lib/constants";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Percent,
  AlertCircle,
  Plus,
  Package,
  ChartColumn,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params?.period ?? "30d") as PeriodFilter;

  const [kpis, chartData, statusBreakdown] = await Promise.all([
    getDashboardKPIs(period),
    getOrdersOverTime(period),
    getStatusBreakdown(period),
  ]);

  const funnelData = [
    { name: "Leads", value: kpis.funnel.leads },
    { name: "Confirmées", value: kpis.funnel.confirmed },
    { name: "Livrées", value: kpis.funnel.delivered },
  ];

  const KPI_CARDS = [
    {
      label: "CA Encaissé",
      value: formatXOF(kpis.revenue),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Taux de closing",
      value: `${kpis.closingRate}%`,
      icon: <Percent className="w-4 h-4" />,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Commandes totales",
      value: kpis.totalOrders,
      icon: <ShoppingCart className="w-4 h-4" />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Action requise",
      value: kpis.pendingAction,
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      highlight: kpis.pendingAction > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header + filtre période */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-3 mt-0.5">Vue d'ensemble de votre activité</p>
        </div>

        <div className="flex items-center gap-1 bg-bg-elev border border-line rounded-xl p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/?period=${p.value}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                period === p.value
                  ? "bg-bg-elev-2 text-ink"
                  : "text-ink-3 hover:text-ink"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <div
            key={card.label}
            className={cn(
              "rounded-2xl border bg-bg-elev/30 p-5 flex flex-col gap-3",
              card.highlight ? "border-yellow-400/30" : "border-line"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono">
                {card.label}
              </span>
              <span className={cn("p-1.5 rounded-lg", card.bg, card.color)}>
                {card.icon}
              </span>
            </div>
            <p className={cn("text-3xl font-bold tracking-tight", card.color)}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/orders/new"
          className="group flex items-center gap-3 rounded-2xl border border-line bg-bg-elev/30 px-5 py-4 hover:bg-bg-elev transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
            <Plus className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">Nouvelle commande</p>
            <p className="text-[11px] text-ink-4">Appel entrant, commande manuelle</p>
          </div>
        </Link>
        <Link
          href="/products/new"
          className="group flex items-center gap-3 rounded-2xl border border-line bg-bg-elev/30 px-5 py-4 hover:bg-bg-elev transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Package className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">Nouveau produit</p>
            <p className="text-[11px] text-ink-4">Ajouter au catalogue</p>
          </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-bg-elev/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono">
                CA encaissé
              </p>
              <p className="text-2xl font-bold text-ink mt-1">
                {formatXOF(kpis.revenue)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {kpis.deliveredCount} livraison{kpis.deliveredCount !== 1 ? "s" : ""}
            </div>
          </div>
          {chartData.length > 0 ? (
            <RevenueChart data={chartData} />
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-ink-4 text-sm">Aucune donnée sur la période</p>
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-6">
            Répartition des statuts
          </p>
          {statusBreakdown.length > 0 ? (
            <StatusPie data={statusBreakdown} />
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-ink-4 text-sm text-center">Aucune commande sur la période</p>
            </div>
          )}
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono">
              Funnel de conversion
            </p>
            <p className="text-sm text-ink-3 mt-1">
              Leads → Confirmations → Livraisons
            </p>
          </div>
          <Link
            href="/analytics"
            className="text-[12px] text-ink-3 hover:text-ink transition-colors flex items-center gap-1"
          >
            <ChartColumn className="w-3.5 h-3.5" />
            Analytics complet
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {funnelData.map((item, i) => (
            <div key={item.name} className="text-center">
              <p className="text-3xl font-bold text-ink">{item.value}</p>
              <p className="text-[11px] text-ink-4 mt-1">{item.name}</p>
              {i > 0 && funnelData[i - 1].value > 0 && (
                <p className="text-[10px] text-green-400 font-mono mt-0.5">
                  {Math.round((item.value / funnelData[i - 1].value) * 100)}% taux
                </p>
              )}
            </div>
          ))}
        </div>

        <FunnelChart data={funnelData} />
      </div>
    </div>
  );
}
