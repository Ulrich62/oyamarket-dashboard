"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface SendMetaCapiLeadParams {
  storeId?: string;
  pixelId?: string;
  capiToken?: string;
  orderId: string;
  eventId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerCity?: string | null;
  totalAmount: number;
  currency?: string;
  fbc?: string | null;
  fbp?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  sourceUrl?: string | null;
  contentName?: string | null;
  contentIds?: string[] | null;
}

export interface MetaCapiResult {
  success?: boolean;
  eventId?: string;
  response?: any;
  error?: string;
}

async function getStorePixelConfig(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    select: { pixelId: true, capiToken: true },
  });
}

/**
 * Hash SHA-256 standard Meta CAPI (chaîne nettoyée en minuscules sans espaces superflus)
 */
export async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Normalise un numéro de téléphone pour Meta CAPI (norme E.164 sans '+' ni '0' initial avant l'indicatif).
 * Pour le Bénin (+229) : format obligatoire 22901XXXXXXXX (13 chiffres).
 * Meta exige l'indicatif pays suivi du numéro sans '+' et sans espaces/symboles.
 */
function normalizePhone(phone: string): string {
  if (!phone) return "";
  // 1. Supprimer tous les caractères non numériques (+, espaces, tirets, parenthèses)
  let digits = phone.replace(/\D/g, "");

  // 2. Retirer l'éventuel préfixe international "00" (ex: 00229... -> 229...)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // 3. Traitement spécifique Bénin (indicatif 229)
  if (digits.startsWith("229")) {
    const national = digits.slice(3);
    // Si l'indicatif 229 était suivi de 8 chiffres sans le préfixe ARCEP "01"
    if (national.length === 8) {
      return `22901${national}`;
    }
    return digits; // ex: 22901XXXXXXXX (13 chiffres)
  }

  // Si format national 10 chiffres ARCEP (01XXXXXXXX)
  if (digits.length === 10 && digits.startsWith("01")) {
    return `229${digits}`; // -> 22901XXXXXXXX
  }

  // Si ancien format national 8 chiffres sans le préfixe ARCEP "01"
  if (digits.length === 8) {
    return `22901${digits}`; // -> 22901XXXXXXXX
  }

  // Cas général : renvoyer les chiffres sans '+'
  return digits;
}

function cleanName(name?: string | null): { firstName?: string; lastName?: string } {
  if (!name) return {};
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function cleanCity(city?: string | null): string {
  if (!city) return "";
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/**
 * Construit l'objet user_data standardisé pour maximiser l'Event Match Quality (EMQ) Meta
 */
export async function buildUserData(data: {
  customerPhone?: string | null;
  customerName?: string | null;
  customerCity?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
}) {
  const userData: Record<string, any> = {};

  if (data.customerPhone) {
    const norm = normalizePhone(data.customerPhone);
    if (norm) {
      userData.ph = [await hashSHA256(norm)];
    }
  }

  if (data.customerName) {
    const { firstName, lastName } = cleanName(data.customerName);
    if (firstName) {
      userData.fn = [await hashSHA256(firstName)];
    }
    if (lastName) {
      userData.ln = [await hashSHA256(lastName)];
    }
  }

  if (data.customerCity) {
    const c = cleanCity(data.customerCity);
    if (c) {
      userData.ct = [await hashSHA256(c)];
    }
  }

  // Code pays ISO 3166-1 alpha-2 en minuscules hashé (Bénin = "bj")
  userData.country = [await hashSHA256("bj")];

  if (data.fbc) userData.fbc = data.fbc;
  if (data.fbp) userData.fbp = data.fbp;
  if (data.clientIp) userData.client_ip_address = data.clientIp;
  if (data.clientUserAgent) userData.client_user_agent = data.clientUserAgent;

  return userData;
}

/**
 * Envoie un événement Lead via Meta Conversions API (CAPI).
 * Déclenché lors de la création d'une commande via POST /api/v1/orders.
 * Partage le même event_id avec le Pixel navigateur pour déduplication sans doublon.
 */
export async function sendMetaCapiLead(params: SendMetaCapiLeadParams): Promise<MetaCapiResult> {
  let pixelId = params.pixelId;
  let capiToken = params.capiToken;

  if ((!pixelId || !capiToken) && params.storeId) {
    const config = await getStorePixelConfig(params.storeId);
    pixelId = config?.pixelId ?? undefined;
    capiToken = config?.capiToken ?? undefined;
  }

  if (!pixelId || !capiToken) {
    return { error: "Meta Pixel ou Token CAPI non configuré pour cette boutique" };
  }

  const userData = await buildUserData({
    customerPhone: params.customerPhone,
    customerName: params.customerName,
    customerCity: params.customerCity,
    fbc: params.fbc,
    fbp: params.fbp,
    clientIp: params.clientIp,
    clientUserAgent: params.clientUserAgent,
  });

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.sourceUrl ?? undefined,
        action_source: "website",
        user_data: userData,
        custom_data: {
          value: params.totalAmount,
          currency: params.currency || "XOF",
          content_name: params.contentName ?? undefined,
          content_ids: params.contentIds ?? undefined,
          order_id: params.orderId,
        },
      },
    ],
    test_event_code: process.env.META_CAPI_TEST_CODE ?? undefined,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      console.error("[META CAPI Lead] Error:", json);
      return { error: json.error?.message ?? "Erreur Meta CAPI" };
    }

    return { success: true, eventId: params.eventId, response: json };
  } catch (err: any) {
    console.error("[META CAPI Lead] Network error:", err);
    return { error: err.message || "Erreur réseau lors de l'envoi CAPI" };
  }
}

