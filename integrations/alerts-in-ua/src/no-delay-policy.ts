/**
 * No alert delay for the civilian persona (task 13).
 *
 * EXPLICIT, LOAD-BEARING INVARIANT:
 *   A civilian persona is NEVER delayed, throttled, batched, sampled, or
 *   rate-limited on a life-safety alert. Any debounce / coalescing / commercial
 *   rate-limit that exists for OTHER personas MUST be bypassed for civilians on
 *   raise events. This module is the single guard that enforces it, so the rule
 *   cannot be silently lost in a refactor.
 *
 * Other personas (analyst, journalist, partner) MAY be coalesced/throttled to
 * protect quota — but only when `persona !== "civilian"`.
 */

export type Persona = "civilian" | "analyst" | "journalist" | "partner" | "system";

export type DeliveryKind = "raise" | "clear" | "update";

export interface DeliveryDecision {
  /** Whether delivery proceeds now. */
  deliver: boolean;
  /** Imposed delay in ms (ALWAYS 0 for civilians on raise/clear). */
  delayMs: number;
  /** Whether throttling/coalescing may apply. */
  throttleable: boolean;
  reason: string;
}

/** True iff this persona/kind combination must bypass ALL delay mechanisms. */
export function mustBypassDelay(persona: Persona, kind: DeliveryKind): boolean {
  // Civilians are never delayed on safety-relevant signals (raise OR clear).
  return persona === "civilian" && (kind === "raise" || kind === "clear");
}

/**
 * The ONLY function allowed to decide whether an alert delivery may be delayed.
 * For civilians it hard-codes delayMs=0 and throttleable=false.
 */
export function decideDelivery(
  persona: Persona,
  kind: DeliveryKind,
  proposedDelayMs = 0,
): DeliveryDecision {
  if (mustBypassDelay(persona, kind)) {
    return {
      deliver: true,
      delayMs: 0,
      throttleable: false,
      reason: "civilian-safety invariant: zero delay, no throttle",
    };
  }
  return {
    deliver: true,
    delayMs: Math.max(0, proposedDelayMs),
    throttleable: true,
    reason: `non-civilian (${persona}/${kind}): standard delivery policy applies`,
  };
}

/**
 * Assertion helper for tests / runtime guards: throws if a civilian delivery is
 * ever assigned a non-zero delay. Wire this into the push fan-out to make the
 * invariant fail loudly rather than silently.
 */
export function assertNoCivilianDelay(persona: Persona, kind: DeliveryKind, delayMs: number): void {
  if (mustBypassDelay(persona, kind) && delayMs > 0) {
    throw new Error(
      `INVARIANT VIOLATION: civilian ${kind} alert assigned ${delayMs}ms delay (must be 0)`,
    );
  }
}
