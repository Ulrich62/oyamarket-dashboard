import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      { status: 400 }
    );
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Boutique introuvable." },
      { status: 404 }
    );
  }

  const products = await prisma.product.findMany({
    where: { storeId, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}
