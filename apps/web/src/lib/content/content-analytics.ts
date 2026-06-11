/**
 * Content Analytics — per-piece performance metrics tracking.
 *
 * Tracks organic traffic, citation count, conversion events,
 * and engagement signals per content piece.
 *
 * Аналітика контенту: органіка, цитування, конверсії, час на сторінці.
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ContentPerformanceMetrics {
  /** Unique slug / content ID. / Унікальний slug або ID. */
  contentId: string;
  /** Content type for grouping. / Тип контенту. */
  contentType: string;
  /** ISO-8601 date the metrics were last refreshed. / Дата останнього оновлення метрик. */
  refreshedAt: string;

  // ── Organic traffic ──────────────────────────────────────────────────────
  /** Monthly organic search sessions. / Місячні органічні сесії. */
  organicSessions: number;
  /** Average position in SERPs. / Середня позиція в SERP. */
  avgSerpPosition?: number;
  /** Organic click-through rate (0–1). / CTR з органічного пошуку. */
  organicCtr?: number;

  // ── Citations ─────────────────────────────────────────────────────────────
  /** Number of external URLs linking to this piece. / Кількість зовнішніх посилань. */
  backlinks: number;
  /** Number of academic or press citation references. / Кількість академічних/прес-цитувань. */
  citationCount: number;
  /** Top citing domains (up to 10). / Топ доменів-цитаторів. */
  topCitingDomains: string[];

  // ── Conversions ───────────────────────────────────────────────────────────
  /** Newsletter sign-ups attributed to this piece. / Підписки на розсилку з цього матеріалу. */
  newsletterSignups: number;
  /** Paid tier upgrades attributed to this piece. / Переходи на платний план. */
  paidConversions: number;
  /** API sign-ups attributed to this piece. / Реєстрації через API. */
  apiSignups: number;

  // ── Engagement ────────────────────────────────────────────────────────────
  /** Median time on page (seconds). / Медіанний час на сторінці (сек). */
  medianTimeOnPageSeconds: number;
  /** Bounce rate (0–1). / Відсоток відмов. */
  bounceRate: number;
  /** Social shares across all channels. / Кількість поширень у соцмережах. */
  socialShares: number;
}

// ── ContentAnalyticsStore ─────────────────────────────────────────────────────

export class ContentAnalyticsStore {
  private readonly metrics = new Map<string, ContentPerformanceMetrics>();

  /**
   * Save or overwrite metrics for a content piece.
   *
   * Зберігає або перезаписує метрики.
   */
  save(metrics: ContentPerformanceMetrics): void {
    this.metrics.set(metrics.contentId, {
      ...metrics,
      refreshedAt: new Date().toISOString(),
    });
  }

  /**
   * Get metrics for a content piece by ID.
   *
   * Повертає метрики за ID контенту.
   */
  get(contentId: string): ContentPerformanceMetrics | undefined {
    return this.metrics.get(contentId);
  }

  /**
   * List all tracked pieces sorted by organicSessions descending.
   *
   * Повертає всі матеріали, відсортовані за органічними сесіями.
   */
  listByOrganic(): ContentPerformanceMetrics[] {
    return Array.from(this.metrics.values()).sort(
      (a, b) => b.organicSessions - a.organicSessions,
    );
  }

  /**
   * List all tracked pieces sorted by citationCount descending.
   *
   * Повертає всі матеріали, відсортовані за кількістю цитувань.
   */
  listByCitations(): ContentPerformanceMetrics[] {
    return Array.from(this.metrics.values()).sort(
      (a, b) => b.citationCount - a.citationCount,
    );
  }

  /**
   * Compute a simple performance score: organic * 0.4 + citations * 30 + conversions * 50.
   *
   * Обчислює зведений бал ефективності матеріалу.
   */
  score(metrics: ContentPerformanceMetrics): number {
    return (
      metrics.organicSessions * 0.4 +
      metrics.citationCount * 30 +
      (metrics.newsletterSignups + metrics.paidConversions) * 50
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global content analytics store. */
export const contentAnalyticsStore = new ContentAnalyticsStore();
