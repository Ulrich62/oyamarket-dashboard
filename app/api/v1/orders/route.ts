import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * POST /api/v1/orders
 * Creates a new order for the given store.
 * Public endpoint — called from the storefront form.
 *
 * Body:
 * {
 *   storeId: string,
 *   customerName: string,
 *   customerPhone: string,
 *   quartier?: string,
 *   fbc?: string,        // Facebook click ID (from _fbc cookie)
 *   fbp?: string,        // Facebook browser ID (from _fbp cookie)
 *   items: [{ productId: string, quantity: number, price: number }]
 * }
 */

const OrderSchema = z.object({
  storeId: z.string().min(1, "storeId requis"),
  customerName: z.string().min(1, "customerName requis"),
  customerPhone: z.string().min(1, "customerPhone requis"),
  quartier: z.string().optional().nullable(),
  fbc: z.string().optional().nullable(),
  fbp: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().int().nonnegative(),
      })
    )
    .min(1, "Au moins un article est requis"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { storeId, customerName, customerPhone, quartier, fbc, fbp, items } = parsed.data;

  // Verify store exists
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
  }

  // Verify all products belong to the store and are active
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId, isActive: true },
    select: { id: true },
  });
  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs produits sont invalides ou inactifs." },
      { status: 400 }
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      storeId,
      customerName,
      customerPhone,
      quartier: quartier ?? null,
      totalAmount,
      status: "NEW",
      fbc: fbc ?? null,
      fbp: fbp ?? null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, order }, { status: 201 });
}
