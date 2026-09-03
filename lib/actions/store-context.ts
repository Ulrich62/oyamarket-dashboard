"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function requireStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;

  const cookieStore = await cookies();
  const storeIdCookie = cookieStore.get("store_id")?.value;

  if (storeIdCookie) {
    const member = await prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: user.id!, storeId: storeIdCookie! } },
      select: { storeId: true },
    });
    if (member) return member.storeId;
  }

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id! },
    select: { storeId: true },
  });
  
  if (!member) throw new Error("Aucune boutique trouvée");
  return member.storeId;
}

export async function requireAdminStoreId(): Promise<{ storeId: string; role: Role }> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;

  const cookieStore = await cookies();
  const storeIdCookie = cookieStore.get("store_id")?.value;
  
  if (storeIdCookie) {
    const member = await prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: user.id!, storeId: storeIdCookie! } },
      select: { storeId: true, role: true },
    });
    if (member && member.role === "ADMIN") return { storeId: member.storeId, role: member.role };
  }

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id! },
    select: { storeId: true, role: true },
  });
  
  if (!member) throw new Error("Aucune boutique trouvée");
  if (member.role !== "ADMIN") throw new Error("Accès réservé aux admins");

  return { storeId: member.storeId, role: member.role };
}

export async function switchStore(storeId: string) {
  const cookieStore = await cookies();
  cookieStore.set("store_id", storeId, { path: "/", secure: true, sameSite: "lax" });
}

export async function getUserStores() {
  const session = await auth();
  if (!session?.user) return [];
  
  return prisma.storeMember.findMany({
    where: { userId: session.user.id! },
    include: { store: true },
  });
}
