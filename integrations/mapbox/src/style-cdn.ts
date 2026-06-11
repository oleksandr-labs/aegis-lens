/**
 * Style asset CDN configuration — style JSON, sprites and glyphs.
 *
 * Mapbox serves the style document, the sprite sheet (icons) and glyph PBFs
 * (fonts) from its own CDN; MapLibre/OpenFreeMap does the same from an open CDN.
 * This module centralizes the asset URL templates + the HTTP cache headers we
 * recommend a proxy/edge in front of them, so the three asset classes get TTLs
 * matched to how often they actually change.
 *
 * NOTE (ToS): we do not re-host Mapbox style/sprite/glyph assets on our own CDN
 * (see COMPLIANCE.md §2). These templates point at the vendor CDN; the cache
 * headers govern an OUR-origin proxy only for the openly-licensed MapLibre assets.
 */

export type StyleAssetClass = "style_json" | "sprite" | "glyphs";

export interface StyleCdnEndpoint {
  /** Mapbox-hosted template; `{token}` substituted at request time, never stored. */
  mapboxTemplate: string;
  /** Openly-licensed MapLibre/OpenFreeMap fallback template. */
  maplibreTemplate: string;
  /** Cache-Control max-age (seconds) appropriate for this asset class. */
  cacheMaxAgeSeconds: number;
  /** stale-while-revalidate window (seconds). */
  staleWhileRevalidateSeconds: number;
  /** Whether the asset is immutable once published (content-hashed). */
  immutable: boolean;
}

/**
 * Asset CDN config. Glyphs/sprites change rarely (long TTL); the style JSON can
 * change with a deploy, so it gets a shorter TTL + SWR so edits propagate fast.
 */
export const STYLE_CDN: Record<StyleAssetClass, StyleCdnEndpoint> = {
  style_json: {
    mapboxTemplate: "https://api.mapbox.com/styles/v1/{styleId}?access_token={token}",
    maplibreTemplate: "https://tiles.openfreemap.org/styles/{styleName}",
    cacheMaxAgeSeconds: 300, // 5 min — picks up style edits quickly
    staleWhileRevalidateSeconds: 3600,
    immutable: false,
  },
  sprite: {
    mapboxTemplate: "https://api.mapbox.com/styles/v1/{styleId}/sprite{ratio}.{ext}?access_token={token}",
    maplibreTemplate: "https://tiles.openfreemap.org/sprites/{styleName}/sprite{ratio}.{ext}",
    cacheMaxAgeSeconds: 86_400, // 1 day — icon sheet rarely changes
    staleWhileRevalidateSeconds: 604_800,
    immutable: false,
  },
  glyphs: {
    mapboxTemplate: "https://api.mapbox.com/fonts/v1/{username}/{fontstack}/{range}.pbf?access_token={token}",
    maplibreTemplate: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    cacheMaxAgeSeconds: 2_592_000, // 30 days — font glyphs are effectively static
    staleWhileRevalidateSeconds: 2_592_000,
    immutable: true,
  },
};

/** Render the Cache-Control header value for an asset class. */
export function cacheControlFor(asset: StyleAssetClass): string {
  const c = STYLE_CDN[asset];
  const parts = [
    "public",
    `max-age=${c.cacheMaxAgeSeconds}`,
    `stale-while-revalidate=${c.staleWhileRevalidateSeconds}`,
  ];
  if (c.immutable) parts.push("immutable");
  return parts.join(", ");
}

/**
 * Resolve a style-asset URL. When `hasToken` is false we return the openly-
 * licensed MapLibre template (no token substitution); the `{...}` placeholders
 * are filled by the caller per request so the token is never persisted.
 */
export function resolveStyleAssetTemplate(asset: StyleAssetClass, hasToken: boolean): string {
  const c = STYLE_CDN[asset];
  return hasToken ? c.mapboxTemplate : c.maplibreTemplate;
}