/**
 * Envoie un événement Purchase via Meta Conversions API (CAPI).
 * Déclenché UNIQUEMENT quand une commande passe au statut DELIVERED.
 * Attribuable grâce à la fenêtre d'attribution 7 jours clic / 1 jour vue.
 */
export async function sendMetaCapiPurchase(orderId: string, options?: { storeId?: string }): Promise<MetaCapiResult> {
  let storeId = options?.storeId;

  if (!storeId) {
    const session = await auth();
    if (!session?.user) return { error: "Non autorisé" };
    const member = await prisma.storeMember.findFirst({
      where: { userId: session.user.id },
      select: { storeId: true },
    });
    if (!member) return { error: "Boutique introuvable" };
    storeId = member.storeId;
  }

  const [order, config] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId, storeId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    }),
    getStorePixelConfig(storeId),
  ]);

  if (!order) return { error: "Commande introuvable" };
  if (order.status !== "DELIVERED") return { error: "La commande n'est pas encore livrée" };
  if (!config?.pixelId || !config?.capiToken) {
    return { error: "Meta Pixel non configuré dans les paramètres" };
  }

  // ID d'événement déterministe pour éviter les doublons en cas de relance
  const eventId = `purchase_${orderId}`;

  const userData = await buildUserData({
    customerPhone: order.customerPhone,
    customerName: order.customerName,
    customerCity: order.customerCity,
    fbc: order.fbc,
    fbp: order.fbp,
  });

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: userData,
        custom_data: {
          value: order.totalAmount,
          currency: "XOF",
          order_id: orderId,
          content_type: "product",
          contents: order.items.map((i) => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.unitPrice,
          })),
        },
      },
    ],
    test_event_code: process.env.META_CAPI_TEST_CODE ?? undefined,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${config.pixelId}/events?access_token=${config.capiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      console.error("[META CAPI Purchase] Error:", json);
      return { error: json.error?.message ?? "Erreur Meta CAPI" };
    }

    return { success: true, eventId, response: json };
  } catch (err: any) {
    console.error("[META CAPI Purchase] Network error:", err);
    return { error: err.message || "Erreur réseau lors de l'envoi CAPI" };
  }
}
