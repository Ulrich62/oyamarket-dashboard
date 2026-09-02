"use server";

import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function uploadProductImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const ext = file.name.split(".").pop();
    const filename = `products/${uuidv4()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return { url: blob.url };
  } catch (error: any) {
    console.error("Vercel Blob error:", error);
    return { error: error.message || "Erreur d'upload" };
  }
}

