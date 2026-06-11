/**
 * Auto-refresh scheduler — per-widget polling interval or push-channel config.
 * Планувальник автооновлення — конфігурація інтервалу опитування або push-каналу для кожного віджета.
 *
 * NOTE (EN): intervalS: null means the widget relies on a push channel (SSE / WebSocket) only.
 * NOTE (UK): intervalS: null означає, що віджет використовує лише push-канал (SSE / WebSocket).
 *
 * NOTE (EN): AUTO_REFRESH_DEFAULTS gives safe defaults per widget type; override per instance.
 * NOTE (UK): AUTO_REFRESH_DEFAULTS задає безпечні типові значення для кожного типу; перевизначайте для кожного екземпляра.
 *
 * NOTE (EN): RefreshScheduler is in-memory; in production wire to a real timer/worker pool.
 * NOTE (UK): RefreshScheduler зберігається в пам'яті; у продакшні підключіть до реального пулу таймерів/воркерів.
 *
 * NOTE (EN): getNextRefreshAt returns an ISO string or null if the widget uses push-only or is not scheduled.
 * NOTE (UK): getNextRefreshAt повертає ISO-рядок або null, якщо віджет використовує push або не запланований.
 */

// ---------------------------------------------------------------------------
// RefreshPolicy
// ---------------------------------------------------------------------------

export interface RefreshPolicy {
  widgetId: string;
  /** Polling interval in seconds; null = push-only */
  intervalS: number | null;
  pushChannel: "sse" | "websocket" | "none";
  lastRefreshedAt: string | null;
}

// ---------------------------------------------------------------------------
// AUTO_REFRESH_DEFAULTS
// ---------------------------------------------------------------------------

/**
 * Default refresh intervals (seconds) by widget type.
 * Інтервали оновлення за замовчуванням (секунди) для кожного типу віджета.
 */
export const AUTO_REFRESH_DEFAULTS: Partial<Record<string, number>> = {
  "event-feed":    30,
  "alert-feed":    10,
  "kpi-counter":   60,
  "source-health": 120,
  "timeseries":    300,
};

// ---------------------------------------------------------------------------
// RefreshScheduler
// ---------------------------------------------------------------------------

/**
 * In-memory refresh scheduler keyed by widgetId.
 * Планувальник оновлень у пам'яті, індексований за widgetId.
 */
export class RefreshScheduler {
  private readonly policies = new Map<string, RefreshPolicy>();

  /**
   * Schedule (or update) a refresh policy for a widget.
   * Планує (або оновлює) політику оновлення для віджета.
   */
  schedule(widgetId: string, policy: RefreshPolicy): void {
    this.policies.set(widgetId, { ...policy, widgetId });
  }

  /**
   * Cancel the refresh policy for a widget.
   * Скасовує політику оновлення для віджета.
   */
  cancel(widgetId: string): void {
    this.policies.delete(widgetId);
  }

  /**
   * Get the current policy for a widget.
   * Повертає поточну політику для віджета.
   */
  getPolicy(widgetId: string): RefreshPolicy | undefined {
    return this.policies.get(widgetId);
  }

  /**
   * Compute the next expected refresh ISO timestamp.
   * Returns null if push-only or not scheduled.
   *
   * Розраховує наступну очікувану дату оновлення у форматі ISO.
   * Повертає null, якщо push-only або не запланований.
   */
  getNextRefreshAt(widgetId: string): string | null {
    const policy = this.policies.get(widgetId);
    if (!policy || policy.intervalS === null) return null;
    const last = policy.lastRefreshedAt ? new Date(policy.lastRefreshedAt) : new Date();
    const next = new Date(last.getTime() + policy.intervalS * 1000);
    return next.toISOString();
  }

  /**
   * Mark a widget as just refreshed (updates lastRefreshedAt to now).
   * Позначає віджет як щойно оновлений (оновлює lastRefreshedAt до поточного часу).
   */
  markRefreshed(widgetId: string): void {
    const policy = this.policies.get(widgetId);
    if (policy) {
      this.policies.set(widgetId, { ...policy, lastRefreshedAt: new Date().toISOString() });
    }
  }

  /** List all scheduled widget ids. / Повертає усі заплановані widgetId. */
  listScheduled(): string[] {
    return Array.from(this.policies.keys());
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** Global refresh scheduler singleton. */
export const refreshScheduler = new RefreshScheduler();
