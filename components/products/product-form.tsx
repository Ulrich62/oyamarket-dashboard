"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input, Textarea } from "@/components/ui/input";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { uploadProductImage } from "@/lib/actions/upload";
import {
  ImagePlus, Trash2, X, Plus, Sparkles, Video,
  Layers, MessageSquare, HelpCircle, FileText, CheckCircle2,
  ChevronRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, ProductPack } from "@prisma/client";

export interface PackItem {
  id?: string;
  name: string;
  subtitle?: string | null;
  badge?: string | null;
  quantity: number;
  price: number;
  compareAtPrice?: number | null;
  isPopular?: boolean;
}

export interface UnifiedLandingData {
  headline: string;
  stockBadge: string;
  keyArguments: string[];
  shippingRibbon: string[];
  heroImage: string;
  gallery: string[];
  trustBadges: Array<{ icon: string; title: string; subtitle: string }>;
  videos: Array<{ videoUrl: string; poster: string; caption: string; stars: number }>;
  beforeAfter: {
    badge: string;
    title: string;
    description: string;
    image: string;
    benefits: Array<{ title: string; desc: string }>;
  };
  threeInOneCards: Array<{ title: string; desc: string }>;
  steps: Array<{ num: string; title: string; desc: string }>;
  reviews: Array<{ name: string; city: string; avatar: string; text: string; badge: string; stars?: number }>;
  clientPhotos: string[];
  unboxing: {
    image: string;
    title: string;
    items: string[];
    ctaText: string;
  };
  accordions: Array<{ title: string; content: string; defaultOpen?: boolean }>;
  faq: Array<{ q: string; a: string }>;
  rating?: number;
  reviewsCount?: number;
}

interface ProductFormProps {
  product?: Product & {
    landingData?: any;
    packs?: ProductPack[];
  };
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "packs" | "media" | "routine" | "reviews" | "faq">("general");

  const raw = (product?.landingData as any) || {};

