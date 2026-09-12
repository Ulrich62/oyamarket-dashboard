"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  Info,
  BellRing,
  Send,
  Loader2,
  CheckCircle2,
  BellOff,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { playNotificationChime } from "@/lib/audio";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  storeId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

interface NotificationCenterProps {
  storeId?: string;
}

export function NotificationCenter({ storeId }: NotificationCenterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const {
    permission,
    isSubscribed,
    loading: pushLoading,
    subscribe,
    sendTest,
  } = usePushNotifications(storeId);

  // Store known IDs to only sound the chime on genuinely new incoming notifications
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  const fetchNotifications = useCallback(
    async (isPolling = false) => {
      if (!storeId) return;

      try {
        const res = await fetch(`/api/v1/notifications?storeId=${storeId}&limit=20`);
        if (!res.ok) return;

        const data = await res.json();
        const incomingNotifs: NotificationItem[] = data.notifications || [];
        const incomingCount: number = data.unreadCount || 0;

        // On polling, check if there are new unread notifications that we haven't seen yet
        if (initialLoadDoneRef.current && isPolling) {
          const newUnreadItems = incomingNotifs.filter(
            (item) => !item.isRead && !knownIdsRef.current.has(item.id)
          );

          if (newUnreadItems.length > 0) {
            // Play chime alert
            playNotificationChime();

            // Display toast notification
            const latest = newUnreadItems[0];
            toast.success(latest.title, {
              description: latest.message,
              action: {
                label: "Voir",
                onClick: () => {
                  router.push(latest.link || "/orders");
                },
              },
            });

            // Also trigger native OS desktop notification banner (macOS / Windows)
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(latest.title, {
                      body: latest.message,
                      icon: "/icon-192.png",
                      badge: "/icon-192.png",
                      data: { url: latest.link || "/orders", orderId: latest.id },
                      tag: `order-${latest.id}`,
                      requireInteraction: true,
                    });
                  });
                }
              } catch (desktopErr) {
                console.warn("[NotificationCenter] Desktop notification failed:", desktopErr);
              }
            }
          }
        }

        // Update known IDs
        incomingNotifs.forEach((item) => knownIdsRef.current.add(item.id));
        setNotifications(incomingNotifs);
        setUnreadCount(incomingCount);
      } catch (err) {
        console.error("[NotificationCenter] Fetch error:", err);
      } finally {
        setLoading(false);
        initialLoadDoneRef.current = true;
      }
    },
    [storeId, router]
  );

  // Initial fetch and 15-second polling
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark a single notification as read
  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch("/api/v1/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
      } catch (err) {
        console.error("[NotificationCenter] Mark as read error:", err);
      }
    }

    setOpen(false);
    router.push(notif.link || "/orders");
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!storeId || unreadCount === 0) return;

    try {
      setMarkingAll(true);
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, markAll: true }),
      });
      toast.success("Toutes les notifications sont marquées comme lues.");
    } catch (err) {
      console.error("[NotificationCenter] Mark all as read error:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return <ShoppingBag className="h-4 w-4 text-emerald-400" />;
      case "LOW_STOCK":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Notifications"
          aria-label="Centre de notifications"
          className="relative text-ink-3 hover:text-ink transition-colors p-2 rounded-lg hover:bg-bg-elev cursor-pointer select-none"
        >
          <Bell className="h-5 w-5" />

          {/* Dynamic Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-bg animate-in zoom-in-50 duration-200">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
              <span className="relative">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 border border-line bg-bg-elev/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-soft bg-bg-elev/80">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400 border border-red-500/20">
                {unreadCount} {unreadCount === 1 ? "nouvelle" : "nouvelles"}
              </span>
            )}
          </div>

          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>Tout marquer lu</span>
          </button>
        </div>

        {/* Web Push Status / Setup Banner */}
        <div className="px-4 py-2.5 bg-bg-elev-2/60 border-b border-line-soft">
          {permission === "granted" && isSubscribed ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Push notifications actives</span>
              </div>
              <button
                onClick={sendTest}
                disabled={pushLoading}
                title="Tester l'envoi d'une notification push"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-bg text-ink-2 hover:text-ink hover:bg-bg-elev border border-line transition-colors cursor-pointer"
              >
                {pushLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                <span>Tester</span>
              </button>
            </div>
          ) : permission === "denied" ? (
            <div className="flex items-center gap-2 text-[11px] text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Notifications bloquées par votre navigateur. Autorisez-les dans les réglages du site.</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-xs text-ink-2">
                  Recevez vos commandes en direct sur votre écran
                </span>
              </div>
              <button
                onClick={subscribe}
                disabled={pushLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                {pushLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
                <span>Activer</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Items List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-line-soft">
          {loading ? (
            <div className="p-6 text-center space-y-2">
              <Loader2 className="h-5 w-5 animate-spin text-ink-3 mx-auto" />
              <p className="text-xs text-ink-4">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-bg-elev-2 flex items-center justify-center mx-auto text-ink-4">
                <BellOff className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-ink-2">Aucune notification</p>
              <p className="text-[11px] text-ink-4">
                Vous recevrez une alerte sonore et push à chaque nouvelle commande.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const formattedDate = formatDistanceToNow(new Date(notif.createdAt), {
                addSuffix: true,
                locale: fr,
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 transition-colors cursor-pointer group",
                    notif.isRead
                      ? "hover:bg-bg-elev-2/70 opacity-80 hover:opacity-100"
                      : "bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08]"
                  )}
                >
                  {/* Icon badge */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                      notif.type === "NEW_ORDER"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-bg-elev-2 border-line text-ink-3"
                    )}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs truncate",
                          notif.isRead ? "text-ink-2 font-normal" : "text-ink font-semibold"
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-ink-3 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <p className="text-[10px] text-ink-4 pt-0.5">{formattedDate}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-line-soft bg-bg-elev/60 text-center">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/orders");
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-ink-3 hover:text-ink hover:bg-bg-elev rounded-lg transition-colors cursor-pointer"
          >
            <span>Voir toutes les commandes</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
