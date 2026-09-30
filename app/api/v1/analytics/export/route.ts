import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Non autorisé. Veuillez vous connecter au dashboard.", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();
  const period = searchParams.get("period") || "30d";
  const customStoreId = searchParams.get("storeId");

  // Identifier le storeId de l'utilisateur
  let storeId = customStoreId;
  if (!storeId) {
    const member = await prisma.storeMember.findFirst({
      where: { userId: session.user.id },
      select: { storeId: true },
    });
    if (!member) {
      return new NextResponse("Aucune boutique trouvée.", { status: 404 });
    }
    storeId = member.storeId;
  }

  // Période
  let since: Date | undefined;
  const now = new Date();
  if (period === "today") since = startOfDay(now);
  else if (period === "7d") since = subDays(now, 7);
  else if (period === "30d") since = subDays(now, 30);
  // sinon "all" -> pas de filtre temporel

  // Récupérer les sessions avec tous leurs événements
  const sessions = await prisma.userSession.findMany({
    where: {
      storeId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    include: {
      events: {
        orderBy: { timestamp: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const timestampStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  if (format === "sql") {
    // Génération d'un script SQL autonome (compatible PostgreSQL / SQLite / MySQL)
    const sqlStatements: string[] = [];
    sqlStatements.push(`-- OyaMarket Raw Analytics Export`);
    sqlStatements.push(`-- Store ID: ${storeId}`);
    sqlStatements.push(`-- Export Date: ${new Date().toISOString()}`);
    sqlStatements.push(`-- Total Sessions: ${sessions.length}`);
    sqlStatements.push(`\nBEGIN;\n`);

    sqlStatements.push(`-- Schema structure`);
    sqlStatements.push(`CREATE TABLE IF NOT EXISTS oyamarket_user_sessions (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  device TEXT,
  network_type TEXT,
  screen_size TEXT,
  fbclid TEXT,
  utm_source TEXT,
  max_scroll_depth INT,
  duration_seconds INT,
  active_section TEXT,
  selected_pack TEXT,
  form_started BOOLEAN,
  last_field_touched TEXT,
  has_ordered BOOLEAN,
  has_whatsapp BOOLEAN,
  has_rage_click BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
);\n`);

    sqlStatements.push(`CREATE TABLE IF NOT EXISTS oyamarket_session_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  timestamp TIMESTAMP WITH TIME ZONE
);\n`);

    for (const s of sessions) {
      const escape = (val: any) => (val === null || val === undefined ? "NULL" : `'${String(val).replace(/'/g, "''")}'`);
      sqlStatements.push(
        `INSERT INTO oyamarket_user_sessions (id, store_id, visitor_id, device, network_type, screen_size, fbclid, utm_source, max_scroll_depth, duration_seconds, active_section, selected_pack, form_started, last_field_touched, has_ordered, has_whatsapp, has_rage_click, created_at) VALUES (${escape(s.id)}, ${escape(s.storeId)}, ${escape(s.visitorId)}, ${escape(s.device)}, ${escape(s.networkType)}, ${escape(s.screenSize)}, ${escape(s.fbclid)}, ${escape(s.utmSource)}, ${s.maxScrollDepth}, ${s.durationSeconds}, ${escape(s.activeSection)}, ${escape(s.selectedPack)}, ${s.formStarted}, ${escape(s.lastFieldTouched)}, ${s.hasOrdered}, ${s.hasWhatsApp}, ${s.hasRageClick}, ${escape(s.createdAt.toISOString())});`
      );

      for (const ev of s.events) {
        const payloadStr = ev.payload ? JSON.stringify(ev.payload).replace(/'/g, "''") : null;
        const payloadSql = payloadStr ? `'${payloadStr}'::jsonb` : "NULL";
        sqlStatements.push(
          `INSERT INTO oyamarket_session_events (id, session_id, event_type, payload, timestamp) VALUES (${escape(ev.id)}, ${escape(ev.sessionId)}, ${escape(ev.eventType)}, ${payloadSql}, ${escape(ev.timestamp.toISOString())});`
        );
      }
    }

    sqlStatements.push(`\nCOMMIT;\n`);

    const sqlContent = sqlStatements.join("\n");
    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="oyamarket-telemetry-${timestampStr}.sql"`,
      },
    });
  }

  // Format JSON par défaut
  const jsonContent = JSON.stringify(
    {
      storeId,
      exportedAt: new Date().toISOString(),
      period,
      totalSessions: sessions.length,
      sessions,
    },
    null,
    2
  );

  return new NextResponse(jsonContent, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="oyamarket-telemetry-${timestampStr}.json"`,
    },
  });
}
