import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createOrderNotification } from "@/lib/notifications";
import { sendMetaCapiLead } from "@/lib/actions/meta-capi";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

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
 *   customerCity?: string,
 *   quartier?: string,
 *   notes?: string,
 *   eventId?: string,    // Meta event_id for Lead deduplication
 *   fbc?: string,        // Facebook click ID (from _fbc cookie)
 *   fbp?: string,        // Facebook browser ID (from _fbp cookie)
 *   items: [{ productId: string, quantity: number, price: number }]
 * }
 */

const OrderSchema = z.object({
  storeId: z.string().min(1, "storeId requis"),
  customerName: z.string().min(1, "customerName requis"),
  customerPhone: z.string().min(1, "customerPhone requis"),
  customerCity: z.string().optional().nullable(),
  quartier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  fbc: z.string().optional().nullable(),
  fbp: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        packId: z.string().optional().nullable(),
        quantity: z.number().int().positive().default(1),
        price: z.number().int().nonnegative().optional(),
      })
    )
    .min(1, "Au moins un article est requis"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400, headers: corsHeaders }
    );
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten().fieldErrors },
      { status: 422, headers: corsHeaders }
    );
  }

  const {
    storeId,
    customerName,
    customerPhone,
    customerCity,
    quartier,
    notes,
    eventId,
    fbc,
    fbp,
    items,
  } = parsed.data;

  // Verify store exists and retrieve pixel / CAPI configuration
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, pixelId: true, capiToken: true },
  });
  if (!store) {
    return NextResponse.json(
      { error: "Boutique introuvable." },
      { status: 404, headers: corsHeaders }
    );
  }

  // Verify all products belong to the store and are active
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId, isActive: true },
    include: { packs: true },
  });
  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs produits sont invalides ou inactifs." },
      { status: 400, headers: corsHeaders }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Compute items with pack pricing and physical units
  const computedItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const selectedPack = item.packId
      ? product.packs.find((pk) => pk.id === item.packId)
      : null;

    if (selectedPack) {
      const unitPrice = selectedPack.price;
      const quantity = item.quantity;
      const unitsCount = selectedPack.quantity * quantity;
      const totalPrice = unitPrice * quantity;
      return {
        productId: item.productId,
        packId: selectedPack.id,
        packName: selectedPack.name,
        quantity,
        unitsCount,
        unitPrice,
        totalPrice,
      };
    }

    const unitPrice = item.price !== undefined ? item.price : product.price;
    const quantity = item.quantity;
    const unitsCount = quantity;
    const totalPrice = unitPrice * quantity;
    return {
      productId: item.productId,
      packId: null,
      packName: null,
      quantity,
      unitsCount,
      unitPrice,
      totalPrice,
    };
  });

  const totalAmount = computedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const order = await prisma.order.create({
    data: {
      storeId,
      customerName,
      customerPhone,
      customerCity: customerCity ?? null,
      quartier: quartier ?? null,
      notes: notes ?? null,
      totalAmount,
      status: "NEW",
      fbc: fbc ?? null,
      fbp: fbp ?? null,
      items: {
        create: computedItems.map((item) => ({
          productId: item.productId,
          packId: item.packId,
          packName: item.packName,
          quantity: item.quantity,
          unitsCount: item.unitsCount,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          price: item.unitPrice,
        })),
      },
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      customerName: true,
      customerCity: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          packId: true,
          packName: true,
          quantity: true,
          unitsCount: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  });

  // Trigger in-app notification & Web Push
  createOrderNotification({
    id: order.id,
    storeId,
    customerName,
    totalAmount,
    customerCity: customerCity ?? null,
    items: computedItems.map((i) => ({
      packName: i.packName,
      quantity: i.quantity,
    })),
  }).catch((notifErr) => {
    console.error("[Orders] Notification dispatch failed:", notifErr);
  });

  // Meta CAPI : Déclenchement sécurisé du Lead côté serveur pour déduplication Pixel
  const leadEventId = eventId || `lead_${order.id}_${Date.now()}`;
  if (store.pixelId && store.capiToken) {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const clientUserAgent = req.headers.get("user-agent") || null;
    const sourceUrl = req.headers.get("referer") || undefined;
    const firstProduct = products[0];

    sendMetaCapiLead({
      pixelId: store.pixelId,
      capiToken: store.capiToken,
      orderId: order.id,
      eventId: leadEventId,
      customerName,
      customerPhone,
      customerCity: customerCity ?? undefined,
      totalAmount,
      currency: "XOF",
      fbc: fbc ?? undefined,
      fbp: fbp ?? undefined,
      clientIp,
      clientUserAgent,
      sourceUrl,
      contentName: firstProduct?.name ?? "Commande OyaMarket",
      contentIds: productIds,
    }).catch((capiErr) => {
      console.error("[META CAPI Lead] Erreur non-bloquante:", capiErr);
    });
  }

  return NextResponse.json({ success: true, order, eventId: leadEventId }, { status: 201, headers: corsHeaders });
}
