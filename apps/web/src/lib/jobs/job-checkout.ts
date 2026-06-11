/**
 * Job Board Checkout — Stripe Checkout sessions for job postings.
 *
 * Creates a one-off Checkout session for standard, featured, or annual
 * employer job-board subscriptions. No recurring billing — each posting
 * is a discrete purchase.
 *
 * Оплата розміщення вакансій через Stripe Checkout. Разовий платіж.
 */

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Prices in USD for each posting type.
 * Standard: $299 / 30 days. Featured: $499 (+$200 bump). Annual: $2,499 unlimited.
 *
 * Ціни в USD для кожного типу публікації.
 */
export const JOB_POSTING_PRICES: Record<JobPostingType, number> = {
  standard: 299,
  featured: 499,
  annual: 2_499,
};

// ── JobPostingType ─────────────────────────────────────────────────────────────

export type JobPostingType = "standard" | "featured" | "annual";

// ── JobPostingConfig ───────────────────────────────────────────────────────────

export interface JobPostingConfig {
  type: JobPostingType;
  priceUsd: number;
  /** Number of days the posting stays active (null = unlimited for annual) */
  durationDays: number | null;
  /** Human-readable label shown at Checkout */
  label: string;
  /** Short description for the Checkout line item */
  description: string;
}

/** Canonical posting configurations. */
export const JOB_POSTING_CONFIGS: Record<JobPostingType, JobPostingConfig> = {
  standard: {
    type: "standard",
    priceUsd: JOB_POSTING_PRICES.standard,
    durationDays: 30,
    label: "Standard Job Posting",
    description: "30-day listing visible to all Aegis Lens users and analysts.",
  },
  featured: {
    type: "featured",
    priceUsd: JOB_POSTING_PRICES.featured,
    durationDays: 30,
    label: "Featured Job Posting",
    description:
      "30-day listing with homepage + digest placement and badge highlight.",
  },
  annual: {
    type: "annual",
    priceUsd: JOB_POSTING_PRICES.annual,
    durationDays: null,
    label: "Annual Employer Subscription",
    description:
      "Unlimited postings + talent search access for 12 months.",
  },
};

// ── createJobPostingCheckout ───────────────────────────────────────────────────

/**
 * Create a Stripe Checkout session for a job posting purchase.
 * Returns the Checkout session URL.
 *
 * Stub: replace with real stripe.checkout.sessions.create() in production.
 *
 * Заглушка. Повертає URL Checkout; замінити на реальний виклик Stripe SDK.
 */
export async function createJobPostingCheckout(
  type: JobPostingType,
  userId: string,
): Promise<string> {
  const config = JOB_POSTING_CONFIGS[type];
  if (!config) {
    throw new Error(
      `[job-checkout] Unknown posting type: "${type}". ` +
        `Valid types: ${Object.keys(JOB_POSTING_CONFIGS).join(", ")}`,
    );
  }

  const base = process.env["NEXT_PUBLIC_BASE_URL"] ?? "https://aegislens.uk";

  // TODO: replace stub with real Stripe SDK call, e.g.:
  //   const session = await stripe.checkout.sessions.create({
  //     mode: "payment",
  //     line_items: [{ price: STRIPE_PRICE_IDS[type], quantity: 1 }],
  //     metadata: { userId, jobPostingType: type },
  //     success_url: `${base}/jobs/post/success?session_id={CHECKOUT_SESSION_ID}`,
  //     cancel_url:  `${base}/jobs/post`,
  //   });
  //   return session.url!;

  const successUrl = `${base}/jobs/post/success?type=${type}`;
  return (
    `https://checkout.stripe.com/pay/stub` +
    `?userId=${encodeURIComponent(userId)}` +
    `&type=${type}` +
    `&amount=${config.priceUsd}` +
    `&success_url=${encodeURIComponent(successUrl)}`
  );
}
