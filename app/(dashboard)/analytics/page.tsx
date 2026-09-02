import {
  getDashboardKPIs,
  getOrdersOverTime,
  getStatusBreakdown,
  type PeriodFilter,
} from "@/lib/actions/analytics";
import { RevenueChart, FunnelChart, StatusPie } from "@/components/analytics/charts";
import { formatXOF, ORDER_STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";


export const dynamic = "force-dynamic";

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
];

export default async function AnalyticsPage({
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Analytics</h1>
          <p className="text-sm text-ink-3 mt-0.5">
            Performances et conversion de votre boutique
          </p>
        </div>

        <div className="flex items-center gap-1 bg-bg-elev border border-line rounded-xl p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/analytics?period=${p.value}`}
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

      {/* Métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CA Encaissé", value: formatXOF(kpis.revenue), note: "Commandes livrées uniquement" },
          { label: "Taux de Closing", value: `${kpis.closingRate}%`, note: "Livrées / Total commandes" },
          { label: "Commandes totales", value: kpis.totalOrders, note: "Toutes commandes de la période" },
          { label: "Livrées", value: kpis.deliveredCount, note: "Encaissement confirmé" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-bg-elev/30 p-5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono">{stat.label}</p>
            <p className="text-3xl font-bold text-ink mt-2">{stat.value}</p>
            <p className="text-[11px] text-ink-4 mt-1">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Revenue over time */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-6">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono">
            Évolution du chiffre d'affaires
          </p>
          <p className="text-2xl font-bold text-ink mt-1">{formatXOF(kpis.revenue)}</p>
        </div>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-ink-4 text-sm">Aucune donnée disponible sur cette période</p>
          </div>
        )}
      </div>

      {/* Funnel + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-4">
            Funnel de conversion
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {funnelData.map((item, i) => (
              <div key={item.name} className="text-center">
                <p className="text-2xl font-bold text-ink">{item.value}</p>
                <p className="text-[11px] text-ink-4 mt-1">{item.name}</p>
                {i > 0 && funnelData[i - 1].value > 0 && (
                  <p className="text-[10px] text-green-400 font-mono mt-0.5">
                    {Math.round((item.value / funnelData[i - 1].value) * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
          <FunnelChart data={funnelData} />
        </div>

        {/* Statuts */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-4">
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

      {/* Tableau récapitulatif des statuts */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-line">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-4 font-mono">
            Détail par statut
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">Statut</th>
              <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">Nombre</th>
              <th className="text-right px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">% du total</th>
            </tr>
          </thead>
          <tbody>
            {statusBreakdown
              .sort((a, b) => b.count - a.count)
              .map(({ status, count }) => {
                const config = ORDER_STATUS_CONFIG[status];
                const pct = kpis.totalOrders > 0
                  ? Math.round((count / kpis.totalOrders) * 100)
                  : 0;
                return (
                  <tr key={status} className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md", config.bg, config.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-ink">{count}</td>
                    <td className="px-6 py-3 text-right font-mono text-ink-3">{pct}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
