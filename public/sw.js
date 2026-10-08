/* Etch service worker — deliberately minimal.
 *
 * Exists for two reasons:
 *   1. Installability: Chrome only fires `beforeinstallprompt` for apps
 *      with a manifest + a service worker that has a fetch handler.
 *   2. Web Share Target: the installed PWA's share-sheet entry POSTs to
 *      /share-target; the SW keeps the app launchable offline-capable in
 *      the platform sense (no offline caching is attempted).
 *
 * Intentionally NETWORK-ONLY: the fetch handler does not call
 * respondWith, so every request goes straight to the network and page /
 * asset updates can never go stale behind a cache.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // This SW keeps no caches; drop any left by older experiments.
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

// Presence (not behavior) is what makes the app installable.
self.addEventListener("fetch", () => {});
