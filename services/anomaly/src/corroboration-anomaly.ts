/**
 * Cross-source corroboration scoring for anomaly detection.
 *
 * The verify service (`services/verify/src/corroboration.ts`) already scores how
 * well multiple reports AGREE about one event. This module uses corroboration
 * from the *anomaly* angle: when several INDEPENDENT sources (distinct primary
 * domains, not one channel re-posting) report the same region×class burst, that
 * is a real-signal boost; when a spike rests on a single domain it is suspect
 * and should be down-weighted (and is a candidate source-burst, see source-burst.ts).
 *
 * To avoid a hard build-time dependency we mirror the minimal `SourceReport`
 * surface from the verify package structurally (identical fields) — the same
 * lightweight-coupling approach used elsewhere between services. A verify
 * `AgreementResult` can be passed straight in.
 */

/** Structural mirror of verify's SourceReport (the fields we use). */
export interface CorroborationReport {
  source_id: string;
  /** Primary source domain (telegram channel host, firms, osm, ...). */
  domain: string;
  class: string;
  weight: number;
}

export interface CorroborationBoost {
  /** Number of distinct independent domains backing the signal. */
  independentDomains: number;
  /** Total weighted reports. */
  totalReports: number;
  /**
   * Multiplier in [0.5, 1.5] to apply to an anomaly score:
   *   1 independent domain  → 0.5–0.7 (suspect, likely single-source)
   *   2 domains             → ~1.0
   *   3+ domains            → up to 1.5 (well-corroborated, boost)
   */
  multiplier: number;
  /** True when the signal rests on a single source domain. */
  singleSourced: boolean;
  explanationEn: string;
  explanationUk: string;
}

export interface CorroborationAnomalyOptions {
  /** Domains at/above this count get the full boost ceiling. */
  fullBoostDomains?: number;
  /** Boost ceiling multiplier. */
  maxMultiplier?: number;
  /** Floor multiplier for single-domain signals. */
  minMultiplier?: number;
}

const C_DEFAULTS: Required<CorroborationAnomalyOptions> = {
  fullBoostDomains: 4,
  maxMultiplier: 1.5,
  minMultiplier: 0.5,
};

/**
 * Compute a corroboration-based multiplier for an anomaly signal.
 * Independence is measured by distinct `domain` (a channel re-posting counts once).
 */
export function scoreCorroboration(
  reports: CorroborationReport[],
  options: CorroborationAnomalyOptions = {},
): CorroborationBoost {
  const opts = { ...C_DEFAULTS, ...options };

  const domains = new Set(reports.map((r) => r.domain).filter(Boolean));
  const independentDomains = domains.size;
  const totalReports = reports.reduce((s, r) => s + (r.weight || 1), 0);

  // Linear ramp from minMultiplier (1 domain) to maxMultiplier (fullBoostDomains).
  let multiplier: number;
  if (independentDomains <= 1) {
    multiplier = opts.minMultiplier;
  } else if (independentDomains >= opts.fullBoostDomains) {
    multiplier = opts.maxMultiplier;
  } else {
    const frac = (independentDomains - 1) / (opts.fullBoostDomains - 1);
    multiplier = opts.minMultiplier + frac * (opts.maxMultiplier - opts.minMultiplier);
  }

  const singleSourced = independentDomains <= 1;
  const domainList = [...domains].join(", ") || "none";

  return {
    independentDomains,
    totalReports,
    multiplier: parseFloat(multiplier.toFixed(2)),
    singleSourced,
    explanationEn: singleSourced
      ? `Signal rests on a single source domain (${domainList}) — down-weighted pending independent corroboration.`
      : `Corroborated by ${independentDomains} independent source domains (${domainList}) — confidence boosted ×${multiplier.toFixed(2)}.`,
    explanationUk: singleSourced
      ? `Сигнал спирається на одне джерело (${domainList}) — занижено до незалежного підтвердження.`
      : `Підтверджено ${independentDomains} незалежними джерелами (${domainList}) — впевненість підвищено ×${multiplier.toFixed(2)}.`,
  };
}

/** Apply the corroboration multiplier to a raw anomaly score, clamped to [0,1]. */
export function applyCorroboration(rawScore: number, boost: CorroborationBoost): number {
  return Math.max(0, Math.min(1, rawScore * boost.multiplier));
}
