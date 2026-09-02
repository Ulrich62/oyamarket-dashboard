"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface MetaCapiPayload {
  eventName: string;
  eventId: string;
  orderId: string;
  value: number;
  currency: string;
  customerPhone?: string;
  fbc?: string;
  fbp?: string;
}

async function getStorePixelConfig(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    select: { pixelId: true, capiToken: true },
  });
}

/**
 * Envoie un événement Purchase via Meta Conversions API
 * Déclenché UNIQUEMENT quand une commande passe au statut DELIVERED
 */
export async function sendMetaCapiPurchase(orderId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Non autorisé" };
  const user = session.user;

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true },
  });
  if (!member) return { error: "Boutique introuvable" };

  const [order, config] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId, storeId: member.storeId },
      select: {
        id: true,
        totalAmount: true,
        customerPhone: true,
        fbc: true,
        fbp: true,
        status: true,
      },
    }),
    getStorePixelConfig(member.storeId),
  ]);

  if (!order) return { error: "Commande introuvable" };
  if (order.status !== "DELIVERED") return { error: "La commande n'est pas encore livrée" };
  if (!config?.pixelId || !config?.capiToken) {
    return { error: "Meta Pixel non configuré dans les paramètres" };
  }

  const eventId = `purchase_${orderId}_${Date.now()}`;

  // Hash du téléphone pour le matching
  const hashedPhone = order.customerPhone
    ? await hashSHA256(normalizePhone(order.customerPhone))
    : undefined;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "system_generated",
        user_data: {
          ph: hashedPhone ? [hashedPhone] : undefined,
          fbc: order.fbc ?? undefined,
          fbp: order.fbp ?? undefined,
        },
        custom_data: {
          value: order.totalAmount / 1, // FCFA — Meta accepte sans conversion
          currency: "XOF",
          order_id: orderId,
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
      console.error("[META CAPI] Error:", json);
      return { error: json.error?.message ?? "Erreur Meta CAPI" };
    }

    return { success: true, eventId, response: json };
  } catch (err) {
    console.error("[META CAPI] Network error:", err);
    return { error: "Erreur réseau lors de l'envoi CAPI" };
  }
}

async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(phone: string): string {
  // Retirer espaces, tirets, parenthèses — garder le + et les chiffres
  return phone.replace(/[\s\-().]/g, "");
}
