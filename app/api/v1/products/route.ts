import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * GET /api/v1/products?storeId=xxx
 * Returns active products for the given store.
 * Public endpoint — no auth required.
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
    select: { id: true },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Boutique introuvable." },
      { status: 404, headers: corsHeaders }
    );
  }

  const products = await prisma.product.findMany({
    where: { storeId, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      imageUrl: true,
      isFeatured: true,
      featuredOrder: true,
      packs: {
        select: {
          id: true,
          name: true,
          subtitle: true,
          badge: true,
          quantity: true,
          price: true,
          compareAtPrice: true,
          isPopular: true,
          position: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { featuredOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ products }, { headers: corsHeaders });
}
