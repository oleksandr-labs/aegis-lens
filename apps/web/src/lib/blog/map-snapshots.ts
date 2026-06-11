/**
 * Blog map snapshot types and URL builder.
 * Snapshots are static images generated server-side and served from CDN.
 *
 * Типи та конструктор URL для знімків карти у блозі.
 * Знімки — це статичні зображення, згенеровані на сервері і роздані через CDN.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A captured map snapshot embedded in a blog post.
 * Знімок карти, вбудований у публікацію блогу.
 */
export interface BlogMapSnapshot {
  snapshotId: string;
  /** Bounding box [west, south, east, north] in WGS84 */
  bbox: [number, number, number, number];
  zoom: number;
  /** Active map layer ids included in the snapshot */
  layers: string[];
  /** ISO-8601 capture timestamp */
  capturedAt: string;
  /** CDN URL for the thumbnail (320 × 200) */
  thumbnailUrl: string;
  /** CDN URL for the full-resolution image (1200 × 750) */
  fullUrl: string;
  alt: string;
  altUk: string;
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

const SNAPSHOT_API_BASE = "/api/v1/map/snapshot";

/**
 * Builds the API endpoint URL for generating or retrieving a map snapshot.
 * Формує URL API-ендпоінту для генерації або отримання знімка карти.
 *
 * @param bbox    [west, south, east, north]
 * @param zoom    Tile zoom level (0–22)
 * @param layers  Active layer ids to include
 */
export function buildBlogMapSnapshotUrl(
  bbox: number[],
  zoom: number,
  layers: string[],
): string {
  const params = new URLSearchParams({
    bbox:   bbox.join(","),
    zoom:   String(zoom),
    layers: layers.join(","),
  });
  return `${SNAPSHOT_API_BASE}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const MAP_SNAPSHOT_NOTES_EN: string[] = [
  "static-image-served-from-CDN: snapshots are generated once by the server-side Playwright screenshot pipeline and uploaded to Cloudflare R2; the CDN URL is stored in BlogMapSnapshot.fullUrl and never re-generated on each page request.",
  "auto-regenerate-if-stale: if the snapshot capturedAt is older than 24 hours and the post was updated, a background job should re-capture the snapshot and update the CDN URL via /api/v1/map/snapshot (POST).",
];

export const MAP_SNAPSHOT_NOTES_UK: string[] = [
  "static-image-served-from-CDN: знімки генеруються один раз серверним пайплайном Playwright і завантажуються на Cloudflare R2; URL CDN зберігається у BlogMapSnapshot.fullUrl і не перегенерується при кожному запиті сторінки.",
  "auto-regenerate-if-stale: якщо capturedAt знімка старше 24 годин і публікацію було оновлено, фонове завдання має перезнімати знімок і оновлювати CDN URL через /api/v1/map/snapshot (POST).",
];
