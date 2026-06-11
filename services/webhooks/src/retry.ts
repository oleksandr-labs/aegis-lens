/**
 * Exponential backoff with jitter for webhook delivery retries.
 *
 * Schedule: immediately → 5s → 30s → 2min → 10min → 1h → 5h → dead
 * Max 8 attempts total.
 */

const RETRY_DELAYS_MS = [0, 5_000, 30_000, 120_000, 600_000, 3_600_000, 18_000_000];

export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

export function nextRetryDelayMs(attemptNumber: number): number | null {
  if (attemptNumber >= MAX_ATTEMPTS) return null;
  const base = RETRY_DELAYS_MS[attemptNumber - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
  // Add ±15% jitter
  const jitter = base * 0.15 * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(base + jitter));
}

export function nextAttemptAt(attemptNumber: number): Date | null {
  const delayMs = nextRetryDelayMs(attemptNumber);
  if (delayMs === null) return null;
  return new Date(Date.now() + delayMs);
}

export function isRetryable(httpStatus: number | undefined): boolean {
  if (httpStatus === undefined) return true; // network error → retry
  if (httpStatus >= 500) return true;
  if (httpStatus === 408 || httpStatus === 429) return true;
  return false;
}
