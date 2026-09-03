"use server";

import { requireStoreId, requireAdminStoreId } from "@/lib/actions/store-context";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function getTeamMembers() {
  const storeId = await requireStoreId();
  return prisma.storeMember.findMany({
    where: { storeId },
    include: { user: true },
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
