import { ProductForm } from "@/components/products/product-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="flex items-center gap-2 text-ink-3 hover:text-ink transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Catalogue
        </Link>
        <span className="text-ink-4">/</span>
        <span className="text-sm text-ink">Nouveau produit</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Nouveau produit</h1>
        <p className="text-sm text-ink-3 mt-0.5">
          Remplissez les informations de votre produit.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
