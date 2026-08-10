self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Don't intercept page navigations — a failed fetch here (e.g. mid OAuth
  // redirect chain) turns into a hard "network error" page load instead of
  // just letting the browser retry/handle it natively.
  if (event.request.mode === "navigate") return;
  event.respondWith(fetch(event.request).catch(() => Response.error()));
});
