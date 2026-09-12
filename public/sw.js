// OyaMarket Service Worker - Web Push Notifications & Background Sync

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "OyaMarket", body: event.data.text() };
    }
  }

  const title = data.title || "Nouvelle commande • OyaMarket";
  const options = {
    body: data.body || "Une nouvelle commande vient d'être enregistrée !",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: "/orders" },
    tag: data.data?.orderId ? `order-${data.data.orderId}` : `oyamarket-order-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "Voir la commande 👀",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/orders";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an open client is on the dashboard, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if (client.url !== targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
