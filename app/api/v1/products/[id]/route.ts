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
 * GET /api/v1/products/[id]?storeId=xxx
 * Returns a single active product (by ID or slug) for the given store.
 * Public endpoint — no auth required.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const storeId = req.nextUrl.searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { error: "Le paramètre storeId est requis." },
      { status: 400, headers: corsHeaders }
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      storeId,
      isActive: true,
      deletedAt: null,
      OR: [
        { id },
        { slug: id },
      ],
    },
    select: {
      id: true,
      storeId: true,
      name: true,
      slug: true,
      category: true,
      price: true,
      compareAtPrice: true,
      costPrice: true,
      stock: true,
      imageUrl: true,
      isFeatured: true,
      featuredOrder: true,
      landingData: true,
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
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produit introuvable ou inactif." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json({ product }, { headers: corsHeaders });
}
