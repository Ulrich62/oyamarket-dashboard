"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatXOF, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";

// ─── Revenue Area Chart ───────────────────────────────────────────────────────

interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c9f266" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#c9f266" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(250,248,243,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          }
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid rgba(250,248,243,0.1)",
            borderRadius: "12px",
            fontSize: 12,
          }}
          labelStyle={{ color: "#a1a1aa" }}
          itemStyle={{ color: "#c9f266" }}
          formatter={(v) => [formatXOF(Number(v)), "CA encaissé"]}
          labelFormatter={(l) =>
            new Date(String(l)).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })
          }
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#c9f266"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#c9f266" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Funnel Bar Chart ─────────────────────────────────────────────────────────

interface FunnelChartProps {
  data: { name: string; value: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(250,248,243,0.06)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid rgba(250,248,243,0.1)",
            borderRadius: "12px",
            fontSize: 12,
          }}
          itemStyle={{ color: "#faf8f3" }}
          cursor={{ fill: "rgba(250,248,243,0.04)" }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((_, idx) => (
            <Cell
              key={idx}
              fill={
                idx === 0 ? "#4f46e5" : idx === 1 ? "#22c55e" : "#c9f266"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Status Pie Chart ─────────────────────────────────────────────────────────

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  NEW: "#3b82f6",
  PENDING_CONFIRMATION: "#eab308",
  CONFIRMED: "#22c55e",
  SHIPPED: "#a855f7",
  DELIVERED: "#c9f266",
  FAILED_DELIVERY: "#ef4444",
  CANCELED: "#52525b",
  UNREACHABLE: "#f97316",
};

interface StatusPieProps {
  data: { status: OrderStatus; count: number }[];
}

export function StatusPie({ data }: StatusPieProps) {
  const chartData = data.map((d) => ({
    name: ORDER_STATUS_CONFIG[d.status].label,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? "#71717a",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid rgba(250,248,243,0.1)",
            borderRadius: "12px",
            fontSize: 12,
          }}
          itemStyle={{ color: "#faf8f3" }}
          formatter={(v, n) => [Number(v), String(n)]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "#71717a" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
