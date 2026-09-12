import { prisma } from "@/lib/prisma";
import { sendPushToStore } from "@/lib/push";

export interface OrderNotificationInput {
  id: string;
  storeId: string;
  customerName: string;
  totalAmount: number;
  customerCity?: string | null;
  items?: Array<{
    packName?: string | null;
    quantity: number;
  }>;
}

/**
 * Creates an in-app notification in the database and dispatches a native Web Push alert.
 * Designed to be resilient: errors are logged but won't throw to disrupt the calling checkout flow.
 */
export async function createOrderNotification(order: OrderNotificationInput) {
  try {
    const formattedAmount = `${order.totalAmount.toLocaleString("fr-FR")} FCFA`;
    const title = `Nouvelle commande • ${formattedAmount}`;
    const locationPart = order.customerCity ? ` (${order.customerCity})` : "";
    const itemsCount = order.items?.reduce((acc, it) => acc + it.quantity, 0) ?? 1;
    const itemsPart = itemsCount > 1 ? ` (${itemsCount} articles)` : "";
    const message = `${order.customerName}${locationPart} vient de commander${itemsPart}.`;
    const link = `/orders`;

    // 1. Save in-app notification to DB
    const notification = await prisma.notification.create({
      data: {
        storeId: order.storeId,
        type: "NEW_ORDER",
        title,
        message,
        link,
        isRead: false,
        metadata: {
          orderId: order.id,
          totalAmount: order.totalAmount,
          customerName: order.customerName,
          customerCity: order.customerCity,
        },
      },
    });

    // 2. Dispatch Web Push notification asynchronously
    sendPushToStore(order.storeId, {
      title,
      body: message,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: {
        url: link,
        orderId: order.id,
      },
    }).catch((pushErr) => {
      console.error("[Notifications] Failed to dispatch Web Push:", pushErr);
    });

    return notification;
  } catch (error) {
    console.error("[Notifications] Failed to create notification for order:", order.id, error);
    return null;
  }
}
