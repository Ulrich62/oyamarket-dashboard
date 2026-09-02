import { OrderStatus } from "@prisma/client";

// Mapping des statuts COD vers leur libellé français et couleur
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  NEW: {
    label: "Nouveau",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
  },
  PENDING_CONFIRMATION: {
    label: "En attente de confirmation",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    dot: "bg-yellow-400",
  },
  CONFIRMED: {
    label: "Confirmée",
    color: "text-green-400",
    bg: "bg-green-400/10",
    dot: "bg-green-400",
  },
  UNREACHABLE: {
    label: "Injoignable",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    dot: "bg-orange-400",
  },
  SHIPPED: {
    label: "Expédiée",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    dot: "bg-purple-400",
  },
  DELIVERED: {
    label: "Livrée & Encaissée",
    color: "text-accent",
    bg: "bg-accent/10",
    dot: "bg-accent",
  },
  FAILED_DELIVERY: {
    label: "Livraison échouée",
    color: "text-red-400",
    bg: "bg-red-400/10",
    dot: "bg-red-400",
  },
  CANCELED: {
    label: "Annulée",
    color: "text-ink-3",
    bg: "bg-ink-4/20",
    dot: "bg-ink-3",
  },
};

// Formater un montant en FCFA
export function formatXOF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formater une date en français
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
