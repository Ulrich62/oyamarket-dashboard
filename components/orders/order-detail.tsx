"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/badge";
import { updateOrderStatus, updateOrder, deleteOrder } from "@/lib/actions/orders";
import { formatXOF, formatDate, ORDER_STATUS_CONFIG } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";
import { Phone, MapPin, Package, Pencil, Check, X, Trash2, ChevronDown, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderItem, Product, ProductPack } from "@prisma/client";

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product; pack?: ProductPack | null })[];
};

interface OrderDetailProps {
  order: OrderWithItems;
}

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Inline editing states
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    quartier: order.quartier ?? "",
  });
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const startEdit = (field: string) => {
    setEditing(field);
  };

  const cancelEdit = () => {
    setEditing(null);
    setTempValues({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      quartier: order.quartier ?? "",
    });
  };

  const saveField = (field: string) => {
    startTransition(async () => {
      const result = await updateOrder(order.id, {
        [field]: tempValues[field as keyof typeof tempValues],
      });
      if ("error" in result) {
        toast.error("Erreur lors de la mise à jour");
      } else {
        toast.success("Modifié");
        setEditing(null);
        router.refresh();
      }
    });
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Statut mis à jour : ${ORDER_STATUS_CONFIG[newStatus].label}`);
      setStatusDropdown(false);
      router.refresh();
    });
  };

  const confirmDeleteOrder = () => {
    startDeleteTransition(async () => {
      try {
        await deleteOrder(order.id);
        toast.success("Commande supprimée avec succès");
        router.push("/orders");
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression de la commande");
      }
    });
  };

  const renderInlineField = ({
    field,
    label,
    value,
    icon,
  }: {
    field: string;
    label: string;
    value: string;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-line-soft last:border-0 group">
      <div className="flex-1 min-w-0 pr-3">
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-4 font-mono block mb-1">
          {label}
        </span>
        {editing === field ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              autoFocus
              value={tempValues[field as keyof typeof tempValues]}
              onChange={(e) =>
                setTempValues((v) => ({ ...v, [field]: e.target.value }))
              }
              className="flex-1 bg-bg-elev-2 border border-ink-3 rounded-lg px-3 py-1.5 text-[13px] text-ink outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveField(field);
                if (e.key === "Escape") cancelEdit();
              }}
            />
            <button
              onClick={() => saveField(field)}
              disabled={isPending}
              className="p-1.5 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-[13px] text-ink flex items-center gap-1.5 truncate">
            {icon}
            {value || <span className="text-ink-4 italic">Non renseigné</span>}
          </p>
        )}
      </div>
      {editing !== field && (
        <button
          onClick={() => startEdit(field)}
          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-bg-elev text-ink-4 hover:text-ink-2"
          title="Modifier ce champ"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  const cleanPhone = order.customerPhone.replace(/\D/g, "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne principale */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Informations client */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-ink">Informations client</h2>
          </div>
          <div className="flex flex-col">
            {renderInlineField({
              field: "customerName",
              label: "Nom complet",
              value: order.customerName,
              icon: <User className="w-3.5 h-3.5 text-ink-4" />,
            })}
            {renderInlineField({
              field: "customerPhone",
              label: "Téléphone",
              value: order.customerPhone,
              icon: <Phone className="w-3.5 h-3.5 text-ink-4" />,
            })}
            {renderInlineField({
              field: "quartier",
              label: "Quartier / Zone",
              value: order.quartier ?? "",
              icon: <MapPin className="w-3.5 h-3.5 text-ink-4" />,
            })}
          </div>

          {/* Quick Call & WhatsApp Action Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-2 border-t border-line-soft">
            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler le client</span>
            </a>
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ouvrir dans WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Articles commandés */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-4 sm:p-6">
          <h2 className="text-sm font-medium text-ink mb-4">Articles commandés</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-bg-elev border border-line-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-bg-elev-2 flex items-center justify-center">
                    {item.product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-ink-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{item.product.name}</p>
                    {item.packName ? (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Pack : {item.packName} ({item.unitsCount} {item.unitsCount > 1 ? "unités" : "unité"})
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-4">
                        {item.quantity} × {formatXOF(item.unitPrice || item.price)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-ink font-medium text-[13px]">
                    {formatXOF(item.totalPrice || item.price)}
                  </p>
                  {item.packName && (
                    <span className="text-[10px] text-ink-4">
                      {item.quantity} {item.quantity > 1 ? "packs" : "pack"}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t border-line mt-1">
              <p className="text-sm font-medium text-ink-3">Total</p>
              <p className="font-mono text-lg font-semibold text-ink">
                {formatXOF(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne secondaire */}
      <div className="flex flex-col gap-4">
        {/* Statut COD */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-3">Statut de la commande</p>

          <div className="relative">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              disabled={isPending}
              className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-bg-elev border border-line hover:bg-bg-elev-2 transition-colors"
            >
              <StatusBadge status={order.status} />
              <ChevronDown className={cn("w-4 h-4 text-ink-3 transition-transform", statusDropdown && "rotate-180")} />
            </button>

            {statusDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-line bg-[#111] shadow-xl overflow-hidden">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value as OrderStatus)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-[13px] transition-colors hover:bg-bg-elev",
                      order.status === opt.value ? "bg-bg-elev-2 text-ink" : "text-ink-2"
                    )}
                  >
                    <StatusBadge status={opt.value as OrderStatus} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-2xl border border-line bg-bg-elev/30 p-5 flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono">Détails</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-3">Créée le</span>
              <span className="text-ink">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-3">Mise à jour</span>
              <span className="text-ink">{formatDate(order.updatedAt)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-ink-3">Référence</span>
              <span className="text-ink font-mono text-[10px] bg-bg-elev px-1.5 py-0.5 rounded">
                #{order.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          icon={<Trash2 className="w-3.5 h-3.5" />}
          className="w-full justify-center cursor-pointer"
        >
          Supprimer la commande
        </Button>
      </div>

      {/* Confirmation Modal for Order Deletion */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteOrder}
        title="Supprimer définitivement cette commande ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement la commande #${order.id.slice(-8).toUpperCase()} (${order.customerName}) ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Conserver la commande"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
