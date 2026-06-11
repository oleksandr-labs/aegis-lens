/**
 * TASK 1 — Strict ingestion policy.
 *
 * ONLY post-event, publicly-attributed reports may enter the pipeline. Anything
 * else is REJECTED with a typed reason. This is fail-closed: a report must
 * affirmatively prove it is past-tense and publicly attributed, otherwise it
 * is dropped.
 */

export type IngestionRejectReason =
  | "not_post_event"          // occurredAt is in the future / live / near-real-time
  | "missing_occurred_at"     // no timestamp → cannot prove it is post-event
  | "not_publicly_attributed" // unit is not flagged as publicly attributed
  | "no_attribution_source"   // no public source attributes the unit
  | "no_unit"                 // no unit reference at all
  | "below_min_age";          // newer than the minimum post-event lag

/** Raw, pre-validation shape an exporter hands us. */
export interface RawMovementInput {
  reportId?: string;
  unitId?: string;
  occurredAt?: string;
  /** Whether the referenced unit is publicly attributed (from OOB resolution). */
  unitPubliclyAttributed?: boolean;
  /** Public sources attributing the unit. */
  attributionSourceUrls?: string[];
}

export interface IngestionDecision {
  accepted: boolean;
  reasons: IngestionRejectReason[];
}

/**
 * Minimum lag (ms) between an event occurring and it being eligible for
 * ingestion. This enforces "post-event, not live" at the very edge of the
 * pipeline, independently of the later per-scenario delay policy.
 * Default: 6 hours.
 */
export const MIN_POST_EVENT_LAG_MS = 6 * 3600_000;

/**
 * Decide whether a raw report may be ingested. Fail-closed: any failed check
 * accumulates a typed reason and the report is rejected.
 */
export function evaluateIngestion(
  input: RawMovementInput,
  now: number = Date.now(),
): IngestionDecision {
  const reasons: IngestionRejectReason[] = [];

  // Must reference a unit.
  if (!input.unitId) reasons.push("no_unit");

  // Must be publicly attributed (OOB) — fail-closed if undefined/false.
  if (input.unitPubliclyAttributed !== true) reasons.push("not_publicly_attributed");

  // Must carry at least one public attribution source.
  if (!input.attributionSourceUrls || input.attributionSourceUrls.length === 0) {
    reasons.push("no_attribution_source");
  }

  // Must have a timestamp to prove it is post-event.
  if (!input.occurredAt) {
    reasons.push("missing_occurred_at");
  } else {
    const t = new Date(input.occurredAt).getTime();
    if (Number.isNaN(t) || t > now) {
      // Future / live / unparseable → not post-event.
      reasons.push("not_post_event");
    } else if (now - t < MIN_POST_EVENT_LAG_MS) {
      // Too fresh — within the live/near-real-time exclusion window.
      reasons.push("below_min_age");
    }
  }

  return { accepted: reasons.length === 0, reasons };
}

/** Convenience guard: throws on rejection (use where a hard stop is wanted). */
export function assertIngestable(input: RawMovementInput, now: number = Date.now()): void {
  const decision = evaluateIngestion(input, now);
  if (!decision.accepted) {
    throw new Error(`troop-movement ingestion rejected: ${decision.reasons.join(", ")}`);
  }
}
