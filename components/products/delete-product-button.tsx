"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteProduct } from "@/lib/actions/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  variant?: "icon" | "button";
  className?: string;
}

export function DeleteProductButton({
  productId,
  productName,
  variant = "icon",
  className,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleConfirmDelete = () => {
    startDeleteTransition(async () => {
      try {
        const res = await deleteProduct(productId);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success(`Le produit "${productName}" a été supprimé.`);
        setIsOpen(false);
        router.push("/products");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de la suppression du produit.");
      }
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title="Supprimer ce produit"
          aria-label={`Supprimer ${productName}`}
          className={cn(
            "w-7.5 h-7.5 rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center",
            className
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsOpen(true)}
          icon={<Trash2 className="w-3.5 h-3.5" />}
          className={cn(
            "cursor-pointer bg-red-600 hover:bg-red-500 text-white border-transparent shadow-sm",
            className
          )}
        >
          Supprimer le produit
        </Button>
      )}

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Supprimer "${productName}" ?`}
        description="Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Toutes ses déclinaisons et packs associés seront effacés du catalogue. Cette action est irréversible."
        confirmText="Supprimer définitivement"
        cancelText="Conserver le produit"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
