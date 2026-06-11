/**
 * Task 3 — Per-AOI caching strategy.
 *
 * Satellite Process API calls are expensive (processing units) and deterministic
 * for a given (AOI + time window + evalscript + collection + output size). This
 * module produces a stable cache key from those inputs and a TTL policy keyed on
 * the AOI's refresh cadence, so the same scene is never re-billed within its
 * freshness window.
 *
 * This is a pure key/TTL-policy layer — the actual blob store (S3, disk, KV) is
 * injected via the `AoiCacheStore` interface so the platform can plug in whatever
 * backend it already runs.
 */

import type { BBox, DataCollection } from "./client";
import type { RefreshCadence } from "./aoi-scheduler";
import { CADENCE_INTERVAL_MS } from "./aoi-scheduler";

/** Everything that makes a Process API result unique. */
export interface CacheKeyInput {
  /** Stable AOI identifier (preferred) — falls back to bbox if absent. */
  aoiId?: string;
  bbox: BBox;
  collection: DataCollection;
  /** ISO time window the imagery was requested for. */
  timeRange: { from: string; to: string };
  /** The evalscript source — hashed, not stored verbatim, in the key. */
  evalscript: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Fast, dependency-free 32-bit FNV-1a hash → hex. Sufficient for cache-key
 * disambiguation (NOT a cryptographic hash). Keeps evalscript + bbox compact.
 */
export function fnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply
    h = Math.imul(h, 0x01000193);
  }
  // force unsigned, fixed-width hex
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Rounds bbox coords so trivially-different floats still hit the same tile. */
function normaliseBBox(b: BBox): string {
  const r = (n: number) => Math.round(n * 1e5) / 1e5;
  return `${r(b.west)},${r(b.south)},${r(b.east)},${r(b.north)}@${b.crs ?? "4326"}`;
}

/**
 * Deterministic cache key: `sh/<collection>/<aoi-or-bboxhash>/<timehash>/<scripthash>/<size>`.
 * Two requests that would return identical imagery map to the same key.
 */
export function buildCacheKey(input: CacheKeyInput): string {
  const aoiPart = input.aoiId ?? `bbox-${fnv1aHex(normaliseBBox(input.bbox))}`;
  const timePart = fnv1aHex(`${input.timeRange.from}|${input.timeRange.to}`);
  const scriptPart = fnv1aHex(input.evalscript);
  const sizePart = `${input.width ?? 512}x${input.height ?? 512}.${(input.format ?? "image/png").split("/")[1]}`;
  return `sh/${input.collection}/${aoiPart}/t${timePart}/e${scriptPart}/${sizePart}`;
}

/**
 * TTL policy.
 *
 * Optical/SAR scenes are immutable once acquired, so a *closed* historical time
 * window can be cached effectively forever. An *open-ended* window (to === "now"
 * / a recent date) must expire on the AOI's cadence so new acquisitions appear.
 */
export interface TtlPolicy {
  ttlMs: number;
  /** Why this TTL was chosen — for observability. */
  reason: "immutable_historical" | "cadence_bound" | "default";
}

const DEFAULT_TTL_MS = 6 * 3600_000; // 6h
const IMMUTABLE_TTL_MS = 365 * 24 * 3600_000; // 1y — practically permanent

/**
 * Compute a TTL for a cached scene.
 * @param cadence  the AOI's refresh cadence (drives cadence-bound TTL)
 * @param windowToMs  the `to` bound of the request window, in ms
 * @param now  current time (injectable for tests)
 */
export function computeTtl(
  cadence: RefreshCadence | undefined,
  windowToMs: number,
  now: number = Date.now(),
): TtlPolicy {
  // If the requested window closed comfortably in the past, the imagery cannot
  // change — cache it as immutable. ("Comfortably" = window ended > 2 days ago.)
  if (windowToMs < now - 2 * 24 * 3600_000) {
    return { ttlMs: IMMUTABLE_TTL_MS, reason: "immutable_historical" };
  }
  const interval = cadence ? CADENCE_INTERVAL_MS[cadence] : null;
  if (interval && interval > 0) {
    return { ttlMs: interval, reason: "cadence_bound" };
  }
  return { ttlMs: DEFAULT_TTL_MS, reason: "default" };
}

/** A cached entry envelope (metadata the store keeps alongside the blob). */
export interface CacheEntryMeta {
  key: string;
  storedAt: number;
  expiresAt: number;
  ttlReason: TtlPolicy["reason"];
  /** Bytes of the cached payload, for cache-size accounting. */
  sizeBytes?: number;
}

/** True when an entry has passed its expiry. */
export function isExpired(meta: CacheEntryMeta, now: number = Date.now()): boolean {
  return now >= meta.expiresAt;
}

/**
 * Pluggable cache backend. Implementations wrap S3 / disk / KV. The integration
 * itself stays storage-agnostic.
 */
export interface AoiCacheStore {
  get(key: string): Promise<{ meta: CacheEntryMeta; data: Uint8Array } | null>;
  set(key: string, data: Uint8Array, meta: CacheEntryMeta): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Read-through cache helper: returns a cached scene if fresh, otherwise calls
 * `produce()` (the billed Process API call), stores it with the computed TTL, and
 * returns it. Returns whether the result was a cache hit (for PU accounting in
 * `cost-monitor.ts`).
 */
export async function readThrough(
  store: AoiCacheStore,
  input: CacheKeyInput,
  cadence: RefreshCadence | undefined,
  produce: () => Promise<Uint8Array>,
  now: number = Date.now(),
): Promise<{ data: Uint8Array; hit: boolean; key: string }> {
  const key = buildCacheKey(input);
  const existing = await store.get(key);
  if (existing && !isExpired(existing.meta, now)) {
    return { data: existing.data, hit: true, key };
  }

  const data = await produce();
  const ttl = computeTtl(cadence, Date.parse(input.timeRange.to) || now, now);
  await store.set(key, data, {
    key,
    storedAt: now,
    expiresAt: now + ttl.ttlMs,
    ttlReason: ttl.reason,
    sizeBytes: data.byteLength,
  });
  return { data, hit: false, key };
}
