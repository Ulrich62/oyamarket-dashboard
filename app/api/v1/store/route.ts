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

/**
 * GET /api/v1/store?storeId=xxx
 * Returns public store information, homeData, pixelId, supportEmail.
 */
export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { error: "Le paramètre storeId est requis." },
      { status: 400, headers: corsHeaders }
    );
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      currency: true,
      pixelId: true,
      supportEmail: true,
      homeData: true,
    },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Boutique introuvable." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json({ store }, { headers: corsHeaders });
}
