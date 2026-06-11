/**
 * Per-location alert state machine (task 7): active / cleared / partial.
 *
 * A location's effective state is more than the latest message. Because alerts
 * can be raised/cleared at oblast vs raion/hromada level independently, a state
 * can be "partial" — active in SOME sub-areas while clear elsewhere. This FSM
 * tracks each location's state and the legal transitions, returning the emitted
 * transition (if any) so the feed only pushes real changes.
 *
 * States:  active ⇄ partial ⇄ cleared  (cleared ⇄ active directly allowed)
 */

import type { OblastCode, AlertType, AlertStatus } from "./types";

export type LocationState = "active" | "partial" | "cleared";

export interface LocationKey {
  oblastCode: OblastCode;
  type: AlertType;
}

export interface Transition {
  from: LocationState;
  to: LocationState;
  at: string;
  /** Active-subarea ratio that produced `to` (1 = whole oblast, 0 = none). */
  activeRatio: number;
}

/** Legal transitions (any non-identity move is allowed; identity is a no-op). */
function isLegal(from: LocationState, to: LocationState): boolean {
  return from !== to;
}

/** Derive a state from how much of an oblast is currently under alert. */
export function stateFromRatio(activeRatio: number): LocationState {
  if (activeRatio <= 0) return "cleared";
  if (activeRatio >= 1) return "active";
  return "partial";
}

/** Map a coarse AlertStatus → ratio (oblast-level sources have no sub-areas). */
export function ratioFromStatus(status: AlertStatus): number {
  if (status === "active") return 1;
  if (status === "partial_clear") return 0.5;
  return 0;
}

function keyOf(k: LocationKey): string {
  return `${k.oblastCode}:${k.type}`;
}

export class AlertStateMachine {
  private states = new Map<string, LocationState>();

  /** Current state for a location (defaults to cleared). */
  get(key: LocationKey): LocationState {
    return this.states.get(keyOf(key)) ?? "cleared";
  }

  /**
   * Apply an active-subarea ratio (0..1) for a location. Returns the transition
   * if the state changed, else null.
   */
  applyRatio(key: LocationKey, activeRatio: number, at = new Date().toISOString()): Transition | null {
    const k = keyOf(key);
    const from = this.states.get(k) ?? "cleared";
    const to = stateFromRatio(activeRatio);
    if (!isLegal(from, to)) return null;
    this.states.set(k, to);
    return { from, to, at, activeRatio };
  }

  /** Convenience: apply a coarse AlertStatus. */
  applyStatus(key: LocationKey, status: AlertStatus, at?: string): Transition | null {
    return this.applyRatio(key, ratioFromStatus(status), at);
  }

  /** Snapshot of every tracked location's state. */
  snapshot(): Array<{ key: LocationKey; state: LocationState }> {
    return Array.from(this.states.entries()).map(([k, state]) => {
      const [oblastCode, type] = k.split(":") as [OblastCode, AlertType];
      return { key: { oblastCode, type }, state };
    });
  }
}
