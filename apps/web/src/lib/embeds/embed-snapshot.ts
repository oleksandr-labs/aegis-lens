/**
 * Embed Snapshot — server-side OG-image fallback for crawlers.
 *
 * Generates stable snapshot URLs so that crawlers (Twitter, Facebook,
 * LinkedIn, Google) receive a pre-rendered OG image instead of a blank iframe.
 *
 * Генерує URL знімка для crawlers — замість порожнього iframe.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** OG image standard width in pixels. Стандартна ширина OG-зображення. */
const SNAPSHOT_DEFAULT_WIDTH = 1200;

/** OG image standard height in pixels. Стандартна висота OG-зображення. */
const SNAPSHOT_DEFAULT_HEIGHT = 630;

/**
 * How long a snapshot is considered fresh (minutes).
 *
 * Час актуальності знімка (хвилини).
 */
export const SNAPSHOT_CACHE_TTL_MINUTES = 60;

/** Base route for the snapshot API. Базовий маршрут API знімків. */
const SNAPSHOT_API_ROUTE = '/api/v1/embeds/snapshot';

/** Supported embed types for snapshots. Типи embed-ів для знімків. */
export type SnapshotEmbedType = 'map' | 'event-card' | 'timeline' | 'heatmap' | 'region-brief';

// ── Interfaces ────────────────────────────────────────────────────────────────

/**
 * Configuration for snapshot dimensions.
 *
 * Конфігурація розмірів знімка.
 */
export interface SnapshotConfig {
  /** Image width in pixels (default 1200). Ширина (пікс.). */
  width?: number;
  /** Image height in pixels (default 630). Висота (пікс.). */
  height?: number;
}

/** A cached snapshot entry. Запис кешованого знімка. */
export interface SnapshotEntry {
  /** Cache key derived from embed type + params. Ключ кешу. */
  cacheKey: string;
  /** Resolved snapshot URL. URL знімка. */
  url: string;
  /** When the snapshot was generated. Час генерації. */
  generatedAt: Date;
  /** When the snapshot expires. Час закінчення актуальності. */
  expiresAt: Date;
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build a snapshot URL for a given embed type and parameter set.
 * The URL encodes all params as query string entries plus width/height.
 *
 * Будує URL знімка для заданого типу embed і параметрів.
 */
export function buildSnapshotUrl(
  embedType: SnapshotEmbedType,
  params: Record<string, string>,
  config: SnapshotConfig = {},
): string {
  const width = config.width ?? SNAPSHOT_DEFAULT_WIDTH;
  const height = config.height ?? SNAPSHOT_DEFAULT_HEIGHT;

  const query = new URLSearchParams({
    type: embedType,
    w: String(width),
    h: String(height),
    ...params,
  });

  return `${SNAPSHOT_API_ROUTE}?${query.toString()}`;
}

// ── Cache key builder ─────────────────────────────────────────────────────────

/**
 * Derive a deterministic cache key from embed type and params.
 *
 * Генерує детермінований ключ кешу.
 */
function buildCacheKey(embedType: SnapshotEmbedType, params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${embedType}:${sorted}`;
}

// ── SnapshotStore ─────────────────────────────────────────────────────────────

/**
 * In-process LRU-style cache for generated snapshots.
 * In production, back this with Redis or an object-storage index.
 *
 * Внутрішній кеш знімків. У продакшні — Redis або S3-індекс.
 */
export class SnapshotStore {
  private readonly entries = new Map<string, SnapshotEntry>();

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Store a snapshot entry.
   *
   * Зберігає запис знімка.
   */
  set(
    embedType: SnapshotEmbedType,
    params: Record<string, string>,
    url: string,
    config: SnapshotConfig = {},
  ): SnapshotEntry {
    const cacheKey = buildCacheKey(embedType, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SNAPSHOT_CACHE_TTL_MINUTES * 60 * 1000);
    const entry: SnapshotEntry = { cacheKey, url, generatedAt: now, expiresAt };
    this.entries.set(cacheKey, entry);
    return { ...entry };
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Retrieve a non-expired snapshot entry (undefined if missing or stale).
   *
   * Повертає актуальний запис знімка або undefined.
   */
  get(embedType: SnapshotEmbedType, params: Record<string, string>): SnapshotEntry | undefined {
    const cacheKey = buildCacheKey(embedType, params);
    const entry = this.entries.get(cacheKey);
    if (!entry) return undefined;
    if (new Date() > entry.expiresAt) {
      this.entries.delete(cacheKey);
      return undefined;
    }
    return { ...entry };
  }

  /**
   * Check whether a fresh snapshot exists.
   *
   * Перевіряє наявність актуального знімка.
   */
  has(embedType: SnapshotEmbedType, params: Record<string, string>): boolean {
    return this.get(embedType, params) !== undefined;
  }

  // ── Purge ──────────────────────────────────────────────────────────────────

  /**
   * Remove all expired entries from the cache.
   *
   * Видаляє всі застарілі записи.
   */
  purgeExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [key, entry] of this.entries) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  /** Total entries in cache. Кількість записів у кеші. */
  get size(): number {
    return this.entries.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global snapshot cache. Глобальний кеш знімків. */
export const snapshotStore = new SnapshotStore();
