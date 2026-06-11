/**
 * Compliance policy for missile-layer publishing.
 *
 * HARD RULE: never publish predicted-impact projections for *live* events.
 * Projecting where an in-flight or just-launched missile will land, in public,
 * could endanger civilians / aid targeting. Predicted-impact geometry (e.g. the
 * far end of a trajectory cone) may only be surfaced internally, or publicly
 * once the event has actually resolved (impact / intercept confirmed).
 *
 * This module exports the policy and a guard function the API route / serializer
 * calls before emitting any predicted-impact field.
 */

import { MissileEventSubstatus } from "./types";

/** Statuses considered "live" — predicted impact must be blocked from public. */
export const LIVE_SUBSTATUSES: MissileEventSubstatus[] = ["launched", "in_flight"];

/** Statuses where the event has resolved and projections are moot/allowed. */
export const RESOLVED_SUBSTATUSES: MissileEventSubstatus[] = ["intercepted", "impact"];

export interface PredictedImpactGuardInput {
  substatus: MissileEventSubstatus;
  /** Audience the payload is being built for. */
  audience: "public" | "internal";
}

export interface PredictedImpactGuardResult {
  /** True when predicted-impact projections may be included. */
  allowed: boolean;
  reasonEn: string;
  reasonUk: string;
}

/**
 * Guard: may we publish a predicted-impact projection for this event?
 *
 * - Internal audience: always allowed (analysts may see projections).
 * - Public audience: blocked while the event is live (launched / in_flight);
 *   allowed once resolved or for unconfirmed historical entries.
 */
export function canPublishPredictedImpact(
  input: PredictedImpactGuardInput,
): PredictedImpactGuardResult {
  if (input.audience === "internal") {
    return {
      allowed: true,
      reasonEn: "Internal audience — projections permitted.",
      reasonUk: "Внутрішня аудиторія — прогнози дозволені.",
    };
  }

  if (LIVE_SUBSTATUSES.includes(input.substatus)) {
    return {
      allowed: false,
      reasonEn: "Predicted impact is blocked for live (launched/in-flight) events to protect civilians.",
      reasonUk: "Прогноз місця удару заблоковано для активних (запущено/в польоті) подій задля безпеки цивільних.",
    };
  }

  return {
    allowed: true,
    reasonEn: "Event resolved — predicted-impact context permitted.",
    reasonUk: "Подію завершено — контекст прогнозу дозволено.",
  };
}

/**
 * Convenience: strip predicted-impact fields from a public payload when the
 * guard disallows them. Returns a shallow copy; never mutates the input.
 */
export function redactPredictedImpact<
  T extends { substatus: MissileEventSubstatus; predictedImpact?: unknown },
>(payload: T, audience: "public" | "internal"): T {
  const guard = canPublishPredictedImpact({ substatus: payload.substatus, audience });
  if (guard.allowed) return payload;
  const { predictedImpact: _omit, ...rest } = payload;
  return rest as T;
}
