/**
 * Reaction Posts — rapid editorial responses to major events within 24 hours.
 *
 * Monitors trigger events and manages the reaction-post pipeline to
 * maintain editorial presence during high-tempo periods.
 *
 * Реакційні пости: швидкі редакційні відповіді на великі події впродовж 24 год.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum hours between trigger event and reaction post publication. / Ліміт часу. */
export const REACTION_DEADLINE_HOURS = 24;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ReactionPostTrigger {
  /** Trigger event ID. / ID події-тригера. */
  eventId: string;
  /** Short description of why this event warrants a reaction post. / Опис тригера. */
  reason: string;
  /** ISO-8601 time the trigger was detected. / Час виявлення тригера. */
  detectedAt: string;
  /** Deadline for publishing the reaction post. / Дедлайн публікації. */
  deadline: string;
  /** Assigned author. / Призначений автор. */
  assignedTo?: string;
}

export interface ReactionPost {
  /** Unique slug. / Унікальний slug. */
  slug: string;
  /** Reference to the trigger. / Посилання на тригер. */
  triggerId: string;
  /** Post title. / Заголовок. */
  title: string;
  /** Markdown body. / Тіло (Markdown). */
  body: string;
  /** ISO-8601 publish timestamp. / Час публікації. */
  publishedAt?: string;
  /** Whether the post has been published. / Чи опублікований пост. */
  published: boolean;
  /** Whether the post met the 24h deadline. / Чи вкладено в дедлайн. */
  onTime?: boolean;
}

// ── ReactionPostStore ─────────────────────────────────────────────────────────

export class ReactionPostStore {
  private readonly triggers = new Map<string, ReactionPostTrigger>();
  private readonly posts = new Map<string, ReactionPost>();

  // ── Triggers ───────────────────────────────────────────────────────────────

  /**
   * Register a reaction trigger for an event.
   * Automatically calculates deadline from REACTION_DEADLINE_HOURS.
   *
   * Реєструє тригер реакційного поста. Автоматично обчислює дедлайн.
   */
  registerTrigger(
    trigger: Omit<ReactionPostTrigger, "deadline">,
  ): ReactionPostTrigger {
    const deadline = new Date(trigger.detectedAt);
    deadline.setUTCHours(deadline.getUTCHours() + REACTION_DEADLINE_HOURS);
    const full: ReactionPostTrigger = {
      ...trigger,
      deadline: deadline.toISOString(),
    };
    this.triggers.set(trigger.eventId, full);
    return full;
  }

  /**
   * Get a trigger by event ID.
   *
   * Повертає тригер за ID події.
   */
  getTrigger(eventId: string): ReactionPostTrigger | undefined {
    return this.triggers.get(eventId);
  }

  /**
   * List triggers whose deadline has not yet passed and no post is published.
   *
   * Повертає активні тригери без опублікованих постів.
   */
  listActiveTriggers(): ReactionPostTrigger[] {
    const now = new Date();
    return Array.from(this.triggers.values()).filter(
      (t) => new Date(t.deadline) > now,
    );
  }

  // ── Posts ──────────────────────────────────────────────────────────────────

  /**
   * Save a reaction post.
   *
   * Зберігає реакційний пост.
   */
  savePost(post: ReactionPost): void {
    const trigger = this.triggers.get(post.triggerId);
    let onTime: boolean | undefined;
    if (post.publishedAt && trigger) {
      onTime =
        new Date(post.publishedAt) <= new Date(trigger.deadline);
    }
    this.posts.set(post.slug, { ...post, onTime });
  }

  /**
   * List published reaction posts, most recent first.
   *
   * Повертає опубліковані реакційні пости, найновіші першими.
   */
  listPublished(): ReactionPost[] {
    return Array.from(this.posts.values())
      .filter((p) => p.published)
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global reaction post store. */
export const reactionPostStore = new ReactionPostStore();
