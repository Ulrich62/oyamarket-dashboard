"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireStoreId(): Promise<string> {
  // On récupère l'utilisateur Supabase côté serveur
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Non autorisé");

  // On cherche la boutique liée à cet utilisateur
  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true },
  });

  if (!member) throw new Error("Aucune boutique trouvée pour cet utilisateur");

  return member.storeId;
}

// ─── Schemas de validation ────────────────────────────────────────────────────

const ProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  price: z.coerce.number().int().positive("Le prix doit être positif"),
  costPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
});

// ─── Server Actions — Products ────────────────────────────────────────────────

export async function getProducts() {
  const storeId = await requireStoreId();
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
  });
}

export async function getProduct(id: string) {
  const storeId = await requireStoreId();
  return prisma.product.findFirst({ where: { id, storeId } });
}

export async function createProduct(formData: FormData) {
  const storeId = await requireStoreId();

  const raw = {
    name: formData.get("name"),
    price: formData.get("price"),
    costPrice: formData.get("costPrice") || null,
    isActive: formData.get("isActive") !== "false",
    imageUrl: formData.get("imageUrl") || null,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const product = await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      price: data.price,
      costPrice: data.costPrice ?? null,
      isActive: data.isActive,
      imageUrl: data.imageUrl || null,
    },
  });

  revalidatePath("/products");
  return { success: true, product };
}

export async function updateProduct(id: string, formData: FormData) {
  const storeId = await requireStoreId();

  const raw = {
    name: formData.get("name"),
    price: formData.get("price"),
    costPrice: formData.get("costPrice") || null,
    isActive: formData.get("isActive") !== "false",
    imageUrl: formData.get("imageUrl") || null,
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const product = await prisma.product.update({
    where: { id, storeId },
    data: {
      name: data.name,
      price: data.price,
      costPrice: data.costPrice ?? null,
      isActive: data.isActive,
      imageUrl: data.imageUrl || null,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  const storeId = await requireStoreId();
  await prisma.product.delete({ where: { id, storeId } });
  revalidatePath("/products");
  return { success: true };
}
