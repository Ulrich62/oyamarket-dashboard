"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "oyamarket_medias";

export async function uploadProductImage(file: File): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const filename = `products/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return { url: publicUrl };
}
