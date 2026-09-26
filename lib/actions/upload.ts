"use server";

import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "./store-context";

export async function uploadProductImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    if (!file) {
      return { error: "Aucun fichier fourni." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniquePublicId = `${baseName}_${Date.now()}`;

    const uploadResult = await uploadBufferToCloudinary(buffer, {
      folder: "oyamarket/products",
      publicId: uniquePublicId,
      resourceType: "image",
    });

    // Enregistrer le média dans la médiathèque de la boutique si connecté
    try {
      const storeId = await requireStoreId();
      if (storeId) {
        await prisma.media.create({
          data: {
            storeId,
            name: file.name,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            resourceType: uploadResult.resource_type,
            bytes: uploadResult.bytes || file.size,
            width: uploadResult.width ?? null,
            height: uploadResult.height ?? null,
          },
        });
      }
    } catch {
      // Ignorer si la session boutique n'est pas accessible
    }

    return { url: uploadResult.secure_url };
  } catch (error: any) {
    console.error("Cloudinary upload error in uploadProductImage:", error);
    return { error: error.message || "Erreur lors de l'upload de l'image" };
  }
}
