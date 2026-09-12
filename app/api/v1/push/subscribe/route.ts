import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const SubscribeSchema = z.object({
  storeId: z.string().min(1, "storeId requis"),
  subscription: z.object({
    endpoint: z.string().url("endpoint URL valide requis"),
    keys: z.object({
      p256dh: z.string().min(1, "Clé p256dh requise"),
      auth: z.string().min(1, "Clé auth requise"),
    }),
  }),
  userAgent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 422, headers: corsHeaders }
      );
    }

    const { storeId, subscription, userAgent } = parsed.data;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Boutique introuvable" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Upsert subscription
    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        storeId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
      },
      create: {
        storeId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Abonnement push enregistré", id: saved.id },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Push Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Échec de l'enregistrement de l'abonnement push" },
      { status: 500, headers: corsHeaders }
    );
  }
}

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UnsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Endpoint requis" },
        { status: 422, headers: corsHeaders }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: parsed.data.endpoint },
    });

    return NextResponse.json(
      { success: true, message: "Abonnement push supprimé" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Push Unsubscribe] Error:", error);
    return NextResponse.json(
      { error: "Échec de la suppression de l'abonnement push" },
      { status: 500, headers: corsHeaders }
    );
  }
}
