"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { toggleProductFeatured } from "@/lib/actions/products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ToggleFeaturedButtonProps {
  productId: string;
  initialFeatured: boolean;
  productName: string;
}

export function ToggleFeaturedButton({
  productId,
  initialFeatured,
  productName,
}: ToggleFeaturedButtonProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isFeatured;
    setIsFeatured(nextState);

    startTransition(async () => {
      try {
        const res = await toggleProductFeatured(productId);
        if (res.error) {
          setIsFeatured(!nextState);
          toast.error(res.error);
        } else {
          toast.success(
            nextState
              ? `« ${productName} » mis en avant sur l'accueil !`
              : `« ${productName} » retiré de l'accueil`
          );
        }
      } catch (err: any) {
        setIsFeatured(!nextState);
        toast.error("Une erreur est survenue.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={
        isFeatured
          ? "Ce produit est affiché sur la page d'accueil. Cliquez pour le retirer."
          : "Cliquez pour afficher ce produit sur la page d'accueil (Best-seller)."
      }
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer select-none",
        isFeatured
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shadow-xs"
          : "bg-bg-elev/40 text-ink-4 border border-line hover:text-ink hover:border-ink-4/40"
      )}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
      ) : (
        <Star
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isFeatured
              ? "fill-amber-400 text-amber-400 scale-110"
              : "text-ink-4 hover:scale-110"
          )}
        />
      )}
      <span>{isFeatured ? "En vedette" : "Standard"}</span>
    </button>
  );
}
