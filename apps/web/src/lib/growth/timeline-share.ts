/**
 * Timeline Share — shareable playback links for event timelines.
 *
 * Generates time-bounded share tokens for timeline playback sessions.
 * Tokens expire after TIMELINE_SHARE_TTL_DAYS days.
 *
 * Генерує посилання для перегляду таймлайну подій із TTL.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Days a timeline share link remains valid. / Днів дії посилання на таймлайн. */
export const TIMELINE_SHARE_TTL_DAYS = 30;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TimelineShareConfig {
  /** Unique token identifying the share session. / Унікальний токен сесії. */
  token: string;
  /** ISO-8601 start of the playback window. / Початок вікна відтворення. */
  startDate: string;
  /** ISO-8601 end of the playback window. / Кінець вікна відтворення. */
  endDate: string;
  /** Optional AOI filter to scope the timeline. / Необов'язковий фільтр AOI. */
  aoiId?: string;
  /** Optional event category filter. / Необов'язковий фільтр категорії. */
  category?: string;
  /** ISO-8601 expiry timestamp. / Час закінчення дії токена. */
  expiresAt: string;
  /** Speed multiplier for playback (1 = realtime). / Швидкість відтворення. */
  playbackSpeed: number;
  /** Created-by user ID (undefined = anonymous share). / ID автора. */
  createdBy?: string;
}

export interface TimelineShareParams {
  startDate: string;
  endDate: string;
  aoiId?: string;
  category?: string;
  playbackSpeed?: number;
  createdBy?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build a shareable timeline playback URL from params.
 *
 * Формує URL для перегляду таймлайну.
 */
export function buildTimelineShareUrl(
  baseUrl: string,
  params: TimelineShareParams,
): string {
  const token = generateToken();
  const url = new URL(`${baseUrl}/timeline/share`);
  url.searchParams.set("token", token);
  url.searchParams.set("start", params.startDate);
  url.searchParams.set("end", params.endDate);
  if (params.aoiId) url.searchParams.set("aoi", params.aoiId);
  if (params.category) url.searchParams.set("cat", params.category);
  if (params.playbackSpeed != null)
    url.searchParams.set("speed", String(params.playbackSpeed));
  return url.toString();
}

// ── TimelineShareStore ────────────────────────────────────────────────────────

export class TimelineShareStore {
  private readonly shares = new Map<string, TimelineShareConfig>();

  /**
   * Create a new timeline share entry.
   *
   * Створює новий запис посилання на таймлайн.
   */
  create(params: TimelineShareParams): TimelineShareConfig {
    const now = new Date().toISOString();
    const token = generateToken();
    const config: TimelineShareConfig = {
      token,
      startDate: params.startDate,
      endDate: params.endDate,
      aoiId: params.aoiId,
      category: params.category,
      playbackSpeed: params.playbackSpeed ?? 1,
      expiresAt: addDays(now, TIMELINE_SHARE_TTL_DAYS),
      createdBy: params.createdBy,
    };
    this.shares.set(token, config);
    return config;
  }

  /**
   * Retrieve a share by token; returns undefined if expired or not found.
   *
   * Повертає конфіг за токеном; undefined — якщо прострочено або не знайдено.
   */
  get(token: string): TimelineShareConfig | undefined {
    const share = this.shares.get(token);
    if (!share) return undefined;
    if (new Date(share.expiresAt) < new Date()) {
      this.shares.delete(token);
      return undefined;
    }
    return share;
  }

  /** Purge all expired shares. / Видаляє всі прострочені посилання. */
  purgeExpired(): number {
    const now = new Date();
    let removed = 0;
    for (const [token, share] of this.shares) {
      if (new Date(share.expiresAt) < now) {
        this.shares.delete(token);
        removed++;
      }
    }
    return removed;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global timeline share store. */
export const timelineShareStore = new TimelineShareStore();
