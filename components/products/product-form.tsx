"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadProductImage } from "@/lib/actions/upload";
import { ImagePlus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@prisma/client";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  const isEditing = !!product;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadProductImage(file);
    setIsUploading(false);

    if ("error" in result) {
      toast.error(`Erreur upload: ${result.error}`);
    } else {
      setImageUrl(result.url);
      toast.success("Image uploadée");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);
    formData.set("isActive", String(isActive));

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if ("error" in result && result.error) {
        toast.error("Erreur lors de l'enregistrement");
        return;
      }

      toast.success(isEditing ? "Produit mis à jour" : "Produit créé");
      router.push("/products");
    });
  };

  const handleDelete = () => {
    if (!product) return;
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;

    startDeleteTransition(async () => {
      await deleteProduct(product.id);
      toast.success("Produit supprimé");
      router.push("/products");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5">
            <h2 className="text-sm font-medium text-ink">Informations</h2>

            <Input
              id="name"
              name="name"
              label="Nom du produit *"
              placeholder="ex: Crème hydratante Lumière"
              defaultValue={product?.name}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="price"
                name="price"
                type="number"
                label="Prix de vente (FCFA) *"
                placeholder="15000"
                defaultValue={product?.price}
                required
                min={0}
              />
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                label="Coût d'achat (FCFA)"
                placeholder="8000"
                defaultValue={product?.costPrice ?? ""}
                min={0}
                hint="Utilisé pour calculer la marge"
              />
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-ink">Image produit</h2>

            {imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full max-h-64 object-cover rounded-xl border border-line"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <label
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line h-44 cursor-pointer transition-colors",
                  "hover:border-ink-4 hover:bg-bg-elev"
                )}
              >
                <ImagePlus className="w-6 h-6 text-ink-4" />
                <div className="text-center">
                  <p className="text-sm text-ink-3">
                    {isUploading ? "Upload en cours..." : "Cliquer pour ajouter une image"}
                  </p>
                  <p className="text-[11px] text-ink-4 mt-1">PNG, JPG, WEBP — Max 50 Mo</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Colonne secondaire */}
        <div className="flex flex-col gap-6">
          {/* Statut */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium text-ink">Statut</h2>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                  isActive
                    ? "border-green-500/40 bg-green-400/10"
                    : "border-line hover:bg-bg-elev"
                )}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-full",
                    isActive ? "bg-green-400" : "bg-ink-4"
                  )}
                />
                <div>
                  <p className={cn("text-sm font-medium", isActive ? "text-green-400" : "text-ink-3")}>
                    Actif
                  </p>
                  <p className="text-[11px] text-ink-4">Visible sur la boutique</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                  !isActive
                    ? "border-ink-3/40 bg-ink-4/10"
                    : "border-line hover:bg-bg-elev"
                )}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-full",
                    !isActive ? "bg-ink-3" : "bg-ink-4/30"
                  )}
                />
                <div>
                  <p className={cn("text-sm font-medium", !isActive ? "text-ink-2" : "text-ink-4")}>
                    Brouillon
                  </p>
                  <p className="text-[11px] text-ink-4">Non visible sur la boutique</p>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              loading={isPending}
              className="w-full justify-center"
            >
              {isEditing ? "Enregistrer les modifications" : "Créer le produit"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/products")}
              className="w-full justify-center"
            >
              Annuler
            </Button>

            {isEditing && (
              <Button
                type="button"
                variant="danger"
                loading={isDeleting}
                onClick={handleDelete}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                className="w-full justify-center mt-2"
              >
                Supprimer le produit
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
