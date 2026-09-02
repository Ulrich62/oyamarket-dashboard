import { getOrder } from "@/lib/actions/orders";
import { OrderDetail } from "@/components/orders/order-detail";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-ink-3 hover:text-ink transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Commandes
        </Link>
        <span className="text-ink-4">/</span>
        <span className="text-sm text-ink">{order.customerName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            {order.customerName}
          </h1>
          <p className="text-sm text-ink-3 mt-0.5 font-mono">
            #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderDetail order={order} />
    </div>
  );
}
