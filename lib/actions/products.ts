"use server";

import { requireStoreId } from "@/lib/actions/store-context";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Schemas de validation ────────────────────────────────────────────────────

const ProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  price: z.coerce.number().int().positive("Le prix doit être positif"),
  compareAtPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  costPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(100),
  isActive: z.coerce.boolean().default(true),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
  isFeatured: z.coerce.boolean().default(false),
  featuredOrder: z.coerce.number().int().default(0),
  landingData: z.any().optional().nullable(),
});

// ─── Server Actions — Products ────────────────────────────────────────────────

export async function getProducts() {
  const storeId = await requireStoreId();
  return prisma.product.findMany({
    where: { storeId, deletedAt: null },
    include: {
      packs: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  const storeId = await requireStoreId();
  return prisma.product.findFirst({
    where: { id, storeId, deletedAt: null },
    include: {
      packs: { orderBy: { position: "asc" } },
    },
  });
}

export async function createProduct(formData: FormData) {
  try {
    const storeId = await requireStoreId();

    let landingDataParsed = null;
    const rawLanding = formData.get("landingData");
    if (typeof rawLanding === "string" && rawLanding.trim()) {
      try {
        landingDataParsed = JSON.parse(rawLanding);
      } catch {
        // Ignorer erreur de parse JSON
      }
    }

    let packsParsed: any[] = [];
    const rawPacks = formData.get("packs");
    if (typeof rawPacks === "string" && rawPacks.trim()) {
      try {
        packsParsed = JSON.parse(rawPacks);
      } catch {
        // Ignorer erreur de parse JSON
      }
    }

    const rawName = String(formData.get("name") || "").trim();
    const rawSlugInput = formData.get("slug") ? String(formData.get("slug")).trim() : "";
    const rawSlug = rawSlugInput ? generateSlug(rawSlugInput) : generateSlug(rawName);

    const rawPrice = formData.get("price");
    const rawCompare = formData.get("compareAtPrice");
    const rawCost = formData.get("costPrice");
    const rawStock = formData.get("stock");

    const raw = {
      name: rawName,
      slug: rawSlug,
      category: formData.get("category") ? String(formData.get("category")).trim() : null,
      price: rawPrice !== null && rawPrice !== "" && !isNaN(Number(rawPrice)) ? Number(rawPrice) : null,
      compareAtPrice: rawCompare !== null && rawCompare !== "" && !isNaN(Number(rawCompare)) ? Number(rawCompare) : null,
      costPrice: rawCost !== null && rawCost !== "" && !isNaN(Number(rawCost)) ? Number(rawCost) : null,
      stock: rawStock !== null && rawStock !== "" && !isNaN(Number(rawStock)) ? Number(rawStock) : 100,
      isActive: formData.get("isActive") !== "false",
      imageUrl: formData.get("imageUrl") ? String(formData.get("imageUrl")).trim() : null,
      isFeatured: formData.get("isFeatured") === "true",
      featuredOrder: formData.get("featuredOrder") ? Number(formData.get("featuredOrder")) : 0,
      landingData: landingDataParsed,
    };

    const parsed = ProductSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;
    const finalSlug = data.slug || generateSlug(data.name);

    const existing = await prisma.product.findFirst({
      where: {
        storeId,
        slug: finalSlug,
        deletedAt: null,
      },
    });

    if (existing) {
      return { error: { slug: ["Cet identifiant URL (slug) est déjà utilisé par un autre produit."] } };
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          storeId,
          name: data.name,
          slug: finalSlug,
          category: data.category ?? null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          costPrice: data.costPrice ?? null,
          stock: data.stock,
          isActive: data.isActive,
          imageUrl: data.imageUrl || null,
          isFeatured: data.isFeatured,
          featuredOrder: data.featuredOrder,
          landingData: data.landingData || null,
        },
      });

      if (Array.isArray(packsParsed) && packsParsed.length > 0) {
        await tx.productPack.createMany({
          data: packsParsed.map((pack, idx) => ({
            productId: p.id,
            name: pack.name || `${pack.quantity || 1}x ${p.name}`,
            subtitle: pack.subtitle || null,
            badge: pack.badge || null,
            quantity: Number(pack.quantity) || 1,
            price: Number(pack.price) || p.price,
            compareAtPrice: pack.compareAtPrice ? Number(pack.compareAtPrice) : null,
            isPopular: Boolean(pack.isPopular),
            position: idx,
          })),
        });
      }

      return p;
    });

    revalidatePath("/products");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error in createProduct:", error);
    return { error: error.message || "Erreur interne lors de la création du produit" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const storeId = await requireStoreId();

    let landingDataParsed = null;
    const rawLanding = formData.get("landingData");
    if (typeof rawLanding === "string" && rawLanding.trim()) {
      try {
        landingDataParsed = JSON.parse(rawLanding);
      } catch {
        // Ignorer erreur de parse JSON
      }
    }

    let packsParsed: any[] = [];
    const rawPacks = formData.get("packs");
    if (typeof rawPacks === "string" && rawPacks.trim()) {
      try {
        packsParsed = JSON.parse(rawPacks);
      } catch {
        // Ignorer erreur de parse JSON
      }
    }

    const rawName = String(formData.get("name") || "").trim();
    const rawSlugInput = formData.get("slug") ? String(formData.get("slug")).trim() : "";
    const rawSlug = rawSlugInput ? generateSlug(rawSlugInput) : generateSlug(rawName);

    const rawPrice = formData.get("price");
    const rawCompare = formData.get("compareAtPrice");
    const rawCost = formData.get("costPrice");
    const rawStock = formData.get("stock");

    const raw = {
      name: rawName,
      slug: rawSlug,
      category: formData.get("category") ? String(formData.get("category")).trim() : null,
      price: rawPrice !== null && rawPrice !== "" && !isNaN(Number(rawPrice)) ? Number(rawPrice) : null,
      compareAtPrice: rawCompare !== null && rawCompare !== "" && !isNaN(Number(rawCompare)) ? Number(rawCompare) : null,
      costPrice: rawCost !== null && rawCost !== "" && !isNaN(Number(rawCost)) ? Number(rawCost) : null,
      stock: rawStock !== null && rawStock !== "" && !isNaN(Number(rawStock)) ? Number(rawStock) : 100,
      isActive: formData.get("isActive") !== "false",
      imageUrl: formData.get("imageUrl") ? String(formData.get("imageUrl")).trim() : null,
      isFeatured: formData.get("isFeatured") === "true",
      featuredOrder: formData.get("featuredOrder") ? Number(formData.get("featuredOrder")) : 0,
      landingData: landingDataParsed,
    };

    const parsed = ProductSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;
    const finalSlug = data.slug || generateSlug(data.name);

    // Vérifier l'unicité du slug pour un autre produit
    const existing = await prisma.product.findFirst({
      where: {
        storeId,
        slug: finalSlug,
        id: { not: id },
        deletedAt: null,
      },
    });

    if (existing) {
      return { error: { slug: ["Cet identifiant URL (slug) est déjà utilisé par un autre produit de votre boutique."] } };
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id, storeId },
        data: {
          name: data.name,
          slug: finalSlug,
          category: data.category ?? null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          costPrice: data.costPrice ?? null,
          stock: data.stock,
          isActive: data.isActive,
          imageUrl: data.imageUrl || null,
          isFeatured: data.isFeatured,
          featuredOrder: data.featuredOrder,
          landingData: data.landingData !== undefined ? data.landingData : undefined,
        },
      });

      if (Array.isArray(packsParsed)) {
        await tx.productPack.deleteMany({ where: { productId: id } });
        if (packsParsed.length > 0) {
          await tx.productPack.createMany({
            data: packsParsed.map((pack, idx) => ({
              productId: id,
              name: pack.name || `${pack.quantity || 1}x ${p.name}`,
              subtitle: pack.subtitle || null,
              badge: pack.badge || null,
              quantity: Number(pack.quantity) || 1,
              price: Number(pack.price) || p.price,
              compareAtPrice: pack.compareAtPrice ? Number(pack.compareAtPrice) : null,
              isPopular: Boolean(pack.isPopular),
              position: idx,
            })),
          });
        }
      }

      return p;
    });

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, product };
  } catch (error: any) {
    console.error("Error in updateProduct:", error);
    return { error: error.message || "Erreur interne lors de la mise à jour du produit" };
  }
}

