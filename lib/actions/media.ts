"use server";

import { requireStoreId } from "@/lib/actions/store-context";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getMedias(filters?: {
  resourceType?: string;
  query?: string;
}) {
  const storeId = await requireStoreId();

  return prisma.media.findMany({
    where: {
      storeId,
      ...(filters?.resourceType && filters.resourceType !== "ALL"
        ? { resourceType: filters.resourceType }
        : {}),
      ...(filters?.query
        ? {
            name: {
              contains: filters.query,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteMedia(id: string) {
  const storeId = await requireStoreId();

  const media = await prisma.media.findFirst({
    where: { id, storeId },
  });

  if (!media) {
    throw new Error("Média introuvable.");
  }

  // Delete from Cloudinary if publicId is present
  if (media.publicId) {
    try {
      await deleteFromCloudinary(media.publicId, media.resourceType as any);
    } catch (err) {
      console.warn("Could not delete from Cloudinary:", err);
    }
  }

  // Delete from PostgreSQL
  await prisma.media.delete({
    where: { id },
  });

  revalidatePath("/media");
  return { success: true };
}
