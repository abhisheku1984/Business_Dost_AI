/* Business Dost AI — service worker
   Keeps the app openable with no network, and updates itself quietly.
   Strategy: network-first for pages (so a new version shows up), stale-while-revalidate
   for CSS/JS/fonts/icons. No network at all → whatever is cached. */

const VERSION = "bd-v6";
const CACHE = `business-dost-${VERSION}`;

const SHELL = [
  "./live.html",
  "./app.html",
  "./index.html",
  "./css/tokens.css",
  "./css/components.css",
  "./css/screens.css",
  "./css/app.css",
  "./css/live.css",
  "./js/live.js",
  "./js/drive.js",
  "./js/cloud.js",
  "./js/cloud-config.js",
  "./css/desktop.css",
  "./js/drive-config.js",
  "./js/screens.js",
  "./js/assistant.js",
  "./js/app-run.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png",
  "./assets/fonts/inter-latin-wght-normal.woff2",
  "./assets/fonts/inter-latin-ext-wght-normal.woff2",
  "./assets/fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  "./assets/fonts/noto-sans-devanagari-latin-wght-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(SHELL.map((url) => cache.add(new Request(url, { cache: "reload" }))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* pages: try the network, fall back to the cached shell */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("./live.html")))
    );
    return;
  }

  /* assets: serve from cache, refresh in the background */
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
