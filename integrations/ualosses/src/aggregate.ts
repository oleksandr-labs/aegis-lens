/**
 * Aggregate pipeline — THE CORE INVARIANT of this package.
 *
 * Public casualty data is AGGREGATE ONLY. This module is the single funnel
 * through which any casualty figure must pass before it can be published:
 *
 *   1. Each input record is run through the fail-closed ethics gate
 *      (`gateAggregate`). Anything carrying per-person data is DROPPED (never
 *      partially redacted, never emitted) — same posture as un-ocha PII.
 *   2. The output is re-projected onto a STRICT aggregate shape
 *      (`PublicAggregate`) that physically cannot hold a name, photo, unit,
 *      birth/death date, or exact coordinate. Even if an upstream record sneaks
 *      an extra key past the gate, this projection does not copy it.
 *   3. A take-down suppression set (if provided) removes matching figures.
 *
 * The result is the ONLY value the API route / widget may serialise publicly.
 */

import type { CasualtyAggregate, CasualtySource, CasualtySide, LocalizedText, TakedownSuppression } from "./types";
import { gateAggregate, type EthicsFinding } from "./ethics-gate";

/**
 * The strict, public-safe aggregate. Allow-list shape: only these keys exist.
 * There is intentionally NO field that could hold per-person data.
 */
export interface PublicAggregate {
  id: string;
  source: CasualtySource;
  side: CasualtySide;
  regionCode?: string;
  regionName?: LocalizedText;
  period: string;
  count: number;
  verification: "community_verified" | "source_verified" | "estimate";
  asOf: string;
}

export interface AggregateRunResult {
  aggregates: PublicAggregate[];
  /** Records dropped fail-closed by the ethics gate. */
  blockedCount: number;
  /** Findings for blocked records (for audit logs; no raw PII). */
  blockedFindings: EthicsFinding[];
  /** Records suppressed by an active take-down. */
  suppressedCount: number;
}

/**
 * Project a gate-approved record onto the strict public shape. This is an
 * explicit allow-list copy — extra keys are NOT carried over by construction.
 */
function project(r: CasualtyAggregate): PublicAggregate {
  return {
    id: r.id,
    source: r.source,
    side: r.side,
    regionCode: r.regionCode,
    regionName: r.regionName,
    period: r.period,
    count: r.count,
    verification: r.verification,
    asOf: r.asOf,
  };
}

function isSuppressed(r: CasualtyAggregate, s?: TakedownSuppression): boolean {
  if (!s) return false;
  if (s.suppressAllReferences) return true;
  return s.suppressedRegionPeriods.some(
    (rp) =>
      (rp.regionCode === undefined || rp.regionCode === r.regionCode) &&
      (rp.period === undefined || rp.period === r.period),
  );
}

/**
 * Funnel records → public aggregates. FAIL-CLOSED: any per-person signal drops
 * the whole record. Take-down suppression is applied after the gate.
 */
export function toPublicAggregates(
  records: CasualtyAggregate[],
  suppression?: TakedownSuppression,
): AggregateRunResult {
  const aggregates: PublicAggregate[] = [];
  const blockedFindings: EthicsFinding[] = [];
  let blockedCount = 0;
  let suppressedCount = 0;

  for (const rec of records) {
    const gate = gateAggregate(rec);
    if (!gate.ok || !gate.value) {
      blockedCount++;
      blockedFindings.push(...gate.findings);
      continue;
    }
    if (isSuppressed(rec, suppression)) {
      suppressedCount++;
      continue;
    }
    aggregates.push(project(gate.value));
  }

  return { aggregates, blockedCount, blockedFindings, suppressedCount };
}

/**
 * Guard for the rare per-person path (NOT used by the public surface). Throws
 * unless every record is aggregate-safe. There is no public caller; it exists so
 * that any future internal tooling fails loudly rather than leaking.
 */
export function assertAllAggregate(records: CasualtyAggregate[]): PublicAggregate[] {
  const { aggregates, blockedCount } = toPublicAggregates(records);
  if (blockedCount > 0) {
    throw new Error(`aggregate invariant violated: ${blockedCount} record(s) carried per-person data`);
  }
  return aggregates;
}
