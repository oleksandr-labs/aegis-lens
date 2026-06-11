'use server';

/**
 * Marketplace — Paid plugins via Stripe Connect (80/20 split).
 *
 * Implements the checkout stub for paid plugin purchases.
 * Developers receive 80 % of every transaction via Stripe Connect Express;
 * the platform retains 20 % as a service fee.
 *
 * 80 % виплачується розробнику через Stripe Connect Express;
 * 20 % — платформний збір.
 */

// ── Revenue split constants ───────────────────────────────────────────────────

/**
 * Platform cut: 20 % of every paid plugin transaction.
 *
 * Збір платформи: 20 % від кожної транзакції.
 */
export const PLATFORM_CUT = 0.20 as const;

/**
 * Developer cut: 80 % of every paid plugin transaction.
 *
 * Виплата розробнику: 80 % від кожної транзакції.
 */
export const DEVELOPER_CUT = 0.80 as const;

// ── PaidPluginConfig ──────────────────────────────────────────────────────────

/**
 * Configuration for a paid plugin listing.
 *
 * Конфігурація платного плагіну.
 */
export interface PaidPluginConfig {
  pluginId: string;
  /** Developer's Stripe Connect Express account ID */
  stripeConnectAccountId: string;
  /**
   * One-time purchase price in USD cents (e.g. 2900 = $29.00).
   * null if this plugin uses subscription billing instead.
   *
   * Разова ціна в центах USD; null для підписки.
   */
  oneTimePriceCents: number | null;
  /**
   * Monthly subscription price in USD cents.
   * null if this plugin uses one-time pricing instead.
   *
   * Ціна підписки на місяць у центах USD; null для разової оплати.
   */
  monthlyPriceCents: number | null;
  /** Stripe Price ID for one-time purchase (created in Stripe dashboard) */
  stripePriceIdOneTime?: string;
  /** Stripe Price ID for monthly subscription */
  stripePriceIdSubscription?: string;
  /** ISO 8601 — when pricing was last updated */
  priceUpdatedAt: string;
}

// ── CheckoutResult ────────────────────────────────────────────────────────────

export interface CheckoutResult {
  /** Stripe Checkout Session URL — redirect the user to this URL */
  checkoutUrl: string;
  /** Stripe Checkout Session ID */
  sessionId: string;
}

// ── PaidPluginStore ───────────────────────────────────────────────────────────

/**
 * Registry of paid plugin configurations and purchase records.
 *
 * Реєстр конфігурацій платних плагінів та записів про покупки.
 */
export class PaidPluginStore {
  private readonly configs = new Map<string, PaidPluginConfig>();
  /** pluginId → Set of orgIds that have purchased */
  private readonly purchases = new Map<string, Set<string>>();

  // ── Config management ──────────────────────────────────────────────────────

  registerConfig(config: PaidPluginConfig): void {
    this.configs.set(config.pluginId, config);
  }

  getConfig(pluginId: string): PaidPluginConfig | undefined {
    return this.configs.get(pluginId);
  }

  // ── Purchase tracking ──────────────────────────────────────────────────────

  /** Record a completed purchase (called from Stripe webhook handler). */
  recordPurchase(pluginId: string, orgId: string): void {
    const set = this.purchases.get(pluginId) ?? new Set<string>();
    set.add(orgId);
    this.purchases.set(pluginId, set);
  }

  /** Check whether an org has purchased a plugin. */
  hasPurchased(pluginId: string, orgId: string): boolean {
    return this.purchases.get(pluginId)?.has(orgId) ?? false;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const paidPluginStore = new PaidPluginStore();

// ── createPluginCheckout ──────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a paid plugin purchase.
 * Returns the Checkout URL to redirect the purchasing org to.
 *
 * This is an 80/20 stub — the application_fee_amount parameter implements
 * the platform's 20 % cut via Stripe Connect.
 *
 * In production: import and call the real Stripe SDK.
 *
 * Stub: у проді — виклик реального Stripe SDK з application_fee_amount = 20 %.
 */
export async function createPluginCheckout(
  pluginId: string,
  orgId: string,
): Promise<string> {
  const config = paidPluginStore.getConfig(pluginId);
  if (!config) {
    throw new Error(`[paid-plugins] No pricing config found for plugin "${pluginId}".`);
  }

  const priceId = config.stripePriceIdOneTime ?? config.stripePriceIdSubscription;
  if (!priceId) {
    throw new Error(
      `[paid-plugins] Plugin "${pluginId}" has no Stripe Price ID configured.`,
    );
  }

  const priceCents = config.oneTimePriceCents ?? config.monthlyPriceCents ?? 0;
  const feeCents = Math.round(priceCents * PLATFORM_CUT);

  // ── Stub checkout session ──────────────────────────────────────────────────
  // Replace with real stripe.checkout.sessions.create() call in production.
  // Замінити на реальний виклик stripe.checkout.sessions.create() у проді.
  const stubSessionId = `cs_stub_${pluginId}_${orgId}_${Date.now()}`;
  const checkoutUrl =
    `https://checkout.stripe.com/pay/${stubSessionId}` +
    `?plugin=${pluginId}&org=${orgId}&fee_cents=${feeCents}`;

  // Log for tracing during development
  console.info(
    `[paid-plugins] Checkout stub | plugin=${pluginId} org=${orgId} ` +
      `price=${priceCents}¢ platform_fee=${feeCents}¢ (${PLATFORM_CUT * 100}%) ` +
      `developer_net=${priceCents - feeCents}¢ (${DEVELOPER_CUT * 100}%)`,
  );

  return checkoutUrl;
}
