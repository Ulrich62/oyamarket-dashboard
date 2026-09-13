"use client";

import { useEffect, useState, useCallback } from "react";
import { urlBase64ToUint8Array } from "@/lib/push-client";
import { playNotificationChime } from "@/lib/audio";
import { toast } from "sonner";

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export function usePushNotifications(storeId?: string) {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Check support and current permission on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermissionState);

    // Register service worker and inspect existing subscription
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
          // Always sync existing subscription to DB so server push works
          if (storeId) {
            try {
              await fetch("/api/v1/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  storeId,
                  subscription: sub,
                  userAgent: navigator.userAgent,
                }),
              });
            } catch (syncErr) {
              console.warn("[Push Hook] Auto-sync to DB error:", syncErr);
            }
          }
        } else if (Notification.permission === "granted" && storeId) {
          // Auto-resubscribe if permission was already granted by user
          try {
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (publicVapidKey) {
              const convertedKey = urlBase64ToUint8Array(publicVapidKey);
              const newSub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey as unknown as BufferSource,
              });
              await fetch("/api/v1/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  storeId,
                  subscription: newSub,
                  userAgent: navigator.userAgent,
                }),
              });
              setIsSubscribed(true);
            }
          } catch (autoErr) {
            console.warn("[Push Hook] Auto re-subscription skipped:", autoErr);
          }
        }
      })
      .catch((err) => {
        console.error("[Push Hook] SW registration failed:", err);
      });
  }, [storeId]);

  // Subscribe to Web Push
  const subscribe = useCallback(async () => {
    if (!storeId) {
      toast.error("Boutique introuvable pour l'abonnement push.");
      return false;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Les notifications Push ne sont pas supportées par votre navigateur.");
      return false;
    }

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
      toast.error("Clé VAPID publique non configurée sur le serveur.");
      return false;
    }

    try {
      setLoading(true);

      // Request browser permission
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result !== "granted") {
        toast.error("Autorisation des notifications refusée par le navigateur.");
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Subscribe via PushManager
      const convertedKey = urlBase64ToUint8Array(publicVapidKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });

      // Send subscription to server
      const res = await fetch("/api/v1/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          subscription,
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur lors de l'enregistrement de l'abonnement push");
      }

      setIsSubscribed(true);
      toast.success("Notifications Push activées avec succès ! 🔔");
      return true;
    } catch (err: any) {
      console.error("[Push Hook] Subscribe error:", err);
      toast.error(err?.message || "Échec de l'activation des notifications");
      return false;
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Unsubscribe from Web Push
  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/v1/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }

      setIsSubscribed(false);
      toast.info("Notifications Push désactivées.");
      return true;
    } catch (err: any) {
      console.error("[Push Hook] Unsubscribe error:", err);
      toast.error("Erreur lors de la désactivation");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a test notification
  const sendTest = useCallback(async () => {
    if (!storeId) return;
    try {
      setLoading(true);

      // 1. Play the crisp audio chime immediately upon click
      playNotificationChime();

      // 2. Dispatch the real Web Push via FCM server (single notification, deduplicated by tag)
      const res = await fetch("/api/v1/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Notification de test envoyée ! Regardez le coin supérieur droit de votre Mac 🚀", {
          description: "Si aucune bannière n'apparaît, vérifiez dans Réglages Système > Notifications > Google Chrome que les bannières sont autorisées.",
          duration: 6000,
        });
      } else {
        toast.error(data.error || "Échec du test push");
      }
    } catch (err) {
      toast.error("Erreur réseau lors du test push");
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  return {
    permission,
    isSubscribed,
    loading,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
