import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId requis" },
        { status: 400, headers: corsHeaders }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { storeId, isRead: false },
      }),
    ]);

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Notifications GET] Error:", error);
    return NextResponse.json(
      { error: "Échec de récupération des notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}

const PatchSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Corps de requête invalide" },
        { status: 422, headers: corsHeaders }
      );
    }

    const { id, storeId, markAll } = parsed.data;

    if (markAll && storeId) {
      await prisma.notification.updateMany({
        where: { storeId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json(
        { success: true, message: "Toutes les notifications ont été marquées comme lues" },
        { status: 200, headers: corsHeaders }
      );
    }

    if (id) {
      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json(
        { success: true, notification: updated },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Soit id soit markAll avec storeId requis" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Notifications PATCH] Error:", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour des notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}
