import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let storeId = formData.get("storeId") as string | null;
    const folder = (formData.get("folder") as string) || "oyamarket/media";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Resolve storeId if missing
    if (!storeId) {
      storeId = req.cookies.get("store_id")?.value || null;
      if (!storeId) {
        const firstStore = await prisma.store.findFirst({ select: { id: true } });
        storeId = firstStore?.id || null;
      }
    }

    if (!storeId) {
      return NextResponse.json(
        { error: "Boutique introuvable pour associer le média." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type
    const isVideo = file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // Clean public_id from file name (without extension)
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniquePublicId = `${baseName}_${Date.now()}`;

    // Upload to Cloudinary in dedicated oyamarket folder/bucket
    const uploadResult = await uploadBufferToCloudinary(buffer, {
      folder,
      publicId: uniquePublicId,
      resourceType,
    });

    // Save record to database
    const media = await prisma.media.create({
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

    return NextResponse.json(
      {
        success: true,
        url: media.url,
        media,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Erreur lors de l'upload Cloudinary:", error);
    return NextResponse.json(
      { error: error.message || "Échec de l'upload vers Cloudinary." },
      { status: 500, headers: corsHeaders }
    );
  }
}
