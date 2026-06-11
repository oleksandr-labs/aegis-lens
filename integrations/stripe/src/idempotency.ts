/**
 * Idempotency helper for all mutating Stripe calls.
 *
 * Task: "Idempotency on charge actions".
 *
 * Every POST/DELETE to Stripe MUST carry a stable Idempotency-Key so retries
 * (network blips, webhook redelivery, double-clicks) never double-charge.
 * Stripe deduplicates by key for 24h. The key MUST be deterministic for the
 * logical operation, not random per attempt — so a retry reuses the same key.
 *
 * https://stripe.com/docs/api/idempotent_requests
 */

import { createHash } from "crypto";

/**
 * Build a deterministic idempotency key from a logical operation descriptor.
 * Same inputs → same key → Stripe treats retries as one request.
 *
 * @param operation logical action, e.g. "refund", "subscription.create"
 * @param scope     entity the action targets, e.g. invoice/charge/customer id
 * @param salt      optional discriminator (e.g. amount, period) so distinct
 *                  intentional operations on the same scope get distinct keys
 */
export function idempotencyKey(operation: string, scope: string, salt?: string): string {
  const material = [operation, scope, salt ?? ""].join("|");
  const digest = createHash("sha256").update(material).digest("hex").slice(0, 32);
  return `aegis-${operation}-${digest}`;
}

/** True if a Stripe path mutates state and therefore requires a key. */
export function requiresIdempotency(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "DELETE";
}

/**
 * Wrap a mutating Stripe call so it always carries an idempotency key.
 *
 * `call` receives the request options object Stripe SDK expects
 * (`{ idempotencyKey, stripeAccount? }`). This is a thin, SDK-agnostic guard:
 * pass the actual `stripe.<resource>.<method>` invocation as `call`.
 */
export async function withIdempotency<T>(
  operation: string,
  scope: string,
  call: (opts: { idempotencyKey: string }) => Promise<T>,
  salt?: string,
): Promise<T> {
  const key = idempotencyKey(operation, scope, salt);
  return call({ idempotencyKey: key });
}

/**
 * In-process guard against replaying the SAME logical operation within a
 * window, complementing Stripe's 24h server-side dedupe (e.g. to short-circuit
 * a redelivered webhook before it even hits the network).
 */
export class IdempotencyGuard {
  private seen = new Map<string, number>();
  constructor(private readonly ttlMs: number = 24 * 60 * 60 * 1000) {}

  /** Returns true if this key is fresh (first time); false if already seen. */
  claim(key: string, now: number = Date.now()): boolean {
    this.evict(now);
    if (this.seen.has(key)) return false;
    this.seen.set(key, now);
    return true;
  }

  private evict(now: number): void {
    for (const [k, t] of this.seen) {
      if (now - t > this.ttlMs) this.seen.delete(k);
    }
  }
}
