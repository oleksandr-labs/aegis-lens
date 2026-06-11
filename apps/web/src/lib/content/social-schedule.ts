/**
 * Social Schedule — multi-channel social publishing cadence.
 *
 * Manages 3-5 daily posts across X, LinkedIn, and Mastodon
 * during UTC working hours (07:00–19:00).
 *
 * Соціальний розклад: 3–5 постів/день на X, LinkedIn, Mastodon у робочі години UTC.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Supported social channels. / Підтримувані соціальні канали. */
export const SOCIAL_CHANNELS = ["x", "linkedin", "mastodon"] as const;

export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];

/** Minimum posts per day across all channels. / Мінімальна кількість постів на день. */
export const SOCIAL_POSTS_PER_DAY_MIN = 3;

/** Maximum posts per day across all channels. / Максимальна кількість постів на день. */
export const SOCIAL_POSTS_PER_DAY_MAX = 5;

/** UTC working hours window for post scheduling. / Вікно робочих годин UTC. */
export const SOCIAL_WORKING_HOURS_UTC: { start: number; end: number } = {
  start: 7,
  end: 19,
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SocialPost {
  /** Unique post ID. / Унікальний ID поста. */
  id: string;
  /** Target channel. / Цільовий канал. */
  channel: SocialChannel;
  /** Post body text. / Текст поста. */
  body: string;
  /** Optional media attachment URL. / URL вкладення медіа. */
  mediaUrl?: string;
  /** Optional linked article URL. / URL пов'язаної статті. */
  linkUrl?: string;
  /** ISO-8601 scheduled publish time. / Запланований час публікації. */
  scheduledAt: string;
  /** Actual publish time (set after delivery). / Фактичний час публікації. */
  publishedAt?: string;
  /** Post status. / Статус поста. */
  status: "draft" | "scheduled" | "published" | "failed";
  /** Content type tag. / Тег типу контенту. */
  contentType: "brief" | "event-alert" | "chart" | "reaction" | "promotion";
}

export interface DaySocialPlan {
  /** ISO-8601 date for this plan. / Дата плану. */
  date: string;
  /** Planned posts for the day. / Заплановані пости на день. */
  posts: SocialPost[];
}

// ── SocialScheduleStore ───────────────────────────────────────────────────────

export class SocialScheduleStore {
  /** Keyed by `${channel}:${id}`. / Ключ: `${канал}:${id}`. */
  private readonly posts = new Map<string, SocialPost>();

  private key(channel: SocialChannel, id: string): string {
    return `${channel}:${id}`;
  }

  /**
   * Add or update a social post.
   *
   * Додає або оновлює запис поста.
   */
  upsert(post: SocialPost): void {
    this.posts.set(this.key(post.channel, post.id), post);
  }

  /**
   * Get a post by channel and ID.
   *
   * Повертає пост за каналом і ID.
   */
  get(channel: SocialChannel, id: string): SocialPost | undefined {
    return this.posts.get(this.key(channel, id));
  }

  /**
   * List scheduled posts for a given date.
   *
   * Повертає заплановані пости на вказану дату.
   */
  listByDate(date: string, channel?: SocialChannel): SocialPost[] {
    return Array.from(this.posts.values())
      .filter(
        (p) =>
          p.scheduledAt.startsWith(date) &&
          (channel == null || p.channel === channel),
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  /**
   * Build a day plan summary for a date, enforcing min/max post bounds.
   *
   * Будує зведення денного плану з перевіркою мінімуму/максимуму постів.
   */
  buildDayPlan(date: string): DaySocialPlan & { warning?: string } {
    const posts = this.listByDate(date);
    let warning: string | undefined;
    if (posts.length < SOCIAL_POSTS_PER_DAY_MIN) {
      warning = `Only ${posts.length} posts scheduled — minimum is ${SOCIAL_POSTS_PER_DAY_MIN}.`;
    } else if (posts.length > SOCIAL_POSTS_PER_DAY_MAX) {
      warning = `${posts.length} posts scheduled — maximum is ${SOCIAL_POSTS_PER_DAY_MAX}.`;
    }
    return { date, posts, warning };
  }

  /**
   * Validate that all posts fall within SOCIAL_WORKING_HOURS_UTC.
   *
   * Перевіряє, що всі пости в межах робочих годин UTC.
   */
  validateHours(posts: SocialPost[]): SocialPost[] {
    const { start, end } = SOCIAL_WORKING_HOURS_UTC;
    return posts.filter((p) => {
      const hour = new Date(p.scheduledAt).getUTCHours();
      return hour >= start && hour < end;
    });
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global social schedule store. */
export const socialScheduleStore = new SocialScheduleStore();
