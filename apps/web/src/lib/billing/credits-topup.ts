/**
 * Credits Top-Up — Stripe Checkout for one-off credit purchases.
 *
 * Defines top-up packs with volume bonuses and creates a Stripe Checkout
 * session stub for the frontend to redirect to.
 *
 * Пакети поповнення кредитів зі Stripe Checkout. Бонус за обсяг нараховується в stripe-webhooks.ts.
 */

// ── TopUpPack ──────────────────────────────────────────────────────────────────

export interface TopUpPack {
  /** USD amount the user pays */
  amount: number;
  /** Bonus fraction applied on purchase, e.g. 0.05 = 5% extra credits */
  bonus: number;
  /** Credits awarded before bonus (amount × CREDITS_PER_USD) */
  baseCredits: number;
  /** Credits awarded after bonus */
  totalCredits: number;
  /** Human-readable label */
  label: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

/** $1 = 100 credits (matches credits-wallet.ts CREDITS_PER_USD). Відповідає значенню у credits-wallet.ts. */
const CREDITS_PER_USD = 100;

/**
 * Available top-up packs.
 * Bonus thresholds: +5% at $250, +10% at $1k, +20% at $5k.
 *
 * Пакети поповнення. Бонус: +5% від $250, +10% від $1k, +20% від $5k.
 */
export const TOP_UP_PACKS: TopUpPack[] = [
  {
    amount: 50,
    bonus: 0,
    baseCredits: 50 * CREDITS_PER_USD,
    totalCredits: 50 * CREDITS_PER_USD,
    label: "$50 — 5,000 credits",
  },
  {
    amount: 250,
    bonus: 0.05,
    baseCredits: 250 * CREDITS_PER_USD,
    totalCredits: Math.round(250 * CREDITS_PER_USD * 1.05),
    label: "$250 — 26,250 credits (+5%)",
  },
  {
    amount: 1_000,
    bonus: 0.10,
    baseCredits: 1_000 * CREDITS_PER_USD,
    totalCredits: Math.round(1_000 * CREDITS_PER_USD * 1.10),
    label: "$1,000 — 110,000 credits (+10%)",
  },
  {
    amount: 5_000,
    bonus: 0.20,
    baseCredits: 5_000 * CREDITS_PER_USD,
    totalCredits: Math.round(5_000 * CREDITS_PER_USD * 1.20),
    label: "$5,000 — 600,000 credits (+20%)",
  },
];

// ── createTopUpCheckout ────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout session for a credit top-up.
 * Returns the Checkout session URL to redirect the user to.
 *
 * Stub: replace with real stripe.checkout.sessions.create() call.
 * The webhook (stripe-webhooks.ts → onInvoicePaid) credits the wallet after payment.
 *
 * Заглушка. Повертає URL сесії Checkout; гачок stripe-webhooks.ts нараховує кредити.
 */
export async function createTopUpCheckout(
  userId: string,
  packAmount: number,
): Promise<string> {
  const pack = TOP_UP_PACKS.find((p) => p.amount === packAmount);
  if (!pack) {
    throw new Error(
      `[credits-topup] Unknown pack amount: $${packAmount}. ` +
        `Valid amounts: ${TOP_UP_PACKS.map((p) => `$${p.amount}`).join(", ")}`,
    );
  }

  // TODO: replace stub with real Stripe SDK call, e.g.:
  //   const session = await stripe.checkout.sessions.create({
  //     mode: "payment",
  //     line_items: [{ price: STRIPE_PRICE_IDS[pack.amount], quantity: 1 }],
  //     metadata: { userId, packAmount: String(pack.amount), bonus: String(pack.bonus) },
  //     success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing/credits?success=1`,
  //     cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/billing/credits`,
  //   });
  //   return session.url!;

  const successUrl = `${process.env["NEXT_PUBLIC_BASE_URL"] ?? "https://aegislens.uk"}/billing/credits?success=1&pack=${pack.amount}`;

  // Stub URL — replace with real Stripe redirect
  return `https://checkout.stripe.com/pay/stub?userId=${encodeURIComponent(userId)}&pack=${pack.amount}&credits=${pack.totalCredits}&success_url=${encodeURIComponent(successUrl)}`;
}
