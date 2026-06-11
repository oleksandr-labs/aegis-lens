/**
 * Take-down request handler (task 12) — take-down on family request.
 *
 * A family member or authorised party may request that references be removed or
 * suppressed. The default posture is to HONOR the request (dignity over
 * engagement): an unambiguous request is accepted automatically and produces a
 * suppression set the rest of the pipeline must respect (`aggregate.ts`,
 * `memorial-link.ts`, `widget.ts`). The requester's relationship and contact are
 * NEVER published — they are operational metadata only.
 *
 * This is a model/contract: in production the decisions are persisted and the
 * suppression set is loaded by the API route. Here it is pure + deterministic so
 * it can be unit-tested and audited.
 */

import type { TakedownRequest, TakedownDecision, TakedownSuppression } from "./types";

const ACK: Record<"uk" | "en", { accepted: string; review: string }> = {
  uk: {
    accepted:
      "Дякуємо за звернення. Ми вилучаємо відповідні посилання та зведені згадки з повагою до памʼяті. Зміни наберуть чинності найближчим часом.",
    review:
      "Дякуємо за звернення. Ваш запит передано на перегляд відповідальній особі; за замовчуванням ми діємо на користь вилучення.",
  },
  en: {
    accepted:
      "Thank you for reaching out. We are removing the relevant references and aggregate mentions out of respect. Changes take effect shortly.",
    review:
      "Thank you for reaching out. Your request has been routed to a reviewer; by default we err toward removal.",
  },
};

/** An empty suppression set (the safe default for the pipeline). */
export function emptySuppression(): TakedownSuppression {
  return { suppressedMemorialUrls: [], suppressedRegionPeriods: [], suppressAllReferences: false };
}

/**
 * Process a single take-down request into a decision + suppression directives.
 * Requests are accepted by default; only `all_references` scope is flagged for a
 * quick human review (because it is the broadest) while STILL suppressing
 * immediately (fail-safe toward the family).
 */
export function processTakedown(req: TakedownRequest): TakedownDecision {
  const suppress = emptySuppression();

  switch (req.scope) {
    case "memorial_link":
      if (req.memorialUrl) suppress.suppressedMemorialUrls.push(req.memorialUrl);
      break;
    case "aggregate_region":
      suppress.suppressedRegionPeriods.push({ regionCode: req.regionCode, period: req.period });
      break;
    case "all_references":
      suppress.suppressAllReferences = true;
      break;
  }

  const status: TakedownDecision["status"] = req.scope === "all_references" ? "needs_review" : "accepted";
  const ack = status === "accepted" ? ACK[req.locale].accepted : ACK[req.locale].review;

  return {
    requestId: req.id,
    status,
    suppress,
    acknowledgement: {
      uk: req.locale === "uk" ? ack : ACK.uk.accepted,
      en: req.locale === "en" ? ack : ACK.en.accepted,
    },
    decidedAt: new Date().toISOString(),
  };
}

/** Merge many decisions' suppression sets into one effective set. */
export function mergeSuppression(decisions: TakedownDecision[]): TakedownSuppression {
  const merged = emptySuppression();
  for (const d of decisions) {
    if (d.suppress.suppressAllReferences) merged.suppressAllReferences = true;
    merged.suppressedMemorialUrls.push(...d.suppress.suppressedMemorialUrls);
    merged.suppressedRegionPeriods.push(...d.suppress.suppressedRegionPeriods);
  }
  // de-dup URLs
  merged.suppressedMemorialUrls = [...new Set(merged.suppressedMemorialUrls)];
  return merged;
}
