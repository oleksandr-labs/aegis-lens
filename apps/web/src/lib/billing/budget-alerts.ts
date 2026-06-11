/**
 * Budget Alerts — notify users when their estimated monthly spend reaches
 * 50%, 80%, or 100% of their self-set budget cap.
 *
 * Бюджетні сповіщення: 50%, 80%, 100% від ліміту витрат користувача.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Thresholds at which budget alerts are fired.
 * Values are fractions (0–1) of the user's budget cap.
 *
 * Пороги (частки від ліміту), при яких надсилаються сповіщення.
 */
export const BUDGET_ALERT_THRESHOLDS: readonly number[] = [0.5, 0.8, 1.0] as const;

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single fired budget alert. */
export interface BudgetAlert {
  userId: string;
  /** The threshold fraction that triggered this alert (e.g. 0.5, 0.8, 1.0) */
  threshold: number;
  /** User's budget cap in USD */
  budgetCapUsd: number;
  /** Current estimated monthly spend in USD at the time the alert fired */
  currentSpendUsd: number;
  /** Ratio currentSpendUsd / budgetCapUsd */
  ratio: number;
  /** YYYY-MM billing period */
  period: string;
  /** ISO 8601 — when the alert was generated */
  firedAt: string;
  /** Whether the alert email has been sent */
  emailSent: boolean;
  /** Whether the in-app notification is still unread */
  unread: boolean;
}

/** Per-user budget configuration. */
export interface UserBudgetConfig {
  userId: string;
  /** Monthly budget cap in USD. null = no cap set */
  budgetCapUsd: number | null;
  /** Whether budget alerts are enabled */
  enabled: boolean;
}

// ── Period helper ─────────────────────────────────────────────────────────────

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── BudgetAlertStore ──────────────────────────────────────────────────────────

/**
 * Stores per-user budget configs and fired alerts.
 * In production, persist to DB. Here: in-memory singleton.
 *
 * Зберігає конфігурації бюджетів та спрацьовані сповіщення.
 */
export class BudgetAlertStore {
  /** userId → config */
  private readonly configs = new Map<string, UserBudgetConfig>();

  /** Key: `${userId}:${period}:${threshold}` → alert */
  private readonly alerts = new Map<string, BudgetAlert>();

  // ── Config ────────────────────────────────────────────────────────────────

  /** Set or update a user's budget cap. */
  setbudgetCap(userId: string, budgetCapUsd: number | null, enabled = true): void {
    this.configs.set(userId, { userId, budgetCapUsd, enabled });
  }

  /** Retrieve a user's budget config or return a default (disabled, no cap). */
  getBudgetConfig(userId: string): UserBudgetConfig {
    return (
      this.configs.get(userId) ?? { userId, budgetCapUsd: null, enabled: false }
    );
  }

  // ── Check ─────────────────────────────────────────────────────────────────

  /**
   * Evaluate the current spend against the user's budget cap.
   * Returns any newly triggered alerts (those not previously fired this period).
   *
   * Перевіряє поточні витрати та повертає нові сповіщення.
   */
  checkBudgetAlerts(
    userId: string,
    currentSpendUsd: number,
    period?: string,
  ): BudgetAlert[] {
    const p = period ?? currentPeriod();
    const config = this.getBudgetConfig(userId);

    if (!config.enabled || config.budgetCapUsd === null || config.budgetCapUsd <= 0) {
      return [];
    }

    const ratio = currentSpendUsd / config.budgetCapUsd;
    const newAlerts: BudgetAlert[] = [];

    for (const threshold of BUDGET_ALERT_THRESHOLDS) {
      if (ratio < threshold) continue;

      const k = `${userId}:${p}:${threshold}`;
      if (this.alerts.has(k)) continue; // already fired — idempotent

      const alert: BudgetAlert = {
        userId,
        threshold,
        budgetCapUsd: config.budgetCapUsd,
        currentSpendUsd,
        ratio,
        period: p,
        firedAt: new Date().toISOString(),
        emailSent: false,
        unread: true,
      };
      this.alerts.set(k, alert);
      newAlerts.push(alert);
    }

    return newAlerts;
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  /** List all alerts for a user (all periods). */
  listAlerts(userId: string): BudgetAlert[] {
    const result: BudgetAlert[] = [];
    for (const alert of this.alerts.values()) {
      if (alert.userId === userId) result.push(alert);
    }
    return result.sort((a, b) => a.firedAt.localeCompare(b.firedAt));
  }

  /** Mark a specific alert's email as sent. */
  markEmailSent(userId: string, period: string, threshold: number): void {
    const k = `${userId}:${period}:${threshold}`;
    const alert = this.alerts.get(k);
    if (alert) alert.emailSent = true;
  }

  /** Mark a specific alert as read. */
  markRead(userId: string, period: string, threshold: number): void {
    const k = `${userId}:${period}:${threshold}`;
    const alert = this.alerts.get(k);
    if (alert) alert.unread = false;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global budget alert store. */
export const budgetAlertStore = new BudgetAlertStore();

// ── Convenience wrapper ───────────────────────────────────────────────────────

/**
 * Check budget alerts for a user against their current estimated spend.
 *
 * Перевіряє бюджетні сповіщення для користувача.
 */
export function checkBudgetAlerts(
  userId: string,
  currentSpendUsd: number,
): BudgetAlert[] {
  return budgetAlertStore.checkBudgetAlerts(userId, currentSpendUsd);
}
