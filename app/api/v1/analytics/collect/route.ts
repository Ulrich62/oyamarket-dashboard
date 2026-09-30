import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders(req) });
}

const EventItemSchema = z.object({
  type: z.string().trim().min(1),
  payload: z.any().optional(),
  ts: z.number().optional(),
});

const CollectBatchSchema = z.object({
  storeId: z.string().trim().min(1),
  visitorId: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
  device: z.string().optional().nullable(),
  browser: z.string().optional().nullable(),
  networkType: z.string().optional().nullable(),
  screenSize: z.string().optional().nullable(),
  fbclid: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  path: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  maxScrollDepth: z.number().int().nonnegative().optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional().nullable(),
  activeSection: z.string().optional().nullable(),
  selectedPack: z.string().optional().nullable(),
  formStarted: z.boolean().optional().nullable(),
  lastFieldTouched: z.string().optional().nullable(),
  hasOrdered: z.boolean().optional().nullable(),
  hasWhatsApp: z.boolean().optional().nullable(),
  hasRageClick: z.boolean().optional().nullable(),
  orderId: z.string().optional().nullable(),
  events: z.array(EventItemSchema).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  let rawText = "";
  try {
    rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ success: true, empty: true }, { headers: corsHeaders });
    }
  } catch {
    return NextResponse.json({ error: "Corps de requête illisible" }, { status: 400, headers: corsHeaders });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400, headers: corsHeaders });
  }

  const parsed = CollectBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: parsed.error.flatten() },
      { status: 422, headers: corsHeaders }
    );
  }

  const data = parsed.data;

  try {
    // 1. Upsert la session utilisateur
    const existingSession = await prisma.userSession.findUnique({
      where: { id: data.sessionId },
      select: {
        id: true,
        maxScrollDepth: true,
        durationSeconds: true,
        formStarted: true,
        hasOrdered: true,
        hasWhatsApp: true,
        hasRageClick: true,
      },
    });

    if (existingSession) {
      await prisma.userSession.update({
        where: { id: data.sessionId },
        data: {
          maxScrollDepth: Math.max(existingSession.maxScrollDepth, data.maxScrollDepth ?? 0),
          durationSeconds: Math.max(existingSession.durationSeconds, data.durationSeconds ?? 0),
          activeSection: data.activeSection ?? undefined,
          selectedPack: data.selectedPack ?? undefined,
          formStarted: existingSession.formStarted || (data.formStarted ?? false),
          lastFieldTouched: data.lastFieldTouched ?? undefined,
          hasOrdered: existingSession.hasOrdered || (data.hasOrdered ?? false),
          hasWhatsApp: existingSession.hasWhatsApp || (data.hasWhatsApp ?? false),
          hasRageClick: existingSession.hasRageClick || (data.hasRageClick ?? false),
          orderId: data.orderId ?? undefined,
          networkType: data.networkType ?? undefined,
        },
      });
    } else {
      await prisma.userSession.create({
        data: {
          id: data.sessionId,
          storeId: data.storeId,
          visitorId: data.visitorId,
          device: data.device ?? "mobile",
          browser: data.browser ?? null,
          networkType: data.networkType ?? null,
          screenSize: data.screenSize ?? null,
          fbclid: data.fbclid ?? null,
          utmSource: data.utmSource ?? null,
          utmCampaign: data.utmCampaign ?? null,
          utmContent: data.utmContent ?? null,
          path: data.path ?? "/",
          slug: data.slug ?? null,
          maxScrollDepth: data.maxScrollDepth ?? 0,
          durationSeconds: data.durationSeconds ?? 0,
          activeSection: data.activeSection ?? null,
          selectedPack: data.selectedPack ?? null,
          formStarted: data.formStarted ?? false,
          lastFieldTouched: data.lastFieldTouched ?? null,
          hasOrdered: data.hasOrdered ?? false,
          hasWhatsApp: data.hasWhatsApp ?? false,
          hasRageClick: data.hasRageClick ?? false,
          orderId: data.orderId ?? null,
        },
      });
    }

    // 2. Insérer les événements détaillés du batch (s'il y en a)
    if (data.events && data.events.length > 0) {
      await prisma.sessionEvent.createMany({
        data: data.events.map((ev) => ({
          sessionId: data.sessionId,
          eventType: ev.type,
          payload: ev.payload ? ev.payload : null,
          timestamp: ev.ts ? new Date(ev.ts) : new Date(),
        })),
      });
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("[Analytics Collect API] Error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la collecte" },
      { status: 500, headers: corsHeaders }
    );
  }
}
