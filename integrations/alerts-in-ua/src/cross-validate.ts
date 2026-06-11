/**
 * Cross-validation across sources (task 4): multi-source quorum.
 *
 * We have up to three independent sources observing the same oblast:
 *   - alerts.in.ua API (primary, authoritative when healthy)
 *   - @air_alert_ua Telegram bot (national fallback)
 *   - OVA regional Telegram channel (regional fallback)
 *
 * For each (oblastCode, alertType) we reconcile their `active` vs `cleared`
 * votes into a single decided status, with a confidence score the adapter can
 * forward to the canonical Event schema.
 *
 * CIVILIAN-SAFETY BIAS: this is a life-safety feed. We bias toward RAISING
 * (fail-safe): a single trustworthy source asserting "active" beats a quorum of
 * "cleared". An all-clear is only decided when NO source still reports active
 * AND at least one source positively reports the clear (no silent timeouts).
 */

import type { AlertRecord, AlertSource, AlertStatus, OblastCode, AlertType } from "./types";

/** Trust weight per source (primary > national bot > regional channel). */
export const SOURCE_WEIGHT: Record<AlertSource, number> = {
  alerts_in_ua_api: 1.0,
  air_alert_ua_bot: 0.8,
  ova_telegram: 0.7,
  demo: 0.5,
};

export interface QuorumResult {
  oblastCode: OblastCode;
  type: AlertType;
  /** Decided status after applying the fail-safe quorum rules. */
  status: AlertStatus;
  /** 0–1 agreement-weighted confidence in the decided status. */
  confidence: number;
  /** Sources that contributed (with their raw status). */
  votes: Array<{ source: AlertSource; status: AlertStatus; weight: number }>;
  /** Earliest startedAt among active votes. */
  startedAt?: string;
  /** True when sources disagreed (active vs cleared). */
  conflict: boolean;
}

function key(o: OblastCode, t: AlertType): string {
  return `${o}:${t}`;
}

/**
 * Reconcile a flat list of per-source AlertRecords into one QuorumResult per
 * (oblast, type). Records not present from a source are treated as "no vote"
 * (NOT an implicit clear — silence never clears an alert).
 */
export function crossValidate(records: AlertRecord[]): QuorumResult[] {
  const groups = new Map<string, AlertRecord[]>();
  for (const r of records) {
    const k = key(r.location.oblastCode, r.type);
    const arr = groups.get(k) ?? [];
    arr.push(r);
    groups.set(k, arr);
  }

  const results: QuorumResult[] = [];

  for (const [, recs] of groups) {
    // Keep only the latest record per source (dedupe re-polls).
    const latestBySource = new Map<AlertSource, AlertRecord>();
    for (const r of recs) {
      const prev = latestBySource.get(r.source);
      if (!prev || Date.parse(r.observedAt) > Date.parse(prev.observedAt)) {
        latestBySource.set(r.source, r);
      }
    }
    const votes = Array.from(latestBySource.values());

    let activeWeight = 0;
    let clearWeight = 0;
    let earliestActive: number | undefined;
    const voteRows: QuorumResult["votes"] = [];

    for (const v of votes) {
      const w = SOURCE_WEIGHT[v.source] ?? 0.5;
      voteRows.push({ source: v.source, status: v.status, weight: w });
      if (v.status === "active") {
        activeWeight += w;
        const ms = Date.parse(v.startedAt);
        if (!Number.isNaN(ms)) earliestActive = Math.min(earliestActive ?? ms, ms);
      } else {
        clearWeight += w;
      }
    }

    const anyActive = activeWeight > 0;
    const anyClear = clearWeight > 0;
    const conflict = anyActive && anyClear;

    // Fail-safe: ANY active vote ⇒ decided active.
    const status: AlertStatus = anyActive ? "active" : "all_clear";

    const total = activeWeight + clearWeight || 1;
    // Confidence = weight share agreeing with the decided status.
    const agree = status === "active" ? activeWeight : clearWeight;
    const confidence = Math.min(1, agree / total);

    results.push({
      oblastCode: recs[0].location.oblastCode,
      type: recs[0].type,
      status,
      confidence: Number(confidence.toFixed(2)),
      votes: voteRows,
      startedAt: earliestActive ? new Date(earliestActive).toISOString() : undefined,
      conflict,
    });
  }

  return results;
}
