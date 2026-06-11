'use server';
/**
 * Morning brief auto-generation: per-watchlist AI-generated situational summary,
 * scheduled daily and delivered via configured channels.
 *
 * Автогенерація ранкового брифінгу: AI-сформований ситуаційний огляд per-watchlist,
 * що надсилається щодня через налаштовані канали.
 */

// ── Delivery channels ─────────────────────────────────────────────────────────

export type MorningBriefDeliveryChannel = "email" | "slack" | "telegram";

// ── Config ────────────────────────────────────────────────────────────────────

export interface MorningBriefConfig {
  userId: string;
  /** Which watchlists to include in the brief */
  watchlistIds: string[];
  /** Channels to deliver the brief through */
  deliveryChannels: MorningBriefDeliveryChannel[];
  /**
   * Hour (0–23) in UTC when the brief is generated and sent.
   * Default: 7 (07:00 UTC).
   */
  scheduleUtcHour: number;
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface MorningBriefSchedule {
  configId: string;
  config: MorningBriefConfig;
  /** ISO-8601 timestamp of the next scheduled run */
  nextRunAt: string;
  /** ISO-8601 timestamp of the last successful run (null if never run) */
  lastRunAt: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const MORNING_BRIEF_NOTES_EN = [
  "Morning briefs are scoped to your watchlists — only entities, regions, and sources you monitor are included in the summary.",
  "The brief is AI-generated using the last 12–24 hours of canonical events; no raw unverified intelligence is included.",
  "A human-review gate can be enabled for Pro+ accounts: the brief is held for up to 30 minutes for analyst sign-off before delivery.",
  "Delivery channels: email (HTML + plain-text), Slack (Block Kit), Telegram (MarkdownV2). At least one channel must be configured.",
];

export const MORNING_BRIEF_NOTES_UK = [
  "Ранкові брифінги обмежені вашими переліками спостереження — до огляду включаються лише суб'єкти, регіони та джерела, які ви відстежуєте.",
  "Брифінг генерується AI на основі канонічних подій за останні 12–24 години; необроблена неперевірена розвіддані не включається.",
  "Для облікових записів Pro+ можна увімкнути перевірку людиною: брифінг затримується до 30 хвилин для затвердження аналітиком перед доставкою.",
  "Канали доставки: email (HTML + plain-text), Slack (Block Kit), Telegram (MarkdownV2). Потрібно налаштувати хоча б один канал.",
];

// ── Prompt builder ────────────────────────────────────────────────────────────

/**
 * Build a structured prompt for the AI morning brief generator.
 * The prompt is locale-neutral and injects watchlist context + time window.
 *
 * Будує структурований промпт для генератора ранкового брифінгу.
 */
export function buildMorningBriefPrompt(
  watchlistNames: string[],
  timeWindow: { startUtc: string; endUtc: string },
): string {
  return (
    `You are Aegis Lens, an intelligence analyst assistant. ` +
    `Generate a concise morning brief (max 400 words) covering significant events ` +
    `from ${timeWindow.startUtc} to ${timeWindow.endUtc} UTC.\n\n` +
    `Watchlists in scope: ${watchlistNames.map((n) => `"${n}"`).join(", ")}.\n\n` +
    `Structure the brief as:\n` +
    `1. TOP HEADLINE (1 sentence — most significant development)\n` +
    `2. KEY EVENTS (3–5 bullet points, each with region, event type, danger score)\n` +
    `3. TRENDS (1–2 sentences on patterns or escalations over the window)\n` +
    `4. WATCH ITEMS (1–2 items to monitor in the next 24 hours)\n\n` +
    `Be factual, concise, and cite event IDs where available. ` +
    `Flag any item with danger score ≥ 75 as [HIGH PRIORITY]. ` +
    `Do not speculate beyond the provided event data.`
  );
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory morning brief schedule store keyed by configId.
 * In production: persist to database.
 *
 * Сховище розкладів ранкових брифінгів у пам'яті.
 */
export class MorningBriefStore {
  private readonly store = new Map<string, MorningBriefSchedule>();
  private _seq = 0;

  /** Create or replace a morning brief schedule */
  upsert(
    config: MorningBriefConfig,
    configId?: string,
  ): MorningBriefSchedule {
    const id = configId ?? `brief-${++this._seq}-${Date.now()}`;
    const now = new Date();

    // Compute next run time
    const nextRun = new Date(now);
    nextRun.setUTCHours(config.scheduleUtcHour, 0, 0, 0);
    if (nextRun <= now) {
      // Already passed today — schedule for tomorrow
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    const existing = this.store.get(id);
    const schedule: MorningBriefSchedule = {
      configId: id,
      config,
      nextRunAt: nextRun.toISOString(),
      lastRunAt: existing?.lastRunAt ?? null,
      enabled: true,
      createdAt: existing?.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.store.set(id, schedule);
    return schedule;
  }

  get(configId: string): MorningBriefSchedule | undefined {
    return this.store.get(configId);
  }

  /** List all schedules for a user */
  listByUser(userId: string): MorningBriefSchedule[] {
    return [...this.store.values()].filter(
      (s) => s.config.userId === userId,
    );
  }

  /** Mark a brief as successfully run */
  markRun(configId: string): void {
    const schedule = this.store.get(configId);
    if (!schedule) return;

    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(schedule.config.scheduleUtcHour, 0, 0, 0);
    nextRun.setUTCDate(nextRun.getUTCDate() + 1); // always next day after running

    schedule.lastRunAt = now.toISOString();
    schedule.nextRunAt = nextRun.toISOString();
    schedule.updatedAt = now.toISOString();
    this.store.set(configId, schedule);
  }

  /** Get all schedules due to run at or before nowUtc */
  getDue(nowUtc?: string): MorningBriefSchedule[] {
    const now = nowUtc ? new Date(nowUtc) : new Date();
    return [...this.store.values()].filter(
      (s) => s.enabled && new Date(s.nextRunAt) <= now,
    );
  }

  disable(configId: string): void {
    const s = this.store.get(configId);
    if (s) { s.enabled = false; this.store.set(configId, s); }
  }

  delete(configId: string): boolean {
    return this.store.delete(configId);
  }
}

/** Singleton morning brief store */
export const morningBriefStore = new MorningBriefStore();