  const [imageUrl, setImageUrl] = useState(product?.imageUrl || raw.heroImage || "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>((product as any)?.isFeatured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState<number>((product as any)?.featuredOrder ?? 0);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "Beauté & Soins");
  const [price, setPrice] = useState<number | string>(product?.price ?? 15000);
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>(product?.compareAtPrice ?? 25000);
  const [costPrice, setCostPrice] = useState<number | string>(product?.costPrice ?? "");
  const [stock, setStock] = useState<number | string>(product?.stock ?? 100);

  // Packs relationnels
  const initialPacks: PackItem[] = (product?.packs && product.packs.length > 0)
    ? product.packs.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.subtitle,
        badge: p.badge,
        quantity: p.quantity,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        isPopular: p.isPopular,
      }))
    : [
        {
          name: `1x ${product?.name || "Produit"}`,
          subtitle: "Kit complet standard",
          quantity: 1,
          price: product?.price || 15000,
          compareAtPrice: product?.compareAtPrice || 25000,
          isPopular: false,
        },
        {
          name: `2x ${product?.name || "Produits"}`,
          subtitle: "Offrez-en un à un proche (-5 000 FCFA)",
          badge: "Plus Populaire 🔥",
          quantity: 2,
          price: (product?.price || 15000) * 2 - 5000,
          compareAtPrice: (product?.compareAtPrice || 25000) * 2,
          isPopular: true,
        },
      ];

  const [packs, setPacks] = useState<PackItem[]>(initialPacks);

  // Initialisation complète unifiée
  const initialLanding: UnifiedLandingData = {
    headline: raw.headline || "",
    stockBadge: raw.stockBadge || "En stock • Expédition rapide en 24h à 48h partout au Bénin",
    keyArguments: Array.isArray(raw.keyArguments) && raw.keyArguments.length > 0
      ? [...raw.keyArguments]
      : ["", "", ""],
    shippingRibbon: Array.isArray(raw.shippingRibbon) && raw.shippingRibbon.length > 0
      ? [...raw.shippingRibbon]
      : [
          "🚚 Livraison Express Gratuite au Bénin",
          "💵 Paiement à la réception",
          "🛡️ Garantie 30 Jours",
          "✨ Plus de 10 000 clientes satisfaites",
        ],
    heroImage: raw.heroImage || product?.imageUrl || "",
    gallery: Array.isArray(raw.gallery) ? [...raw.gallery] : [],
    trustBadges: Array.isArray(raw.trustBadges) && raw.trustBadges.length > 0
      ? raw.trustBadges
      : [
          { icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232043/oyamarket/icons/icon_livraison.png", title: "Livraison gratuite", subtitle: "Partout au Bénin (24-48h)" },
          { icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232045/oyamarket/icons/icon_paiement.png", title: "Paiement à la livraison", subtitle: "Espèces à la réception" },
          { icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232046/oyamarket/icons/icon_garantie.png", title: "Garantie 30 jours", subtitle: "Satisfait ou remboursé" },
          { icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232047/oyamarket/icons/icon_support.png", title: "Service client 7j/7", subtitle: "Assistance réactive par email" },
        ],
    videos: Array.isArray(raw.ugcVideos) && raw.ugcVideos.length > 0
      ? raw.ugcVideos.map((v: any) => ({ ...v }))
      : Array.isArray(raw.videos) && raw.videos.length > 0
      ? raw.videos.map((v: any) => ({ ...v }))
      : [
          { videoUrl: "", poster: "", caption: "", stars: 5 },
          { videoUrl: "", poster: "", caption: "", stars: 5 },
          { videoUrl: "", poster: "", caption: "", stars: 5 },
        ],
    beforeAfter: {
      badge: raw.beforeAfter?.badge || "Résultats Visibles",
      title: raw.beforeAfter?.title || raw.twoStepsTitle || "",
      description: raw.beforeAfter?.description || raw.twoStepsDesc || "",
      image: raw.beforeAfter?.image || raw.beforeAfterImage || "",
      benefits: Array.isArray(raw.beforeAfter?.benefits) && raw.beforeAfter.benefits.length > 0
        ? raw.beforeAfter.benefits
        : Array.isArray(raw.twoStepsBullets)
        ? raw.twoStepsBullets.map((b: string) => ({ title: b, desc: "" }))
        : [],
    },
    threeInOneCards: Array.isArray(raw.threeInOneCards) && raw.threeInOneCards.length > 0
      ? raw.threeInOneCards.map((c: any) => ({ ...c }))
      : Array.isArray(raw.benefitCards) && raw.benefitCards.length > 0
      ? raw.benefitCards.map((c: any) => ({ ...c }))
      : [
          { title: "", desc: "" },
          { title: "", desc: "" },
          { title: "", desc: "" },
        ],
    steps: Array.isArray(raw.steps) ? raw.steps.map((s: any) => ({ ...s })) : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews.map((r: any) => ({ ...r })) : [],
    clientPhotos: Array.isArray(raw.clientPhotos) ? [...raw.clientPhotos] : [],
    unboxing: {
      image: raw.unboxing?.image || raw.unboxingImage || "",
      title: raw.unboxing?.title || "Ce que contient exactement votre coffret :",
      items: Array.isArray(raw.unboxing?.items) && raw.unboxing.items.length > 0
        ? [...raw.unboxing.items]
        : Array.isArray(raw.unboxingItems) && raw.unboxingItems.length > 0
        ? [...raw.unboxingItems]
        : [],
      ctaText: raw.unboxing?.ctaText || "Commander mon coffret maintenant",
    },
    accordions: Array.isArray(raw.accordions) ? raw.accordions.map((a: any) => ({ ...a })) : [],
    faq: Array.isArray(raw.faq) ? raw.faq.map((f: any) => ({ ...f })) : [],
    rating: raw.rating ?? 4.9,
    reviewsCount: raw.reviewsCount ?? 1245,
  };

  // Compléter videos pour en avoir toujours au moins 3
  while (initialLanding.videos.length < 3) {
    initialLanding.videos.push({ videoUrl: "", poster: "", caption: "", stars: 5 });
  }

  const [landingData, setLandingData] = useState<UnifiedLandingData>(initialLanding);

  const isEditing = !!product;

  const handleSlugify = (val: string) => {
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing || !slug) {
      setSlug(handleSlugify(newName));
    }
  };

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
      toast.success("Image principale mise à jour");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Assurer que tous les champs essentiels sont toujours présents quel que soit l'onglet actif
    formData.set("name", name.trim());
    formData.set("slug", (slug || handleSlugify(name)).trim());
    formData.set("category", (category || "").trim());
    formData.set("price", String(price || 0));
    if (compareAtPrice !== "" && compareAtPrice !== null && compareAtPrice !== undefined) {
      formData.set("compareAtPrice", String(compareAtPrice));
    } else {
      formData.delete("compareAtPrice");
    }
    if (costPrice !== "" && costPrice !== null && costPrice !== undefined) {
      formData.set("costPrice", String(costPrice));
    } else {
      formData.delete("costPrice");
    }
    formData.set("stock", String(stock !== "" ? stock : 100));
    formData.set("imageUrl", imageUrl || "");
    formData.set("isActive", String(isActive));
    formData.set("isFeatured", String(isFeatured));
    formData.set("featuredOrder", String(featuredOrder));
    formData.set("packs", JSON.stringify(packs));

    // Préparer un objet enrichi avec double mapping pour garantir une compatibilité totale avec le shop
    const finalLandingData = {
      ...raw,
      headline: landingData.headline,
      stockBadge: landingData.stockBadge,
      keyArguments: landingData.keyArguments.filter((k) => k && k.trim()),
      shippingRibbon: landingData.shippingRibbon.filter((s) => s && s.trim()),
      heroImage: imageUrl,
      gallery: landingData.gallery,
      trustBadges: landingData.trustBadges,
      videos: landingData.videos,
      ugcVideos: landingData.videos,
      beforeAfter: landingData.beforeAfter,
      beforeAfterImage: landingData.beforeAfter.image,
      twoStepsTitle: landingData.beforeAfter.title,
      twoStepsDesc: landingData.beforeAfter.description,
      twoStepsBullets: landingData.beforeAfter.benefits.map((b) => b.title).filter(Boolean),
      threeInOneCards: landingData.threeInOneCards,
      benefitCards: landingData.threeInOneCards,
      steps: landingData.steps,
      reviews: landingData.reviews,
      rating: Number(landingData.rating) || 4.9,
      reviewsCount: Number(landingData.reviewsCount) || 1245,
      clientPhotos: landingData.clientPhotos,
      unboxing: landingData.unboxing,
      unboxingImage: landingData.unboxing.image,
      unboxingItems: landingData.unboxing.items,
      accordions: landingData.accordions,
      faq: landingData.faq,
    };

    formData.set("landingData", JSON.stringify(finalLandingData));

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if ("error" in result && result.error) {
        let errorMsg = "Erreur lors de l'enregistrement";
        if (typeof result.error === "object") {
          const details = Object.entries(result.error)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
            .join(" • ");
          errorMsg = `Erreurs de validation : ${details}`;
        } else if (typeof result.error === "string") {
          errorMsg = result.error;
        }
        toast.error(errorMsg);
        return;
      }

      toast.success(isEditing ? "Produit mis à jour avec succès !" : "Produit créé avec succès !");
      router.push("/products");
    });
  };

  const confirmDeleteProduct = () => {
    if (!product) return;

    startDeleteTransition(async () => {
      try {
        await deleteProduct(product.id);
        toast.success("Produit supprimé avec succès");
        router.push("/products");
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression du produit");
      }
    });
  };

  // Helper packs
  const addPack = () => {
    const nextQty = packs.length + 1;
    const newPack: PackItem = {
      name: `${nextQty}x ${name || "Produit"}`,
      subtitle: "Offre promotionnelle",
      badge: nextQty === 2 ? "Plus Populaire 🔥" : "",
      quantity: nextQty,
      price: (product?.price || 15000) * nextQty - (nextQty > 1 ? 5000 : 0),
      compareAtPrice: (product?.compareAtPrice || 25000) * nextQty,
      isPopular: nextQty === 2,
    };
    setPacks([...packs, newPack]);
  };

  const removePack = (index: number) => {
    setPacks(packs.filter((_, idx) => idx !== index));
  };

  // Helper Vidéos
  const updateVideo = (index: number, field: "videoUrl" | "poster" | "caption", val: string) => {
    const updated = [...landingData.videos];
    if (!updated[index]) {
      updated[index] = { videoUrl: "", poster: "", caption: "", stars: 5 };
    }
    updated[index] = { ...updated[index], [field]: val };
    setLandingData({ ...landingData, videos: updated });
  };

  // Helper Galerie
  const addGalleryImage = (url: string) => {
    if (!url.trim()) return;
    setLandingData({
      ...landingData,
      gallery: [...(landingData.gallery || []), url.trim()],
    });
  };

  const removeGalleryImage = (index: number) => {
    const updated = [...(landingData.gallery || [])];
    updated.splice(index, 1);
    setLandingData({ ...landingData, gallery: updated });
  };

  // Helper Photos Clientes UGC
  const addClientPhoto = (url: string) => {
    if (!url.trim()) return;
    setLandingData({
      ...landingData,
      clientPhotos: [...(landingData.clientPhotos || []), url.trim()],
    });
  };

  const removeClientPhoto = (index: number) => {
    const updated = [...(landingData.clientPhotos || [])];
    updated.splice(index, 1);
    setLandingData({ ...landingData, clientPhotos: updated });
  };

  // Helper Cartes Bénéfices 3-en-1
  const updateCard = (idx: number, field: "title" | "desc", val: string) => {
    const updated = [...landingData.threeInOneCards];
    if (!updated[idx]) updated[idx] = { title: "", desc: "" };
    updated[idx] = { ...updated[idx], [field]: val };
    setLandingData({ ...landingData, threeInOneCards: updated });
  };

  // Helper Unboxing Items
  const addUnboxingItem = (itemText: string) => {
    if (!itemText.trim()) return;
    setLandingData({
      ...landingData,
      unboxing: {
        ...landingData.unboxing,
        items: [...(landingData.unboxing.items || []), itemText.trim()],
      },
    });
  };

  const removeUnboxingItem = (index: number) => {
    const updated = [...(landingData.unboxing.items || [])];
    updated.splice(index, 1);
    setLandingData({
      ...landingData,
      unboxing: { ...landingData.unboxing, items: updated },
    });
  };

  const updateUnboxingItem = (index: number, val: string) => {
    const updated = [...(landingData.unboxing.items || [])];
    updated[index] = val;
    setLandingData({
      ...landingData,
      unboxing: { ...landingData.unboxing, items: updated },
    });
  };

  // Helper Accordéons
  const addAccordion = () => {
    setLandingData({
      ...landingData,
      accordions: [
        ...(landingData.accordions || []),
        { title: "Nouvel accordéon", content: "Contenu..." },
      ],
    });
  };

  const removeAccordion = (idx: number) => {
    const updated = [...(landingData.accordions || [])];
    updated.splice(idx, 1);
    setLandingData({ ...landingData, accordions: updated });
  };

  const updateAccordion = (idx: number, field: "title" | "content", val: string) => {
    const updated = [...(landingData.accordions || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setLandingData({ ...landingData, accordions: updated });
  };

  // Helper FAQ
  const addFaqItem = () => {
    setLandingData({
      ...landingData,
      faq: [
        ...(landingData.faq || []),
        { q: "Nouvelle question", a: "Réponse..." },
      ],
    });
  };

  const removeFaqItem = (idx: number) => {
    const updated = [...(landingData.faq || [])];
    updated.splice(idx, 1);
    setLandingData({ ...landingData, faq: updated });
  };

  const updateFaqItem = (idx: number, field: "q" | "a", val: string) => {
    const updated = [...(landingData.faq || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setLandingData({ ...landingData, faq: updated });
  };

  // Helper Avis
  const addReview = () => {
    setLandingData({
      ...landingData,
      reviews: [
        ...(landingData.reviews || []),
        {
          name: "Cliente Vérifiée",
          city: "Cotonou",
          avatar: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231193/oyamarket/products/aspirateur-points-noirs/avatar_grace.jpg",
          badge: "Achat vérifié",
          stars: 5,
          text: "Très satisfaite de mon achat !",
        },
      ],
    });
  };

  const removeReview = (idx: number) => {
    const updated = [...(landingData.reviews || [])];
    updated.splice(idx, 1);
    setLandingData({ ...landingData, reviews: updated });
  };

  const tabs = [
    { id: "general", label: "Général & Prix", icon: Layers },
    { id: "packs", label: "Packs & Offres", icon: Sparkles },
    { id: "media", label: "Médias & Reels", icon: Video },
    { id: "routine", label: "Routine & Bénéfices", icon: FileText },
    { id: "reviews", label: "Avis & Preuve Sociale", icon: MessageSquare },
    { id: "faq", label: "FAQ & Coffret", icon: HelpCircle },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Barre de navigation par onglets */}
      <div className="flex items-center gap-1 border-b border-line pb-3 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActiveTab = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                isActiveTab
                  ? "bg-ink text-bg shadow-sm"
                  : "text-ink-3 hover:text-ink hover:bg-bg-elev"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale d'édition */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* --- ONGLET 1 : GÉNÉRAL & PRIX --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5", activeTab !== "general" && "hidden")}>
            <h2 className="text-sm font-semibold text-ink">Informations Générales</h2>

            <Input
              id="name"
              name="name"
              label="Nom du produit *"
              placeholder="ex: Aspirateur Points Noirs 3-en-1 Pro"
              value={name}
              onChange={handleNameChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="slug"
                name="slug"
                label="Identifiant URL (Slug) *"
                placeholder="ex: aspirateur-points-noirs"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                hint="Lien public : /produit/[slug]"
              />
              <Input
                id="category"
                name="category"
                label="Catégorie"
                placeholder="ex: Beauté & Soins"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            {/* Titre Marketing d'accroche (Headline) */}
            <div className="pt-2 border-t border-line/60">
              <Input
                id="headline"
                label="Titre d'Accroche Marketing (Headline sur le Shop)"
                placeholder="ex: Aspirateur de Graisse, Points Noirs & Impuretés du Visage™"
                value={landingData.headline}
                onChange={(e) => setLandingData({ ...landingData, headline: e.target.value })}
                hint="Affiché en grand titre sur la fiche produit"
              />
            </div>

            {/* Badge de stock */}
            <Input
              id="stockBadge"
              label="Bandeau de Stock & Expédition"
              placeholder="ex: En stock • Expédition rapide en 24h à 48h partout au Bénin"
              value={landingData.stockBadge}
              onChange={(e) => setLandingData({ ...landingData, stockBadge: e.target.value })}
            />

            {/* 3 Arguments clés de vente (Bullet points sous le prix) */}
            <div className="pt-2 border-t border-line/60 flex flex-col gap-3">
              <label className="text-xs font-semibold text-ink">
                3 Arguments Clés de Vente (Puces sous le prix)
              </label>
              {[0, 1, 2].map((idx) => (
                <Input
                  key={idx}
                  placeholder={`Argument #${idx + 1} (ex: Élimine instantanément l'excès de sébum)`}
                  value={landingData.keyArguments[idx] || ""}
                  onChange={(e) => {
                    const updated = [...landingData.keyArguments];
                    updated[idx] = e.target.value;
                    setLandingData({ ...landingData, keyArguments: updated });
                  }}
                />
              ))}
            </div>

            {/* Tarification & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-line/60">
              <Input
                id="price"
                name="price"
                type="number"
                label="Prix de vente (FCFA) *"
                placeholder="15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
              />
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                label="Prix barré (FCFA)"
                placeholder="25000"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                min={0}
                hint="Affiche l'économie réalisée"
              />
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                label="Coût d'achat (FCFA)"
                placeholder="6500"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                min={0}
                hint="Pour calcul de marge interne"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                id="stock"
                name="stock"
                type="number"
                label="Stock disponible"
                placeholder="200"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min={0}
              />
              <Input
                id="imageUrl"
                name="imageUrl"
                label="URL Image Principale"
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                hint="Lien direct Cloudinary"
              />
            </div>
          </div>

          {/* --- ONGLET 2 : PACKS & OFFRES --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5", activeTab !== "packs" && "hidden")}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Offres & Packs Multiples (Buy Box)</h2>
                <p className="text-xs text-ink-3 mt-0.5">
                  Configurez les packs commerciaux (1x, 2x, etc.). Les calculs d'unités physiques et de marge sont automatiques.
                </p>
              </div>
              <Button type="button" size="sm" onClick={addPack} icon={<Plus className="w-3.5 h-3.5" />}>
                Ajouter un pack
              </Button>
            </div>

            <div className="space-y-4">
              {packs.map((p, idx) => {
                const unitPriceCalculated = Math.round(p.price / (p.quantity || 1));
                const savings = p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice - p.price : 0;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3 relative">
                    <button
                      type="button"
                      onClick={() => removePack(idx)}
                      className="absolute top-3 right-3 text-ink-4 hover:text-red-500 transition-colors"
                      title="Supprimer ce pack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase text-ink-3 font-mono">Nom du pack</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].name = e.target.value;
                            setPacks(updated);
                          }}
                          className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                          placeholder="ex: 2x Aspirateurs Points Noirs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-ink-3 font-mono">Badge promotionnel</label>
                        <input
                          type="text"
                          value={p.badge || ""}
                          placeholder="ex: Plus Populaire 🔥"
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].badge = e.target.value;
                            setPacks(updated);
                          }}
                          className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-ink-3 font-mono">Articles inclus (Unités)</label>
                        <input
                          type="number"
                          min={1}
                          value={p.quantity}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].quantity = Math.max(1, Number(e.target.value));
                            setPacks(updated);
                          }}
                          className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-ink-3 font-mono">Prix Total Pack (FCFA)</label>
                        <input
                          type="number"
                          min={0}
                          value={p.price}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].price = Number(e.target.value);
                            setPacks(updated);
                          }}
                          className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-ink-3 font-mono">Prix Barré Total (FCFA)</label>
                        <input
                          type="number"
                          min={0}
                          value={p.compareAtPrice || ""}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].compareAtPrice = e.target.value ? Number(e.target.value) : null;
                            setPacks(updated);
                          }}
                          className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink font-mono"
                        />
                      </div>
                    </div>

                    {/* Indicateurs calculés en direct */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50 text-[11px]">
                      <span className="bg-bg-elev px-2 py-0.5 rounded text-ink-2 font-mono">
                        Prix unitaire : <strong className="text-ink">{unitPriceCalculated.toLocaleString("fr-FR")} FCFA</strong> / unité
                      </span>
                      {savings > 0 && (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
                          Économie client : {savings.toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                      <label className="ml-auto flex items-center gap-1.5 text-xs text-ink-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(p.isPopular)}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx].isPopular = e.target.checked;
                            setPacks(updated);
                          }}
                          className="rounded border-line bg-bg-elev text-emerald-500 focus:ring-0"
                        />
                        <span>Mettre en avant comme "Populaire"</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- ONGLET 3 : MÉDIAS & REELS --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-6", activeTab !== "media" && "hidden")}>
            {/* Vidéos Reels UGC */}
            <div>
              <h2 className="text-sm font-semibold text-ink mb-1">Vidéos Reels UGC (3 Vidéos Verticaux 9:16)</h2>
              <p className="text-xs text-ink-3 mb-4">
                Sources MP4 officielles et affiches pour les vidéos interactives et jouables.
              </p>

              <div className="space-y-4">
                {[0, 1, 2].map((idx) => {
                  const v = landingData.videos?.[idx] || { videoUrl: "", poster: "", caption: "", stars: 5 };
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3">
                      <span className="text-xs font-bold text-ink">Reel #{idx + 1}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="URL Vidéo MP4"
                          placeholder="https://res.cloudinary.com/.../video.mp4"
                          value={v.videoUrl}
                          onChange={(e) => updateVideo(idx, "videoUrl", e.target.value)}
                        />
                        <Input
                          label="Image Poster de Prévisualisation"
                          placeholder="https://res.cloudinary.com/.../poster.jpg"
                          value={v.poster}
                          onChange={(e) => updateVideo(idx, "poster", e.target.value)}
                        />
                      </div>
                      <Input
                        label="Citation / Avis sous la vidéo"
                        placeholder="« Mon témoignage en 3 minutes ! »"
                        value={v.caption}
                        onChange={(e) => updateVideo(idx, "caption", e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Galerie d'Images Infographiques */}
            <div className="pt-6 border-t border-line">
              <h2 className="text-sm font-semibold text-ink mb-1">Galerie d'Images (Infographies 2 Colonnes)</h2>
              <p className="text-xs text-ink-3 mb-4">
                Images haute résolution illustrant les bénéfices sous l'image principale.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  id="new-gallery-url"
                  placeholder="Coller l'URL d'une image infographique Cloudinary..."
                  className="flex-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("new-gallery-url") as HTMLInputElement;
                    if (el && el.value) {
                      addGalleryImage(el.value);
                      el.value = "";
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(landingData.gallery || []).map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-line bg-bg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Galerie ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Clientes UGC */}
            <div className="pt-6 border-t border-line">
              <h2 className="text-sm font-semibold text-ink mb-1">Photos Clientes UGC (Preuve Sociale Réelle)</h2>
              <p className="text-xs text-ink-3 mb-4">
                Photos prises par les clientes montrant l'appareil reçu.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  id="new-ugc-url"
                  placeholder="Coller l'URL d'une photo cliente UGC..."
                  className="flex-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("new-ugc-url") as HTMLInputElement;
                    if (el && el.value) {
                      addClientPhoto(el.value);
                      el.value = "";
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(landingData.clientPhotos || []).map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-line bg-bg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo cliente ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeClientPhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ONGLET 4 : ROUTINE & BÉNÉFICES --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-6", activeTab !== "routine" && "hidden")}>
            {/* Avant / Après */}
            <div>
              <h2 className="text-sm font-semibold text-ink mb-1">Section Avant / Après</h2>
              <p className="text-xs text-ink-3 mb-4">Visuel comparatif et arguments de conversion.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Titre Avant/Après"
                  placeholder="ex: En deux gestes : fini la peau grasse..."
                  value={landingData.beforeAfter?.title || ""}
                  onChange={(e) =>
                    setLandingData({
                      ...landingData,
                      beforeAfter: { ...landingData.beforeAfter, title: e.target.value },
                    })
                  }
                />
                <Input
                  label="URL Image Avant/Après"
                  placeholder="https://res.cloudinary.com/.../avant_apres.jpg"
                  value={landingData.beforeAfter?.image || ""}
                  onChange={(e) =>
                    setLandingData({
                      ...landingData,
                      beforeAfter: { ...landingData.beforeAfter, image: e.target.value },
                    })
                  }
                />
              </div>
              <div className="mt-3">
                <Textarea
                  label="Description de la section"
                  rows={2}
                  placeholder="ex: Ne pressez plus votre visage avec les ongles..."
                  value={landingData.beforeAfter?.description || ""}
                  onChange={(e) =>
                    setLandingData({
                      ...landingData,
                      beforeAfter: { ...landingData.beforeAfter, description: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {/* 3 Cartes Bénéfices Clés */}
            <div className="pt-6 border-t border-line">
              <h2 className="text-sm font-semibold text-ink mb-1">3 Piliers d'Efficacité (Cartes Bénéfices)</h2>
              <p className="text-xs text-ink-3 mb-4">Affichées sous la section Avant / Après.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const card = landingData.threeInOneCards?.[idx] || { title: "", desc: "" };
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3">
                      <span className="text-xs font-bold text-ink">Pilier #{idx + 1}</span>
                      <Input
                        label="Titre"
                        placeholder="ex: Éliminer l'acné & le sébum"
                        value={card.title}
                        onChange={(e) => updateCard(idx, "title", e.target.value)}
                      />
                      <Textarea
                        label="Description"
                        rows={3}
                        placeholder="ex: Aspire l'excès de sébum et les toxines..."
                        value={card.desc}
                        onChange={(e) => updateCard(idx, "desc", e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Étapes de Routine */}
            <div className="pt-6 border-t border-line">
              <h2 className="text-sm font-semibold text-ink mb-1">Routine en 4 Étapes d'Utilisation</h2>
              <div className="space-y-3 mt-4">
                {(landingData.steps || []).map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-line bg-bg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-1 flex items-center justify-center font-bold text-ink">
                      #{idx + 1}
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Titre de l'étape"
                        value={s.title}
                        onChange={(e) => {
                          const updated = [...(landingData.steps || [])];
                          updated[idx].title = e.target.value;
                          setLandingData({ ...landingData, steps: updated });
                        }}
                        className="w-full p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                      />
                    </div>
                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        placeholder="Description de l'étape"
                        value={s.desc}
                        onChange={(e) => {
                          const updated = [...(landingData.steps || [])];
                          updated[idx].desc = e.target.value;
                          setLandingData({ ...landingData, steps: updated });
                        }}
                        className="w-full p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- ONGLET 5 : AVIS & PREUVE SOCIALE --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-6", activeTab !== "reviews" && "hidden")}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Témoignages Clients (Carrousel)</h2>
                <p className="text-xs text-ink-3 mt-0.5">Avis vérifiés affichés dans le carrousel interactif.</p>
              </div>
              <Button type="button" size="sm" onClick={addReview} icon={<Plus className="w-3.5 h-3.5" />}>
                Ajouter un avis
              </Button>
            </div>

            {/* Note globale et volume d'avis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-line bg-bg">
              <Input
                label="Note Globale Affichée (ex: 4.9)"
                type="number"
                step="0.1"
                min={1}
                max={5}
                value={landingData.rating ?? 4.9}
                onChange={(e) => setLandingData({ ...landingData, rating: parseFloat(e.target.value) || 5 })}
              />
              <Input
                label="Nombre Total d'Avis (ex: 1245)"
                type="number"
                min={1}
                value={landingData.reviewsCount ?? 1245}
                onChange={(e) => setLandingData({ ...landingData, reviewsCount: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div className="space-y-4">
              {(landingData.reviews || []).map((r, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => removeReview(idx)}
                    className="absolute top-3 right-3 text-ink-4 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-ink-3 font-mono">Nom du client</label>
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => {
                          const updated = [...(landingData.reviews || [])];
                          updated[idx].name = e.target.value;
                          setLandingData({ ...landingData, reviews: updated });
                        }}
                        className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-ink-3 font-mono">Ville (Bénin)</label>
                      <input
                        type="text"
                        value={r.city}
                        onChange={(e) => {
                          const updated = [...(landingData.reviews || [])];
                          updated[idx].city = e.target.value;
                          setLandingData({ ...landingData, reviews: updated });
                        }}
                        className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-ink-3 font-mono">URL Avatar</label>
                      <input
                        type="text"
                        value={r.avatar}
                        placeholder="https://res.cloudinary.com/.../avatar.jpg"
                        onChange={(e) => {
                          const updated = [...(landingData.reviews || [])];
                          updated[idx].avatar = e.target.value;
                          setLandingData({ ...landingData, reviews: updated });
                        }}
                        className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-ink-3 font-mono">Commentaire</label>
                    <textarea
                      rows={2}
                      value={r.text}
                      onChange={(e) => {
                        const updated = [...(landingData.reviews || [])];
                        updated[idx].text = e.target.value;
                        setLandingData({ ...landingData, reviews: updated });
                      }}
                      className="w-full mt-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- ONGLET 6 : FAQ & COFFRET --- */}
          <div className={cn("rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-6", activeTab !== "faq" && "hidden")}>
            {/* Unboxing / Coffret */}
            <div>
              <h2 className="text-sm font-semibold text-ink mb-1">Contenu du Coffret (Déballage / Unboxing)</h2>
              <p className="text-xs text-ink-3 mb-4">Présentation du kit complet reçu par le client.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Titre de la section Unboxing"
                  placeholder="ex: Ce que contient exactement votre coffret :"
                  value={landingData.unboxing?.title || ""}
                  onChange={(e) =>
                    setLandingData({
                      ...landingData,
                      unboxing: { ...landingData.unboxing, title: e.target.value },
                    })
                  }
                />
                <Input
                  label="URL Image Coffret Complet"
                  placeholder="https://res.cloudinary.com/.../unboxing_coffret.jpg"
                  value={landingData.unboxing?.image || ""}
                  onChange={(e) =>
                    setLandingData({
                      ...landingData,
                      unboxing: { ...landingData.unboxing, image: e.target.value },
                    })
                  }
                />
              </div>

              {/* Liste des éléments inclus */}
              <div className="mt-4 pt-3 border-t border-line/60">
                <label className="text-xs font-semibold text-ink block mb-2">
                  Liste des Accessoires Inclus dans la Boîte
                </label>
                
                <div className="space-y-2 mb-3">
                  {(landingData.unboxing?.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateUnboxingItem(idx, e.target.value)}
                        className="flex-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                        placeholder="ex: 1x Appareil Aspirateur Rechargeable"
                      />
                      <button
                        type="button"
                        onClick={() => removeUnboxingItem(idx)}
                        className="p-2 text-ink-4 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-unboxing-item"
                    placeholder="Ajouter un accessoire (ex: 1x Câble de recharge USB universel)..."
                    className="flex-1 p-2 bg-bg-elev rounded-lg text-xs border border-line text-ink"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const el = document.getElementById("new-unboxing-item") as HTMLInputElement;
                      if (el && el.value) {
                        addUnboxingItem(el.value);
                        el.value = "";
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>

            {/* Accordéons de description & compositions */}
            <div className="pt-6 border-t border-line">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Accordéons d'Informations Détaillées</h2>
                  <p className="text-xs text-ink-3 mt-0.5">Description complète, Spécifications techniques, Conseils.</p>
                </div>
                <Button type="button" size="sm" onClick={addAccordion} icon={<Plus className="w-3.5 h-3.5" />}>
                  Ajouter un accordéon
                </Button>
              </div>

              <div className="space-y-4">
                {(landingData.accordions || []).map((acc, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3 relative">
                    <button
                      type="button"
                      onClick={() => removeAccordion(idx)}
                      className="absolute top-3 right-3 text-ink-4 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Input
                      label="Titre de l'accordéon"
                      placeholder="ex: Description détaillée ou Compositions & Spécifications"
                      value={acc.title}
                      onChange={(e) => updateAccordion(idx, "title", e.target.value)}
                    />
                    <Textarea
                      label="Contenu textuel"
                      rows={3}
                      value={acc.content}
                      onChange={(e) => updateAccordion(idx, "content", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="pt-6 border-t border-line">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Foire Aux Questions (FAQ)</h2>
                  <p className="text-xs text-ink-3 mt-0.5">Réponses directes pour lever les objections des acheteurs.</p>
                </div>
                <Button type="button" size="sm" onClick={addFaqItem} icon={<Plus className="w-3.5 h-3.5" />}>
                  Ajouter une question
                </Button>
              </div>

              <div className="space-y-4">
                {(landingData.faq || []).map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-line bg-bg flex flex-col gap-3 relative">
                    <button
                      type="button"
                      onClick={() => removeFaqItem(idx)}
                      className="absolute top-3 right-3 text-ink-4 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Input
                      label="Question"
                      placeholder="ex: Est-ce que l'appareil peut faire mal ?"
                      value={f.q}
                      onChange={(e) => updateFaqItem(idx, "q", e.target.value)}
                    />
                    <Textarea
                      label="Réponse"
                      rows={2}
                      placeholder="ex: Non, la technologie d'aspiration douce est indolore..."
                      value={f.a}
                      onChange={(e) => updateFaqItem(idx, "a", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale : Statut & Actions de sauvegarde */}
        <div className="flex flex-col gap-6">
          {/* Aperçu & Statut */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-ink">Statut de Publication</h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer",
                  isActive
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    : "border-line hover:bg-bg-elev text-ink-4"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", isActive ? "bg-emerald-500" : "bg-ink-4/30")} />
                <span className="text-xs font-semibold">Actif</span>
              </button>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer",
                  !isActive
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
                    : "border-line hover:bg-bg-elev text-ink-4"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", !isActive ? "bg-amber-500" : "bg-ink-4/30")} />
                <span className="text-xs font-semibold">Brouillon</span>
              </button>
            </div>

            {/* Image Preview */}
            <div className="pt-2">
              <label className="text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono block mb-2">
                Image Produit
              </label>
              {imageUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line aspect-square cursor-pointer transition-colors",
                    "hover:border-ink-4 hover:bg-bg-elev"
                  )}
                >
                  <ImagePlus className="w-6 h-6 text-ink-4" />
                  <span className="text-xs text-ink-3">
                    {isUploading ? "Upload en cours..." : "Ajouter une image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Mise en avant Accueil (Best-seller) */}
          <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className={cn("w-4 h-4", isFeatured ? "text-amber-400 fill-amber-400" : "text-ink-4")} />
                <h2 className="text-sm font-semibold text-ink">Mise en avant Accueil</h2>
              </div>
              {isFeatured && (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  En vedette
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsFeatured(true)}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer",
                  isFeatured
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                    : "border-line hover:bg-bg-elev text-ink-4"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", isFeatured ? "bg-amber-400" : "bg-ink-4/30")} />
                <span className="text-xs font-semibold">Afficher</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFeatured(false)}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer",
                  !isFeatured
                    ? "border-line bg-bg-elev text-ink"
                    : "border-line hover:bg-bg-elev text-ink-4"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", !isFeatured ? "bg-ink-3" : "bg-ink-4/30")} />
                <span className="text-xs font-semibold">Masquer</span>
              </button>
            </div>

            {isFeatured && (
              <div className="pt-2 border-t border-line/60 flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
                  Ordre d&apos;affichage (priorité)
                </label>
                <input
                  type="number"
                  min="0"
                  value={featuredOrder}
                  onChange={(e) => setFeaturedOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-bg border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  placeholder="0 (premier), 1, 2..."
                />
                <span className="text-[11px] text-ink-4">
                  0 = premier affiché, 1 = deuxième, etc.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              loading={isPending}
              className="w-full justify-center text-sm py-3"
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
                onClick={() => setShowDeleteModal(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                className="w-full justify-center mt-2 cursor-pointer"
              >
                Supprimer le produit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Product Deletion */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteProduct}
        title="Supprimer définitivement ce produit ?"
        description="Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Toutes les informations, packs et avis associés seront effacés. Cette action est irréversible."
        confirmText="Supprimer définitivement"
        cancelText="Conserver le produit"
        variant="danger"
        isLoading={isDeleting}
      />
    </form>
  );
}
