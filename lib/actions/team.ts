"use server";

import { requireStoreId, requireAdminStoreId, getCurrentMemberContext } from "@/lib/actions/store-context";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const InviteMemberSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional().nullable(),
  role: z.nativeEnum(Role),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères").optional().nullable(),
});

export async function getTeamMembers() {
  const storeId = await requireStoreId();
  return prisma.storeMember.findMany({
    where: { storeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDeliveryAgents() {
  const storeId = await requireStoreId();
  return prisma.storeMember.findMany({
    where: {
      storeId,
      role: { in: ["DELIVERY", "STAFF"] },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getCurrentUserRole() {
  try {
    const context = await getCurrentMemberContext();
    return {
      userId: context.userId,
      role: context.role,
      memberId: context.memberId,
      userName: context.user.name,
      userEmail: context.user.email,
    };
  } catch {
    return null;
  }
}

export async function inviteMember(rawData: {
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  password?: string | null;
}) {
  const { storeId } = await requireAdminStoreId();

  const parsed = InviteMemberSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Données d'invitation invalides" };
  }

  const { name, role, phone } = parsed.data;
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  // Vérifier si l'utilisateur existe déjà
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let temporaryPassword: string | null = null;

  if (user) {
    // Vérifier s'il est déjà membre de cette boutique
    const existingMembership = await prisma.storeMember.findUnique({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId,
        },
      },
    });

    if (existingMembership) {
      return { error: "Cet utilisateur est déjà membre de cette boutique." };
    }

    // Si le profil n'a pas encore de téléphone ou nom, le mettre à jour
    if ((!user.name && name) || (!user.phone && phone)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && !user.name ? { name } : {}),
          ...(phone && !user.phone ? { phone } : {}),
        },
      });
    }

    // Attacher l'utilisateur existant à cette boutique
    await prisma.storeMember.create({
      data: {
        userId: user.id,
        storeId,
        role,
      },
    });

    revalidatePath("/team");
    revalidatePath("/orders");
    return {
      success: true,
      isExistingUser: true,
      message: `L'utilisateur ${user.email} a été ajouté avec succès à l'équipe.`,
    };
  }

  // Création d'un nouvel utilisateur
  temporaryPassword =
    parsed.data.password ||
    `Oya${Math.floor(100000 + Math.random() * 900000)}!`;
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || null,
      password: hashedPassword,
    },
  });

  await prisma.storeMember.create({
    data: {
      userId: user.id,
      storeId,
      role,
    },
  });

  revalidatePath("/team");
  revalidatePath("/orders");

  return {
    success: true,
    isExistingUser: false,
    temporaryPassword,
    message: `Membre ${name} (${normalizedEmail}) créé et ajouté avec succès.`,
  };
}

export async function updateMemberRole(memberId: string, newRole: Role) {
  const { storeId } = await requireAdminStoreId();

  const member = await prisma.storeMember.findFirst({
    where: { id: memberId, storeId },
  });

  if (!member) {
    return { error: "Membre introuvable dans cette boutique." };
  }

  // Si on rétrograde un ADMIN vers un autre rôle, s'assurer qu'il reste au moins 1 ADMIN
  if (member.role === "ADMIN" && newRole !== "ADMIN") {
    const adminCount = await prisma.storeMember.count({
      where: { storeId, role: "ADMIN" },
    });

    if (adminCount <= 1) {
      return {
        error: "Action refusée : Vous ne pouvez pas rétrograder le seul administrateur de la boutique.",
      };
    }
  }

  await prisma.storeMember.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath("/team");
  revalidatePath("/orders");

  return { success: true, message: "Rôle mis à jour avec succès." };
}

export async function removeMember(memberId: string) {
  const { storeId, userId } = await requireAdminStoreId();

  const member = await prisma.storeMember.findFirst({
    where: { id: memberId, storeId },
  });

  if (!member) {
    return { error: "Membre introuvable dans cette boutique." };
  }

  // Garde-fou 1 : Ne pas permettre de s'auto-supprimer
  if (member.userId === userId) {
    return {
      error: "Vous ne pouvez pas retirer votre propre compte depuis la gestion de l'équipe.",
    };
  }

  // Garde-fou 2 : Ne pas supprimer le dernier ADMIN
  if (member.role === "ADMIN") {
    const adminCount = await prisma.storeMember.count({
      where: { storeId, role: "ADMIN" },
    });

    if (adminCount <= 1) {
      return {
        error: "Action refusée : Impossible de supprimer le seul administrateur de la boutique.",
      };
    }
  }

  // Si c'était un livreur, désassigner ses commandes non finalisées
  if (member.role === "DELIVERY") {
    await prisma.order.updateMany({
      where: {
        storeId,
        assignedToId: member.userId,
        status: { in: ["NEW", "PENDING_CONFIRMATION", "CONFIRMED"] },
      },
      data: {
        assignedToId: null,
      },
    });
  }

  await prisma.storeMember.delete({
    where: { id: memberId },
  });

  revalidatePath("/team");
  revalidatePath("/orders");

  return { success: true, message: "Membre retiré de l'équipe avec succès." };
}
