/**
 * Embed Attribution — required attribution enforcement + abuse detection.
 *
 * Every embed must carry a visible link back to aegislens.uk.
 * Tracks domains that strip the attribution link and flags repeat offenders.
 *
 * Обов'язкова атрибуція + виявлення зловживань (видалення посилань).
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Attribution is required on all embeds.
 *
 * Атрибуція обов'язкова для всіх embed-ів.
 */
export const ATTRIBUTION_REQUIRED = true;

/** Attribution link text (English). Текст посилання (англ.). */
export const ATTRIBUTION_LINK_TEXT_EN = 'Powered by Aegis Lens';

/** Attribution link text (Ukrainian). Текст посилання (укр.). */
export const ATTRIBUTION_LINK_TEXT_UK = 'На основі Aegis Lens';

/** Attribution anchor HTML. HTML-посилання атрибуції. */
export const ATTRIBUTION_ANCHOR =
  `<a href="https://aegislens.uk" target="_blank" rel="noopener noreferrer" ` +
  `class="aegis-attribution">${ATTRIBUTION_LINK_TEXT_EN}</a>`;

/** Marker string present in all attributed embeds. Маркер наявності атрибуції. */
const ATTRIBUTION_MARKER = 'aegislens.uk';

/** Strike threshold before a domain is flagged as abusive. Поріг страйків. */
const ABUSE_STRIKE_THRESHOLD = 3;

// ── Checker ───────────────────────────────────────────────────────────────────

/**
 * Inspect embed HTML and return true if the attribution link has been stripped.
 *
 * Повертає true, якщо атрибуція видалена зі сніпету.
 */
export function checkAttributionStripped(embedHtml: string): boolean {
  if (!ATTRIBUTION_REQUIRED) return false;
  return !embedHtml.includes(ATTRIBUTION_MARKER);
}

// ── Abuse entry ───────────────────────────────────────────────────────────────

/** Record of attribution abuse for one domain. Запис зловживання атрибуцією. */
export interface AttributionAbuseRecord {
  /** Domain (e.g. example.com). Домен. */
  domain: string;
  /** Number of times stripping was detected. Кількість виявлень. */
  strikes: number;
  /** Timestamp of the first detected violation. Перше виявлення. */
  firstSeenAt: Date;
  /** Timestamp of the most recent violation. Останнє виявлення. */
  lastSeenAt: Date;
  /** Whether the domain has been flagged for manual review. Позначено для перегляду. */
  flagged: boolean;
}

// ── AttributionAbuseStore ─────────────────────────────────────────────────────

/**
 * In-process store that tracks domains stripping attribution.
 * Flagged domains can be exported and fed into a block-list or rate-limiter.
 *
 * Зберігає домени, що видаляють атрибуцію. Флагнуті домени — в блок-лист.
 */
export class AttributionAbuseStore {
  private readonly records = new Map<string, AttributionAbuseRecord>();

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Record a detection event for a domain.
   * Automatically flags domains that exceed ABUSE_STRIKE_THRESHOLD.
   *
   * Фіксує факт видалення атрибуції для домену.
   */
  record(domain: string): AttributionAbuseRecord {
    const now = new Date();
    let rec = this.records.get(domain);

    if (!rec) {
      rec = {
        domain,
        strikes: 0,
        firstSeenAt: now,
        lastSeenAt: now,
        flagged: false,
      };
      this.records.set(domain, rec);
    }

    rec.strikes += 1;
    rec.lastSeenAt = now;
    if (rec.strikes >= ABUSE_STRIKE_THRESHOLD) {
      rec.flagged = true;
    }

    return { ...rec };
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Retrieve the abuse record for a domain (undefined if clean).
   *
   * Повертає запис зловживань для домену.
   */
  get(domain: string): AttributionAbuseRecord | undefined {
    const rec = this.records.get(domain);
    return rec ? { ...rec } : undefined;
  }

  /**
   * Return all flagged domains.
   *
   * Повертає всі флагнуті домени.
   */
  getFlagged(): AttributionAbuseRecord[] {
    return Array.from(this.records.values())
      .filter((r) => r.flagged)
      .map((r) => ({ ...r }));
  }

  /**
   * Return all tracked records.
   *
   * Повертає всі записи.
   */
  getAll(): AttributionAbuseRecord[] {
    return Array.from(this.records.values()).map((r) => ({ ...r }));
  }

  // ── Clear ──────────────────────────────────────────────────────────────────

  /**
   * Clear the record for a domain (e.g. after manual review).
   *
   * Очищає запис для домену.
   */
  clear(domain: string): void {
    this.records.delete(domain);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global attribution abuse tracker. Глобальний трекер зловживань атрибуцією. */
export const attributionAbuseStore = new AttributionAbuseStore();
