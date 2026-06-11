/**
 * Prepaid Credits Override — when a user holds a sufficient prepaid credit
 * balance, overage is drawn from the credits wallet instead of triggering
 * Stripe usage-record billing.
 *
 * See TODO_credits_wallet.md for the full credits policy.
 *
 * Перевизначення на основі передоплачених кредитів: overage списується з
 * гаманця кредитів, а не через Stripe metered billing.
 */

import { walletStore } from "./credits-wallet";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * English policy note surfaced in the UI and audit log.
 *
 * Текст пояснення для UI (англійська).
 */
export const CREDITS_OVERRIDE_NOTE_EN =
  "Your prepaid credit balance is being used to cover overage costs. " +
  "When your credits are exhausted, standard Stripe metered billing applies.";

/**
 * Ukrainian policy note surfaced in the UI and audit log.
 *
 * Текст пояснення для UI (українська).
 */
export const CREDITS_OVERRIDE_NOTE_UK =
  "Ваш залишок передоплачених кредитів використовується для покриття перевищення квоти. " +
  "Після вичерпання кредитів застосовується стандартний Stripe metered billing.";

// ── Interfaces ────────────────────────────────────────────────────────────────

/**
 * Policy descriptor returned when credits override is active for a user.
 *
 * Описує стан перевизначення для конкретного користувача.
 */
export interface CreditOverridePolicy {
  userId: string;
  /** Whether credits override is currently active */
  active: boolean;
  /** Current credit balance at the time of evaluation */
  currentBalance: number;
  /** Minimum balance required to activate the override */
  minimumBalanceRequired: number;
  note_en: string;
  note_uk: string;
}

// ── Configuration ─────────────────────────────────────────────────────────────

/**
 * Minimum prepaid credit balance (in Aegis credits) required to activate
 * the credits-override mode.
 *
 * Мінімальний баланс кредитів для активації режиму перевизначення.
 */
const MIN_BALANCE_FOR_OVERRIDE = 10;

// ── shouldUseCreditsOverride ──────────────────────────────────────────────────

/**
 * Returns true if the user's prepaid credit balance is sufficient to cover
 * overage through the credits wallet rather than Stripe.
 *
 * Повертає true, якщо баланс кредитів достатній для покриття overage.
 */
export function shouldUseCreditsOverride(userId: string): boolean {
  const balance = walletStore.getBalance(userId);
  return balance >= MIN_BALANCE_FOR_OVERRIDE;
}

// ── getCreditOverridePolicy ───────────────────────────────────────────────────

/**
 * Retrieve the full credits-override policy for a user including their
 * current balance and whether override is currently active.
 *
 * Повертає повний опис політики credits override для користувача.
 */
export function getCreditOverridePolicy(userId: string): CreditOverridePolicy {
  const balance = walletStore.getBalance(userId);
  const active = balance >= MIN_BALANCE_FOR_OVERRIDE;

  return {
    userId,
    active,
    currentBalance: balance,
    minimumBalanceRequired: MIN_BALANCE_FOR_OVERRIDE,
    note_en: CREDITS_OVERRIDE_NOTE_EN,
    note_uk: CREDITS_OVERRIDE_NOTE_UK,
  };
}
