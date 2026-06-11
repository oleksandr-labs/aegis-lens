/**
 * Vector tile CDN cache policies — per layer TTL and header builder.
 *
 * Cache strategy:
 *  - Live layers      (air_raid_alerts, social_media):  CDN 30s   / browser 10s
 *  - Near-realtime    (power_outages, frontline):       CDN 5min  / browser 60s
 *  - Daily-update     (equipment_losses, infra):        CDN 1h    / browser 5min
 *  - Static           (regions, admin boundaries):      CDN 7d    / browser 24h
 *
 * Use `purgeTileCache` after a layer is updated to evict stale tiles immediately.
 */

export interface TileCachePolicy {
  layerId: string;
  cdnTtlSeconds: number;
  browserTtlSeconds: number;
  /** Cloudflare Surrogate-Key / Cache-Tag for targeted purge. */
  surrogateKey: string;
  /** Headers whose values differentiate cached responses. */
  varyHeaders: string[];
}

export const TILE_CACHE_POLICIES: TileCachePolicy[] = [
  // ── Live layers ────────────────────────────────────────────────────────────
  {
    layerId: "air_raid_alerts",
    cdnTtlSeconds: 30,
    browserTtlSeconds: 10,
    surrogateKey: "tiles-live air_raid_alerts",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "social_media",
    cdnTtlSeconds: 30,
    browserTtlSeconds: 10,
    surrogateKey: "tiles-live social_media",
    varyHeaders: ["Accept-Encoding"],
  },

  // ── Near-realtime layers ───────────────────────────────────────────────────
  {
    layerId: "power_outages",
    cdnTtlSeconds: 300, // 5 min
    browserTtlSeconds: 60,
    surrogateKey: "tiles-nearrt power_outages",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "frontline",
    cdnTtlSeconds: 300,
    browserTtlSeconds: 60,
    surrogateKey: "tiles-nearrt frontline",
    varyHeaders: ["Accept-Encoding"],
  },

  // ── Daily-update layers ────────────────────────────────────────────────────
  {
    layerId: "equipment_losses",
    cdnTtlSeconds: 3600, // 1 h
    browserTtlSeconds: 300,
    surrogateKey: "tiles-daily equipment_losses",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "infrastructure",
    cdnTtlSeconds: 3600,
    browserTtlSeconds: 300,
    surrogateKey: "tiles-daily infrastructure",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "confirmed_strikes",
    cdnTtlSeconds: 3600,
    browserTtlSeconds: 300,
    surrogateKey: "tiles-daily confirmed_strikes",
    varyHeaders: ["Accept-Encoding"],
  },

  // ── Static layers ──────────────────────────────────────────────────────────
  {
    layerId: "regions",
    cdnTtlSeconds: 604_800, // 7 days
    browserTtlSeconds: 86_400,
    surrogateKey: "tiles-static regions",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "admin_boundaries",
    cdnTtlSeconds: 604_800,
    browserTtlSeconds: 86_400,
    surrogateKey: "tiles-static admin_boundaries",
    varyHeaders: ["Accept-Encoding"],
  },
  {
    layerId: "oblasts",
    cdnTtlSeconds: 604_800,
    browserTtlSeconds: 86_400,
    surrogateKey: "tiles-static oblasts",
    varyHeaders: ["Accept-Encoding"],
  },
];

/** Lookup map for fast policy resolution by layerId. */
const POLICY_MAP = new Map<string, TileCachePolicy>(
  TILE_CACHE_POLICIES.map((p) => [p.layerId, p])
);

/**
 * Build HTTP cache headers for a given tile layer.
 *
 * Returns headers suitable for a Next.js Route Handler response:
 *   `Cache-Control`     — browser + shared cache directives
 *   `CDN-Cache-Control` — Cloudflare-specific override
 *   `Surrogate-Key`     — Cloudflare Cache-Tag for targeted purge
 *   `Vary`              — headers that differentiate cached responses
 */
export function buildTileCacheHeaders(
  layerId: string
): Record<string, string> {
  const policy = POLICY_MAP.get(layerId);

  if (!policy) {
    // Unknown layer — conservative defaults
    return {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "CDN-Cache-Control": "max-age=60",
      "Surrogate-Key": `tiles-unknown ${layerId}`,
      Vary: "Accept-Encoding",
    };
  }

  return {
    "Cache-Control": [
      "public",
      `max-age=${policy.browserTtlSeconds}`,
      `s-maxage=${policy.cdnTtlSeconds}`,
      "stale-while-revalidate=10",
    ].join(", "),
    "CDN-Cache-Control": `max-age=${policy.cdnTtlSeconds}`,
    "Surrogate-Key": policy.surrogateKey,
    Vary: policy.varyHeaders.join(", "),
  };
}

/**
 * Purge tiles for a layer from Cloudflare's edge cache.
 *
 * Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables.
 * No-ops silently when credentials are absent (safe in dev/test).
 *
 * @param layerId - Layer whose tiles should be purged.
 * @param region  - Optional: if provided, purge only tiles tagged with this region.
 */
export async function purgeTileCache(
  layerId: string,
  region?: string
): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    // Credentials not configured — no-op (expected in dev)
    return;
  }

  const policy = POLICY_MAP.get(layerId);
  const tag = region
    ? `${policy?.surrogateKey ?? layerId} ${region}`
    : (policy?.surrogateKey ?? layerId);

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags: tag.split(" ") }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Cloudflare cache purge failed for layer "${layerId}": ${response.status} ${body}`
    );
  }
}
