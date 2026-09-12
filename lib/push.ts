import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:contact@oyamarket.shop";

if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  } catch (err) {
    console.error("[WebPush] Initialization error:", err);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    orderId?: string;
    [key: string]: unknown;
  };
}

export async function sendPushToStore(
  storeId: string,
  payload: PushNotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn("[WebPush] VAPID keys not configured, skipping push.");
    return { successCount: 0, failureCount: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { storeId },
  });

  if (subscriptions.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const stringifiedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    data: payload.data || { url: "/orders" },
  });

  let successCount = 0;
  let failureCount = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, stringifiedPayload);
        successCount++;
      } catch (error: any) {
        failureCount++;
        console.error(`[WebPush] Send error for endpoint:`, error?.statusCode || error?.message);
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    try {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: expiredEndpoints } },
      });
    } catch (cleanErr) {
      console.error("[WebPush] Error cleaning up expired subscriptions:", cleanErr);
    }
  }

  return { successCount, failureCount };
}
