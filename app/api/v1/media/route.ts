import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get("resourceType");
    const query = searchParams.get("query")?.trim() || "";
    let storeId = searchParams.get("storeId") || req.cookies.get("store_id")?.value;

    if (!storeId) {
      const firstStore = await prisma.store.findFirst({ select: { id: true } });
      storeId = firstStore?.id || "cmtxoxqor000112jrigl2lu6w";
    }

    const where: any = {
      storeId,
    };

    if (resourceType && resourceType !== "ALL") {
      where.resourceType = resourceType;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { url: { contains: query, mode: "insensitive" } },
        { format: { contains: query, mode: "insensitive" } },
      ];
    }

    const medias = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(
      {
        success: true,
        medias,
        total: medias.length,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Erreur lors de la récupération des médias:", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les médias." },
      { status: 500, headers: corsHeaders }
    );
  }
}
