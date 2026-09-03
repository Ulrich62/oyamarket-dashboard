import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/products/[id]?storeId=xxx
 * Returns a single active product for the given store.
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
      { status: 400 }
    );
  }

  const product = await prisma.product.findFirst({
    where: { id, storeId, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produit introuvable ou inactif." },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}
