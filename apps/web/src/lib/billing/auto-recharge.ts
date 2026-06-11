/**
 * Auto-Recharge — automatically top up the credits wallet when balance is low.
 *
 * Users opt in to auto-recharge and set a threshold + recharge amount.
 * When the wallet balance drops below the threshold the next eligible purchase
 * triggers a Stripe payment and credits the wallet.
 *
 * Авто-поповнення гаманця: коли баланс нижче порогу, списується встановлена сума.
 */

import { walletStore } from "./credits-wallet";
import { createTopUpCheckout, TOP_UP_PACKS } from "./credits-topup";

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Default minimum balance that triggers auto-recharge.
 * Поріг за замовчуванням — нижче якого спрацьовує авто-поповнення.
 */
export const AUTO_RECHARGE_MIN_BALANCE = 100;

/**
 * Default recharge pack amount (USD) if user has not configured a preference.
 * Пакет за замовчуванням при авто-поповненні.
 */
export const AUTO_RECHARGE_DEFAULT_PACK_AMOUNT = 50;

// ── AutoRechargeConfig ─────────────────────────────────────────────────────────

export interface AutoRechargeConfig {
  userId: string;
  /** Auto-recharge is active for this user */
  enabled: boolean;
  /** Trigger recharge when balance drops below this credit amount */
  thresholdCredits: number;
  /** USD amount of the top-up pack to purchase automatically */
  rechargePackAmount: number;
  /** ISO timestamp of the last auto-recharge trigger */
  lastTriggeredAt: string | null;
  /** Total number of times auto-recharge has fired for this user */
  triggerCount: number;
}

// ── AutoRechargeStore ──────────────────────────────────────────────────────────

export class AutoRechargeStore {
  private readonly configs = new Map<string, AutoRechargeConfig>();

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the auto-recharge config for a user.
   * Returns a disabled default config if none has been saved.
   *
   * Повертає конфіг авто-поповнення; якщо не задано — вимкнений дефолт.
   */
  getConfig(userId: string): AutoRechargeConfig {
    return (
      this.configs.get(userId) ?? {
        userId,
        enabled: false,
        thresholdCredits: AUTO_RECHARGE_MIN_BALANCE,
        rechargePackAmount: AUTO_RECHARGE_DEFAULT_PACK_AMOUNT,
        lastTriggeredAt: null,
        triggerCount: 0,
      }
    );
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Save or update the auto-recharge config for a user.
   * Validates that the pack amount is one of the defined TOP_UP_PACKS.
   *
   * Зберігає або оновлює конфіг авто-поповнення для користувача.
   */
  setConfig(
    userId: string,
    update: Partial<Omit<AutoRechargeConfig, "userId" | "triggerCount" | "lastTriggeredAt">>,
  ): AutoRechargeConfig {
    if (
      update.rechargePackAmount !== undefined &&
      !TOP_UP_PACKS.some((p) => p.amount === update.rechargePackAmount)
    ) {
      throw new Error(
        `[auto-recharge] Invalid pack amount: $${update.rechargePackAmount}. ` +
          `Valid: ${TOP_UP_PACKS.map((p) => `$${p.amount}`).join(", ")}`,
      );
    }

    const existing = this.getConfig(userId);
    const updated: AutoRechargeConfig = { ...existing, ...update, userId };
    this.configs.set(userId, updated);
    return updated;
  }

  /**
   * Mark that auto-recharge fired for a user (called after Checkout redirect created).
   * Записує факт спрацювання авто-поповнення.
   */
  recordTrigger(userId: string): void {
    const cfg = this.getConfig(userId);
    this.configs.set(userId, {
      ...cfg,
      lastTriggeredAt: new Date().toISOString(),
      triggerCount: cfg.triggerCount + 1,
    });
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory auto-recharge store. */
export const autoRechargeStore = new AutoRechargeStore();

// ── checkAndTriggerRecharge ────────────────────────────────────────────────────

/**
 * Check if the user's wallet is below the auto-recharge threshold and, if so,
 * initiate a Stripe Checkout session (returns the URL) or no-ops (returns null).
 *
 * Call this at the start of any credit-consuming operation.
 *
 * Перевіряє баланс; якщо нижче порогу і авто-поповнення увімкнено — створює Checkout.
 * Повертає URL сесії або null.
 */
export async function checkAndTriggerRecharge(
  userId: string,
): Promise<void> {
  const cfg = autoRechargeStore.getConfig(userId);
  if (!cfg.enabled) return;

  const balance = walletStore.getBalance(userId);
  if (balance >= cfg.thresholdCredits) return;

  // Avoid duplicate triggers within a short window (simple guard — replace with
  // a proper idempotency key / distributed lock in production)
  // Захист від дублювання — у продакшн замінити на ідемпотентний ключ
  if (cfg.lastTriggeredAt) {
    const lastMs = new Date(cfg.lastTriggeredAt).getTime();
    const ageSeconds = (Date.now() - lastMs) / 1_000;
    if (ageSeconds < 60) return; // de-bounce: at most once per minute per user
  }

  // Fire-and-forget: create checkout session (caller may use the URL for a
  // background payment method charge or webhook-triggered auto-pay)
  await createTopUpCheckout(userId, cfg.rechargePackAmount);
  autoRechargeStore.recordTrigger(userId);
}
