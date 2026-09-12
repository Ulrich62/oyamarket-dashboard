import { NextRequest, NextResponse } from "next/server";
import { sendPushToStore } from "@/lib/push";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const TestSchema = z.object({
  storeId: z.string().min(1, "storeId requis"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "storeId requis" },
        { status: 422, headers: corsHeaders }
      );
    }

    const { storeId } = parsed.data;

    const result = await sendPushToStore(storeId, {
      title: "🔔 Test Notification Push • OyaMarket",
      body: "Félicitations ! Vos notifications Push sont parfaitement configurées et opérationnelles.",
      data: {
        url: "/orders",
        type: "TEST",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Notification envoyée (${result.successCount} reçu(s), ${result.failureCount} échec(s))`,
        result,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Push Test] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du test de notification push" },
      { status: 500, headers: corsHeaders }
    );
  }
}
