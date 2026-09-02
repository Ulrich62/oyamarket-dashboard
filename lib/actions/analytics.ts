"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

async function getStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;
  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  return member.storeId;
}

export type PeriodFilter = "today" | "7d" | "30d";

function getPeriodStart(period: PeriodFilter): Date {
  const now = new Date();
  if (period === "today") return startOfDay(now);
  if (period === "7d") return subDays(now, 7);
  return subDays(now, 30);
}

export async function getDashboardKPIs(period: PeriodFilter = "30d") {
  const storeId = await getStoreId();
  const since = getPeriodStart(period);

  const [allOrders, periodOrders] = await Promise.all([
    prisma.order.findMany({
      where: { storeId },
      select: { status: true, totalAmount: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: since } },
      select: { status: true, totalAmount: true, createdAt: true },
    }),
  ]);

  // KPIs période
  const delivered = periodOrders.filter((o) => o.status === "DELIVERED");
  const revenue = delivered.reduce((sum, o) => sum + o.totalAmount, 0);

  const closingRate =
    periodOrders.length > 0
      ? Math.round((delivered.length / periodOrders.length) * 100)
      : 0;

  const pendingAction = allOrders.filter(
    (o) => o.status === "NEW" || o.status === "PENDING_CONFIRMATION"
  ).length;

  const toShip = allOrders.filter((o) => o.status === "CONFIRMED").length;

  // Funnel complet
  const total = periodOrders.length;
  const confirmed = periodOrders.filter(
    (o) =>
      o.status === "CONFIRMED" ||
      o.status === "SHIPPED" ||
      o.status === "DELIVERED"
  ).length;

  return {
    revenue,
    closingRate,
    pendingAction,
    toShip,
    totalOrders: periodOrders.length,
    deliveredCount: delivered.length,
    confirmedCount: confirmed,
    funnel: {
      leads: total,
      confirmed,
      delivered: delivered.length,
    },
  };
}

export async function getOrdersOverTime(period: PeriodFilter = "30d") {
  const storeId = await getStoreId();
  const since = getPeriodStart(period);

  const orders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: since } },
    select: { status: true, totalAmount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Grouper par jour
  const byDay: Record<string, { date: string; revenue: number; orders: number; delivered: number }> = {};

  for (const order of orders) {
    const day = order.createdAt.toISOString().split("T")[0];
    if (!byDay[day]) {
      byDay[day] = { date: day, revenue: 0, orders: 0, delivered: 0 };
    }
    byDay[day].orders++;
    if (order.status === "DELIVERED") {
      byDay[day].revenue += order.totalAmount;
      byDay[day].delivered++;
    }
  }

  return Object.values(byDay);
}

export async function getStatusBreakdown(period: PeriodFilter = "30d") {
  const storeId = await getStoreId();
  const since = getPeriodStart(period);

  const orders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: since } },
    select: { status: true },
  });

  const counts: Partial<Record<OrderStatus, number>> = {};
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }

  return Object.entries(counts).map(([status, count]) => ({
    status: status as OrderStatus,
    count,
  }));
}
