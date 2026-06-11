/**
 * Tile cache strategy + offline/MapLibre fallback policy.
 *
 * Two concerns:
 *  1. CACHE TTLs per tile class — how long a client/edge may hold a tile. Live
 *     operational layers get short TTLs (freshness > cache hit rate); basemap and
 *     thermal get long TTLs. For OUR PostGIS tiles these align with the layer
 *     `ttlSeconds` in `services/tiles` layer-registry; for Mapbox basemap we only
 *     allow in-SDK/browser cache (ToS — no re-hosting, see COMPLIANCE.md §2).
 *  2. OFFLINE FALLBACK — when the network or the Mapbox token is unavailable, the
 *     app degrades to MapLibre + OpenFreeMap (openly licensed) and serves the most
 *     recent self-hosted MVT from cache, marked stale.
 */

export type TileCacheClass = "basemap" | "live_operational" | "slow_operational" | "thermal" | "raster_imagery";

export interface TileCacheRule {
  cacheClass: TileCacheClass;
  /** Browser/edge max-age (seconds). */
  maxAgeSeconds: number;
  /** stale-while-revalidate window (seconds). */
  staleWhileRevalidateSeconds: number;
  /** May this tile class be persisted to OUR CDN? Mapbox basemap = false (ToS). */
  selfHostable: boolean;
}

export const TILE_CACHE_RULES: Record<TileCacheClass, TileCacheRule> = {
  basemap: {
    cacheClass: "basemap",
    maxAgeSeconds: 86_400, // 1 day in-SDK/browser cache only
    staleWhileRevalidateSeconds: 604_800,
    selfHostable: false, // Mapbox ToS — do not re-host their basemap tiles
  },
  live_operational: {
    cacheClass: "live_operational",
    maxAgeSeconds: 60, // matches drones (~60s) — freshness over hit rate
    staleWhileRevalidateSeconds: 120,
    selfHostable: true,
  },
  slow_operational: {
    cacheClass: "slow_operational",
    maxAgeSeconds: 3_600, // power_outages / infrastructure cadence
    staleWhileRevalidateSeconds: 7_200,
    selfHostable: true,
  },
  thermal: {
    cacheClass: "thermal",
    maxAgeSeconds: 21_600, // 6h — FIRMS data cadence
    staleWhileRevalidateSeconds: 43_200,
    selfHostable: true,
  },
  raster_imagery: {
    cacheClass: "raster_imagery",
    maxAgeSeconds: 86_400, // 1 day — satellite RGB
    staleWhileRevalidateSeconds: 604_800,
    selfHostable: true,
  },
};

/** Render a Cache-Control header for a tile cache class. */
export function tileCacheControl(cacheClass: TileCacheClass): string {
  const r = TILE_CACHE_RULES[cacheClass];
  const scope = r.selfHostable ? "public" : "private"; // private = browser/SDK only
  return `${scope}, max-age=${r.maxAgeSeconds}, stale-while-revalidate=${r.staleWhileRevalidateSeconds}`;
}

export type OfflineReason = "network_down" | "no_mapbox_token" | "rate_limited" | "budget_exceeded";

export interface OfflineFallbackPolicy {
  reason: OfflineReason;
  /** Basemap to switch to when degraded. */
  basemap: "maplibre_openfreemap";
  /** Serve last-known self-hosted MVT from cache even if past TTL. */
  serveStaleSelfHosted: boolean;
  /** Surface a "data may be stale / offline" banner to the user (en + uk). */
  userNotice: { en: string; uk: string };
}

/** Resolve the offline/degraded behaviour for a given reason. */
export function offlineFallback(reason: OfflineReason): OfflineFallbackPolicy {
  const notices: Record<OfflineReason, { en: string; uk: string }> = {
    network_down: {
      en: "Offline — showing cached map data; it may be out of date.",
      uk: "Офлайн — показано кешовані дані карти; вони можуть бути застарілими.",
    },
    no_mapbox_token: {
      en: "Using the open MapLibre basemap (Mapbox unavailable).",
      uk: "Використовується відкрита базова карта MapLibre (Mapbox недоступний).",
    },
    rate_limited: {
      en: "Map provider rate-limited — switched to the fallback basemap.",
      uk: "Перевищено ліміт запитів до постачальника — переключено на резервну базову карту.",
    },
    budget_exceeded: {
      en: "Monthly map budget reached — using the open fallback basemap.",
      uk: "Досягнуто місячного бюджету карти — використовується відкрита резервна карта.",
    },
  };
  return {
    reason,
    basemap: "maplibre_openfreemap",
    serveStaleSelfHosted: true,
    userNotice: notices[reason],
  };
}
