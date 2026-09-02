"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { z } from "zod";

async function requireAdminStoreId(): Promise<{ storeId: string; role: Role }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Non autorisé");

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true, role: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  if (member.role !== "ADMIN") throw new Error("Accès réservé aux admins");

  return { storeId: member.storeId, role: member.role };
}

async function getStoreId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Non autorisé");
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

  // Créer l'utilisateur via l'API admin Supabase
  const supabase = await createClient();
  const { data: authData, error } = await (supabase as any).auth.admin?.inviteUserByEmail
    ? (supabase as any).auth.admin.inviteUserByEmail(data.email)
    : { data: null, error: { message: "Admin API non disponible" } };

  if (error) return { error: error.message };

  const userId = authData?.user?.id;
  if (!userId) return { error: "Impossible de créer l'utilisateur" };

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
