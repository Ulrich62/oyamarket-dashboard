"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { switchStore } from "./store-context";

export async function createStore(name: string) {
  const session = await auth();
  if (!session?.user) return { error: "Non autorisé" };
  
  if (!name.trim()) return { error: "Le nom est requis" };

  try {
    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        currency: "XOF",
        members: {
          create: {
            userId: session.user.id!,
            role: "ADMIN",
          }
        }
      }
    });
    
    // Switch to the newly created store automatically
    await switchStore(store.id);
    revalidatePath("/", "layout");
    
    return { store };
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de la création de la boutique" };
  }
}
