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

export async function getCurrentMemberContext() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  const userId = session.user.id;

  const cookieStore = await cookies();
  const storeIdCookie = cookieStore.get("store_id")?.value;

  const memberFromCookie = storeIdCookie
    ? await prisma.storeMember.findUnique({
        where: { userId_storeId: { userId, storeId: storeIdCookie } },
        include: { user: true, store: true },
      })
    : null;

  const finalMember =
    memberFromCookie ||
    (await prisma.storeMember.findFirst({
      where: { userId },
      include: { user: true, store: true },
    }));

  if (!finalMember) throw new Error("Aucune boutique trouvée");

  return {
    userId,
    storeId: finalMember.storeId,
    role: finalMember.role,
    memberId: finalMember.id,
    user: finalMember.user,
    store: finalMember.store,
  };
}

export async function requireAdminStoreId(): Promise<{
  storeId: string;
  role: Role;
  userId: string;
  memberId: string;
}> {
  const context = await getCurrentMemberContext();
  if (context.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs");
  }

  return {
    storeId: context.storeId,
    role: context.role,
    userId: context.userId,
    memberId: context.memberId,
  };
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