export async function toggleProductFeatured(id: string) {
  const storeId = await requireStoreId();
  const product = await prisma.product.findFirst({
    where: { id, storeId, deletedAt: null },
    select: { id: true, isFeatured: true },
  });
  if (!product) return { error: "Produit introuvable" };

  const updated = await prisma.product.update({
    where: { id },
    data: { isFeatured: !product.isFeatured },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { success: true, isFeatured: updated.isFeatured };
}

export async function deleteProduct(id: string) {
  const storeId = await requireStoreId();

  try {
    // Vérifier si le produit a déjà des commandes enregistrées
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Si le produit a des commandes historiques : Soft-delete (archivage)
      // Cela masque immédiatement le produit du catalogue et de la boutique,
      // tout en préservant intactes les lignes de commandes passées et leurs unités.
      await prisma.product.update({
        where: { id, storeId },
        data: {
          deletedAt: new Date(),
          isActive: false,
          isFeatured: false,
        },
      });
    } else {
      // Si le produit n'a aucune commande associée : suppression physique sûre
      await prisma.$transaction(async (tx) => {
        await tx.productPack.deleteMany({
          where: { productId: id },
        });
        await tx.product.delete({
          where: { id, storeId },
        });
      });
    }

    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteProduct] Error:", error);
    return { error: error?.message || "Échec de la suppression du produit" };
  }
}
