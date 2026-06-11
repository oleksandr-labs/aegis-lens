/**
 * Honeypot field + time-on-form checks.
 *
 * Strategy:
 *  1. Render a hidden field named `HONEYPOT_FIELD_NAME` — real users never
 *     see or fill it; bots that auto-populate every input do.
 *  2. Record the timestamp when the form becomes visible and reject
 *     submissions that arrive faster than `HONEYPOT_MIN_TIME_MS`.
 */

import type { FormSubmission } from "./types";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Name of the CSS-hidden honeypot input field. */
export const HONEYPOT_FIELD_NAME = "website_url" as const;

/**
 * Minimum acceptable time-on-form (milliseconds).
 * A human typically takes at least 3 seconds to fill in any field.
 */
export const HONEYPOT_MIN_TIME_MS = 3_000 as const;

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Returns the honeypot field name to embed (and hide via CSS) in every form.
 * Call this on the client side when rendering the form component.
 */
export function getHoneypotFieldName(): string {
  return HONEYPOT_FIELD_NAME;
}

/**
 * Evaluates a form submission for honeypot and time-on-form violations.
 *
 * Triggers when:
 *  - `honeypotValue` is a non-empty string (bot filled the hidden field), OR
 *  - `timeOnFormMs` is below `HONEYPOT_MIN_TIME_MS` (submission too fast).
 */
export function checkHoneypot(
  submission: FormSubmission,
): { triggered: boolean; reason: string } {
  const { honeypotValue, timeOnFormMs } = submission;

  // Bot filled the hidden field.
  if (honeypotValue !== null && honeypotValue.trim().length > 0) {
    return {
      triggered: true,
      reason: `Honeypot field "${HONEYPOT_FIELD_NAME}" was filled (value: "${honeypotValue.slice(0, 40)}").`,
    };
  }

  // Submission arrived faster than a human could reasonably type.
  if (timeOnFormMs < HONEYPOT_MIN_TIME_MS) {
    return {
      triggered: true,
      reason: `Form submitted in ${timeOnFormMs} ms, below the ${HONEYPOT_MIN_TIME_MS} ms minimum.`,
    };
  }

  return { triggered: false, reason: "Honeypot check passed." };
}
