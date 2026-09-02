"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireAdminStoreId(): Promise<{ storeId: string; role: Role }> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true, role: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  if (member.role !== "ADMIN") throw new Error("Accès réservé aux admins");

  return { storeId: member.storeId, role: member.role };
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

export async function getTeamMembers() {
  const storeId = await getStoreId();
  return prisma.storeMember.findMany({
    where: { storeId },
  });
}

export async function inviteMember(data: { email: string; role: Role }) {
  const { storeId } = await requireAdminStoreId();

  // Créer l'utilisateur via Prisma avec un mot de passe par défaut
  let user = await prisma.user.findUnique({ where: { email: data.email } });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash("Oyamarket@2026", 10);
    user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });
  }

  const userId = user.id;

  const member = await prisma.storeMember.create({
    data: { userId, storeId, role: data.role },
  });

  revalidatePath("/team");
  return { success: true, member };
}

export async function updateMemberRole(memberId: string, role: Role) {
  const { storeId } = await requireAdminStoreId();

  const member = await prisma.storeMember.update({
    where: { id: memberId, storeId },
    data: { role },
  });

  revalidatePath("/team");
  return { success: true, member };
}

export async function removeMember(memberId: string) {
  const { storeId } = await requireAdminStoreId();
  await prisma.storeMember.delete({ where: { id: memberId, storeId } });
  revalidatePath("/team");
  return { success: true };
}
