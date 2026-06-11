/**
 * Newsletter — weekly intelligence brief distribution engine.
 *
 * Manages subscriber segments, edition metadata, and build pipeline
 * for the Monday weekly brief email.
 *
 * Тижневий розсилочний брифінг: сегменти, метадані, збірка випусків.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Publishing cadence for the newsletter. / Частота виходу розсилки. */
export const NEWSLETTER_CADENCE = "weekly-monday";

/** Subscriber segments. / Сегменти підписників. */
export const NEWSLETTER_SEGMENTS = ["general", "analyst", "journalist"] as const;

export type NewsletterSegment = (typeof NEWSLETTER_SEGMENTS)[number];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface NewsletterEdition {
  /** Edition ID (e.g. "2024-W23"). / ID випуску. */
  id: string;
  /** ISO week label "YYYY-Www". / Мітка тижня. */
  weekLabel: string;
  /** ISO-8601 publication date. / Дата публікації. */
  publishedAt: string;
  /** Edition subject line. / Тема листа. */
  subject: string;
  /** Preview text (shown in email clients). / Текст прев'ю. */
  preview: string;
  /** Markdown body of the edition. / Тіло листа (Markdown). */
  body: string;
  /** Target segment. / Цільовий сегмент. */
  segment: NewsletterSegment;
  /** Number of subscribers who received it. / Кількість отримувачів. */
  recipientCount: number;
  /** Open rate 0–1 (set after delivery). / Відсоток відкрить. */
  openRate?: number;
  /** Click-through rate 0–1. / CTR. */
  ctr?: number;
}

export interface NewsletterSubscriber {
  email: string;
  segment: NewsletterSegment;
  locale: "en" | "uk";
  subscribedAt: string;
  confirmed: boolean;
  unsubscribedAt?: string;
}

// ── NewsletterStore ───────────────────────────────────────────────────────────

export class NewsletterStore {
  private readonly editions = new Map<string, NewsletterEdition>();
  private readonly subscribers = new Map<string, NewsletterSubscriber>();

  // ── Editions ───────────────────────────────────────────────────────────────

  /**
   * Save or update an edition.
   *
   * Зберігає або оновлює випуск.
   */
  saveEdition(edition: NewsletterEdition): void {
    this.editions.set(edition.id, edition);
  }

  /**
   * Get an edition by ID.
   *
   * Повертає випуск за ID.
   */
  getEdition(id: string): NewsletterEdition | undefined {
    return this.editions.get(id);
  }

  /**
   * List editions for a segment, most recent first.
   *
   * Повертає випуски для сегмента, найновіші першими.
   */
  listEditions(segment?: NewsletterSegment): NewsletterEdition[] {
    const all = Array.from(this.editions.values());
    const filtered = segment ? all.filter((e) => e.segment === segment) : all;
    return filtered.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  // ── Subscribers ────────────────────────────────────────────────────────────

  /**
   * Register or update a subscriber.
   *
   * Реєструє або оновлює підписника.
   */
  subscribe(subscriber: NewsletterSubscriber): void {
    this.subscribers.set(subscriber.email, subscriber);
  }

  /**
   * Mark a subscriber as unsubscribed.
   *
   * Відписує підписника.
   */
  unsubscribe(email: string): void {
    const sub = this.subscribers.get(email);
    if (sub) {
      this.subscribers.set(email, {
        ...sub,
        unsubscribedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * List active (confirmed, not unsubscribed) subscribers for a segment.
   *
   * Повертає активних підписників сегмента.
   */
  listActive(segment?: NewsletterSegment): NewsletterSubscriber[] {
    return Array.from(this.subscribers.values()).filter(
      (s) =>
        s.confirmed &&
        !s.unsubscribedAt &&
        (segment == null || s.segment === segment),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global newsletter store. */
export const newsletterStore = new NewsletterStore();
