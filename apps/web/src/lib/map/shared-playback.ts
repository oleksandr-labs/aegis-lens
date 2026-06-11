/**
 * Public shareable playback links.
 * Публічні посилання для спільного доступу до відтворення.
 *
 * Analysts can share a live-map playback URL with colleagues or embed it
 * in reports. Links are optionally time-limited via expiresAt.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SharedPlaybackLink {
  shareId: string;
  /** Region identifier (oblast slug, country ISO2, or 'ukraine'). */
  region: string;
  /** ISO date string — playback start. */
  fromDate: string;
  /** ISO date string — playback end. */
  toDate: string;
  /** Layer IDs to enable when the link is opened. */
  layers: string[];
  /** Playback speed multiplier (1 = real time relative to event density). */
  speedMultiplier: number;
  /** User ID of the analyst who created the share. */
  createdByUserId: string;
  /** How many times this link has been opened. */
  viewCount: number;
  /** ISO date string after which the link returns 410 Gone. Null = no expiry. */
  expiresAt?: string;
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build a shareable playback URL.
 * Побудова URL для спільного доступу до відтворення.
 *
 * URL format: <baseUrl>/map/share/<shareId>
 */
export function buildShareablePlaybackUrl(
  share: SharedPlaybackLink,
  baseUrl = '',
): string {
  return `${baseUrl}/map/share/${share.shareId}`;
}

// ── Store class ───────────────────────────────────────────────────────────────

class SharedPlaybackStore {
  private shares = new Map<string, SharedPlaybackLink>();
  private seq = 0;

  /**
   * Create a new shared playback link. Generates shareId if not provided.
   * Створення нового посилання для спільного доступу.
   */
  create(
    share: Omit<SharedPlaybackLink, 'shareId' | 'viewCount'> & {
      shareId?: string;
    },
  ): SharedPlaybackLink {
    const shareId =
      share.shareId ??
      `spl-${++this.seq}-${Date.now().toString(36)}`;
    const entry: SharedPlaybackLink = {
      ...share,
      shareId,
      viewCount: 0,
    };
    this.shares.set(shareId, entry);
    return entry;
  }

  /** Get a share by ID. Returns undefined if not found or expired. */
  get(shareId: string): SharedPlaybackLink | undefined {
    const share = this.shares.get(shareId);
    if (!share) return undefined;
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return undefined; // expired
    }
    return share;
  }

  /** Increment view count for a share. */
  incrementView(shareId: string): number {
    const share = this.shares.get(shareId);
    if (!share) return 0;
    share.viewCount += 1;
    return share.viewCount;
  }

  /** List all non-expired shares. */
  list(): SharedPlaybackLink[] {
    const now = new Date();
    return [...this.shares.values()].filter(
      (s) => !s.expiresAt || new Date(s.expiresAt) >= now,
    );
  }
}

/** Singleton store instance. */
export const sharedPlaybackStore = new SharedPlaybackStore();

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const SHARED_PLAYBACK_NOTES_EN: Record<string, string> = {
  'signed-url':
    'In production, sign the shareId with HMAC-SHA256 using a server secret ' +
    'before persisting to the DB. Verify the signature in the /map/share/[shareId] page loader.',
  'no-expiry-default':
    'expiresAt defaults to undefined (no expiry). ' +
    'Enterprise plans may enforce max link lifetime (e.g. 30 days) via billing policy.',
};

export const SHARED_PLAYBACK_NOTES_UK: Record<string, string> = {
  'signed-url':
    'У продакшені підписуйте shareId через HMAC-SHA256 із серверним секретом ' +
    'перед збереженням у БД. Перевіряйте підпис у завантажувачі сторінки /map/share/[shareId].',
  'no-expiry-default':
    'expiresAt за замовчуванням undefined (без строку придатності). ' +
    'Корпоративні плани можуть застосовувати максимальний час існування посилання (наприклад, 30 днів) через білінгову політику.',
};
