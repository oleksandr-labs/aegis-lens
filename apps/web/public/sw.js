/**
 * Aegis Lens service worker.
 *
 * Strategies:
 *   - App shell (HTML + JS + CSS): cache-first, updated on install
 *   - Map tiles: cache-first with 7-day TTL
 *   - API events (recent): network-first, fallback to cache (stale read)
 *   - Static assets: cache-first
 *   - Everything else: network-only
 */

const CACHE_VERSION = "v1";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const TILE_CACHE = `tiles-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/",
  "/map",
  "/search",
  "/alerts",
  "/offline",
];

const TILE_HOSTS = [
  "tile.openstreetmap.org",
  "basemaps.cartocdn.com",
  "api.mapbox.com",
  "tiles.maplibre.org",
];

const API_CACHE_PATHS = [
  "/api/events",
  "/api/layers",
  "/api/regions",
  "/api/sources",
];

const TILE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const API_MAX_AGE_MS = 5 * 60 * 1000;

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== TILE_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== "GET") return;

  // Map tiles → cache-first
  if (TILE_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(tileFirst(request));
    return;
  }

  // API events → network-first, cache fallback
  if (API_CACHE_PATHS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(networkFirst(request, API_CACHE, API_MAX_AGE_MS));
    return;
  }

  // Same-origin navigation → shell cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline") ?? new Response("Offline", { status: 503 }),
      ),
    );
    return;
  }

  // Static assets → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }
});

// ── Strategies ────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      const date = cached.headers.get("date");
      if (date && Date.now() - new Date(date).getTime() < maxAgeMs) {
        return cached;
      }
    }
    return new Response(JSON.stringify({ error: "offline", cached: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function tileFirst(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    const date = cached.headers.get("date");
    if (!date || Date.now() - new Date(date).getTime() < TILE_MAX_AGE_MS) {
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached ?? new Response("", { status: 503 });
  }
}

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Aegis Lens Alert", {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: data.tag ?? "aegis-alert",
      requireInteraction: data.priority === "critical",
      data: { url: data.url ?? "/" },
      vibrate: data.priority === "critical" ? [200, 100, 200] : [100],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url === url && "focus" in c);
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      }),
  );
});

// ── Background sync ───────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-field-reports") {
    event.waitUntil(syncFieldReports());
  }
});

async function syncFieldReports() {
  // Field reports queued offline are stored in IndexedDB.
  // This stub triggers the sync when connectivity is restored.
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: "sync-field-reports" }));
}
