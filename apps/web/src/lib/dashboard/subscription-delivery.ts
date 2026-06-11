'use server';
/**
 * Subscription delivery: manage user subscriptions for dashboard reports
 * (morning brief, weekly digest, incident alerts, regional briefs) across
 * email, Slack, and Telegram channels.
 *
 * Управління підписками на доставку звітів (ранковий брифінг, щотижневий дайджест,
 * сповіщення про інциденти, регіональні брифінги) через email, Slack та Telegram.
 */

// ── Channel + report types ────────────────────────────────────────────────────

export type SubscriptionDeliveryChannel = "email" | "slack" | "telegram";

export type ReportType =
  | "morning_brief"
  | "weekly_digest"
  | "incident_alert"
  | "regional_brief";

export type DeliveryFrequency = "immediate" | "daily" | "weekly";

// ── Subscription ──────────────────────────────────────────────────────────────

export interface ReportSubscription {
  subscriptionId: string;
  userId: string;
  /** Type of report being subscribed to */
  reportType: ReportType;
  /** Channels to deliver this subscription through */
  channels: SubscriptionDeliveryChannel[];
  /** Delivery frequency */
  frequency: DeliveryFrequency;
  enabled: boolean;
  /** ISO-8601 */
  createdAt: string;
  /** ISO-8601 */
  updatedAt: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const SUBSCRIPTION_NOTES_EN = [
  "Subscriptions are per report type — subscribe to morning_brief for daily summaries, weekly_digest for a curated week-in-review, or incident_alert for real-time critical events.",
  "Each subscription can target multiple delivery channels simultaneously; at least one enabled channel is required.",
  "Frequency 'immediate' applies only to incident_alert; morning_brief and regional_brief default to 'daily'; weekly_digest defaults to 'weekly'.",
  "Subscriptions can be paused (enabled=false) without losing configuration — re-enable at any time via the API.",
];

export const SUBSCRIPTION_NOTES_UK = [
  "Підписки відповідають типу звіту — morning_brief для щоденних підсумків, weekly_digest для кращого за тиждень, incident_alert для критичних подій у реальному часі.",
  "Кожна підписка може одночасно доставлятися через кілька каналів; потрібен хоча б один увімкнений канал.",
  "Частота 'immediate' застосовується лише до incident_alert; morning_brief та regional_brief за замовчуванням 'daily'; weekly_digest за замовчуванням 'weekly'.",
  "Підписки можна поставити на паузу (enabled=false) без втрати налаштувань — повторно увімкніть будь-коли через API.",
];

// ── Default frequency per report type ────────────────────────────────────────

export const DEFAULT_FREQUENCY: Record<ReportType, DeliveryFrequency> = {
  morning_brief:  "daily",
  weekly_digest:  "weekly",
  incident_alert: "immediate",
  regional_brief: "daily",
};

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory subscription store keyed by subscriptionId.
 * In production: persist to database.
 *
 * Сховище підписок у пам'яті.
 */
export class SubscriptionStore {
  private readonly store = new Map<string, ReportSubscription>();
  private _seq = 0;

  /** Create or update a subscription (upsert by userId + reportType) */
  upsert(
    params: Omit<ReportSubscription, "subscriptionId" | "createdAt" | "updatedAt"> & {
      subscriptionId?: string;
    },
  ): ReportSubscription {
    // Find existing subscription for this user + reportType
    const existing = [...this.store.values()].find(
      (s) => s.userId === params.userId && s.reportType === params.reportType,
    );

    const subscriptionId =
      params.subscriptionId ??
      existing?.subscriptionId ??
      `sub-${++this._seq}-${Date.now()}`;

    const now = new Date().toISOString();
    const record: ReportSubscription = {
      ...params,
      subscriptionId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.store.set(subscriptionId, record);
    return record;
  }

  get(subscriptionId: string): ReportSubscription | undefined {
    return this.store.get(subscriptionId);
  }

  /** List all subscriptions for a user */
  listByUser(userId: string): ReportSubscription[] {
    return [...this.store.values()].filter((s) => s.userId === userId);
  }

  /** List all active subscriptions for a report type */
  listByReportType(
    reportType: ReportType,
    enabledOnly = true,
  ): ReportSubscription[] {
    return [...this.store.values()].filter(
      (s) =>
        s.reportType === reportType && (!enabledOnly || s.enabled),
    );
  }

  /** Enable or disable a subscription */
  setEnabled(subscriptionId: string, enabled: boolean): boolean {
    const sub = this.store.get(subscriptionId);
    if (!sub) return false;
    sub.enabled = enabled;
    sub.updatedAt = new Date().toISOString();
    this.store.set(subscriptionId, sub);
    return true;
  }

  delete(subscriptionId: string): boolean {
    return this.store.delete(subscriptionId);
  }
}

/** Singleton subscription store */
export const subscriptionStore = new SubscriptionStore();
