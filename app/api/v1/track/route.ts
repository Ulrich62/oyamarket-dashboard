import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { subMinutes } from "date-fns";

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

/**
 * POST /api/v1/track
 * Enregistre une visite de page et mesure les visiteurs uniques par boutique.
 * Intègre une déduplication par fenêtre de 15 minutes pour éviter le spam.
 */
const TrackSchema = z.object({
  storeId: z.string().trim().min(1, "storeId requis"),
  visitorId: z.string().trim().min(1, "visitorId requis"),
  path: z.string().trim().min(1, "path requis"),
  slug: z.string().trim().optional().nullable(),
  referrer: z.string().trim().optional().nullable(),
  device: z.string().trim().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  let body: unknown;
  try {
    const raw = await req.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400, headers: corsHeaders }
    );
  }

  const parsed = TrackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422, headers: corsHeaders }
    );
  }

  const { storeId, visitorId, path, slug, referrer, device } = parsed.data;

  // Récupérer le user agent depuis les headers
  const userAgent = req.headers.get("user-agent") || undefined;

  // Détecter device si non spécifié
  const detectedDevice =
    device ||
    (userAgent && /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop");

  try {
    // Vérifier l'existence du store pour éviter un crash FK
    const storeExists = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!storeExists) {
      return NextResponse.json(
        { error: "Boutique introuvable" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Déduplication légère : Si le même visitorId sur le même path a déjà été tracké dans les 15 dernières minutes,
    // on ne gonfle pas la base inutilement
    const fifteenMinutesAgo = subMinutes(new Date(), 15);
    const existing = await prisma.pageView.findFirst({
      where: {
        storeId,
        visitorId,
        path,
        createdAt: { gte: fifteenMinutesAgo },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ success: true, deduplicated: true }, { headers: corsHeaders });
    }

    await prisma.pageView.create({
      data: {
        storeId,
        visitorId,
        path,
        slug: slug ?? null,
        referrer: referrer ?? null,
        device: detectedDevice,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders });
  } catch (err: any) {
    console.error("[Track API] Erreur d'enregistrement:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors du tracking" },
      { status: 500, headers: corsHeaders }
    );
  }
}
