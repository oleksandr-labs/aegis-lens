/**
 * Marketplace — Revenue-sharing (revshare) constants and utilities.
 *
 * Platform fee: 30 %.  Creator share: 70 %.
 * Applies to both one-time paid items and subscription items.
 *
 * Платформний збір: 30 %.  Частка автора: 70 %.
 * Застосовується як до разових, так і до підписних позицій.
 */

// ── Split constants ───────────────────────────────────────────────────────────

/** Platform keeps 30 % of every transaction. */
export const PLATFORM_FEE_PCT = 0.30;

/** Creator receives 70 % of every transaction. */
export const CREATOR_SHARE_PCT = 0.70;

// ── Featured placement policy ─────────────────────────────────────────────────

/**
 * Policy statement for paid featured placement — English.
 * A transparent "Featured" label is always shown to end users.
 */
export const FEATURED_PLACEMENT_POLICY_EN =
  "Featured placement is paid by the creator (transparent label visible to all users).";

/**
 * Policy statement for paid featured placement — Ukrainian.
 * Мітка «Featured» завжди відображається кінцевим користувачам.
 */
export const FEATURED_PLACEMENT_POLICY_UK =
  "Платне виділення оплачується автором контенту (мітка видима всім користувачам).";

// ── Refund policy ─────────────────────────────────────────────────────────────

/**
 * Buyer refund policy — English.
 * 7-day window; refund cost charged back to the creator.
 */
export const REFUND_POLICY_EN =
  "Buyers have a 7-day refund window. Refund cost is charged back to the creator.";

/**
 * Buyer refund policy — Ukrainian.
 * 7-денне вікно; вартість повернення стягується з автора.
 */
export const REFUND_POLICY_UK =
  "Покупці мають 7-денне вікно повернення. Вартість повернення стягується з автора.";

// ── Free items policy ─────────────────────────────────────────────────────────

/**
 * Policy for free marketplace items — English.
 * Free items are encouraged to grow the ecosystem.
 */
export const FREE_ITEMS_POLICY_EN =
  "Free items are allowed and encouraged to grow the ecosystem.";

/**
 * Policy for free marketplace items — Ukrainian.
 * Безкоштовні позиції заохочуються для розвитку екосистеми.
 */
export const FREE_ITEMS_POLICY_UK =
  "Безкоштовні елементи дозволені й заохочуються для розвитку екосистеми.";

// ── Payout computations ───────────────────────────────────────────────────────

/**
 * Compute the creator net payout for a given gross transaction amount.
 *
 * @param grossUsd - Gross revenue in USD (what the buyer paid).
 * @returns Creator's share in USD (70 % of gross).
 *
 * Обчислює частку автора (70 % від суми транзакції).
 */
export function computeCreatorPayout(grossUsd: number): number {
  return grossUsd * CREATOR_SHARE_PCT;
}

/**
 * Compute the platform fee for a given gross transaction amount.
 *
 * @param grossUsd - Gross revenue in USD (what the buyer paid).
 * @returns Platform fee in USD (30 % of gross).
 *
 * Обчислює платформний збір (30 % від суми транзакції).
 */
export function computePlatformFee(grossUsd: number): number {
  return grossUsd * PLATFORM_FEE_PCT;
}
