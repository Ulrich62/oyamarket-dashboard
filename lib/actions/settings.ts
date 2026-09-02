"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

async function requireAdminStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;
  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true, role: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  if (member.role !== "ADMIN") throw new Error("Accès réservé aux admins");
  return member.storeId;
}

async function getStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;
  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  return member.storeId;
}

const SettingsSchema = z.object({
  name: z.string().min(1),
  currency: z.enum(["XOF", "USD", "EUR"]).default("XOF"),
  pixelId: z.string().optional().nullable(),
  capiToken: z.string().optional().nullable(),
});

export async function getStoreSettings() {
  const storeId = await getStoreId();
  return prisma.store.findUnique({ where: { id: storeId } });
}

export async function updateStoreSettings(data: {
  name: string;
  currency: string;
  pixelId?: string;
  capiToken?: string;
}) {
  const storeId = await requireAdminStoreId();

  const parsed = SettingsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      name: parsed.data.name,
      currency: parsed.data.currency,
      pixelId: parsed.data.pixelId || null,
      capiToken: parsed.data.capiToken || null,
    },
  });

  revalidatePath("/settings");
  return { success: true, store };
}

export async function createStore(name: string, userId: string) {
  const store = await prisma.store.create({
    data: {
      name,
      currency: "XOF",
      members: {
        create: { userId, role: "ADMIN" },
      },
    },
  });
  return store;
}
