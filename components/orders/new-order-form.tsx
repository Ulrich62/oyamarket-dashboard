"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOrder } from "@/lib/actions/orders";
import { formatXOF } from "@/lib/constants";
import { Plus, Trash2, Package } from "lucide-react";
import type { Product } from "@prisma/client";

interface NewOrderFormProps {
  products: Product[];
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export function NewOrderForm({ products }: NewOrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quartier, setQuartier] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id ?? ""
  );

  const addItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existing = items.findIndex((i) => i.productId === product.id);
    if (existing >= 0) {
      // Incrémenter la quantité si déjà présent
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existing ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
          productName: product.name,
        },
      ]);
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemQty = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const updateItemPrice = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, price } : item))
    );
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        customerName,
        customerPhone,
        quartier: quartier || undefined,
        items: items.map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          price,
        })),
      });

      if ("error" in result && result.error) {
        toast.error("Erreur lors de la création");
        return;
      }

      toast.success("Commande créée");
      router.push("/orders");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Client */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-ink">Informations client</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="customerName"
                label="Nom complet *"
                placeholder="ex: Adama Traoré"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                id="customerPhone"
                label="Téléphone *"
                placeholder="ex: +229 97 00 00 00"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <Input
              id="quartier"
              label="Quartier / Zone de livraison"
              placeholder="ex: Cadjehoun, Cotonou"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
            />
          </div>

          {/* Articles */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-ink">Articles</h2>

            {/* Sélecteur produit */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono mb-1.5">
                  Ajouter un produit
                </label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {formatXOF(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                onClick={addItem}
                disabled={products.length === 0}
              >
                Ajouter
              </Button>
            </div>

            {/* Liste des articles */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Package className="w-6 h-6 text-ink-4" />
                <p className="text-sm text-ink-4">Aucun article ajouté</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-elev border border-line-soft"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink truncate">
                        {item.productName}
                      </p>
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateItemQty(index, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-bg-elev-2 text-ink-2 hover:text-ink flex items-center justify-center text-[14px] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-[13px] font-medium text-ink w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemQty(index, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-bg-elev-2 text-ink-2 hover:text-ink flex items-center justify-center text-[14px] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Prix unitaire éditable (pour le closing call) */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItemPrice(index, parseInt(e.target.value) || 0)
                        }
                        className="w-24 bg-bg-elev-2 border border-line rounded-lg px-2 py-1 text-[12px] font-mono text-ink text-right outline-none focus:border-ink-3"
                        min={0}
                      />
                      <span className="text-[11px] text-ink-4">FCFA</span>
                    </div>

                    {/* Sous-total */}
                    <p className="font-mono text-[13px] text-ink font-medium w-20 text-right">
                      {formatXOF(item.price * item.quantity)}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-lg hover:bg-red-400/10 text-ink-4 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-line">
                  <p className="text-sm font-medium text-ink-3">Total</p>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {formatXOF(total)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne secondaire */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-1">Total commande</p>
              <p className="text-2xl font-mono font-semibold text-ink">
                {formatXOF(total)}
              </p>
              <p className="text-[11px] text-ink-4 mt-1">
                {items.length} article{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            loading={isPending}
            className="w-full justify-center"
            size="lg"
          >
            Créer la commande
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/orders")}
            className="w-full justify-center"
          >
            Annuler
          </Button>
        </div>
      </div>
    </form>
  );
}
