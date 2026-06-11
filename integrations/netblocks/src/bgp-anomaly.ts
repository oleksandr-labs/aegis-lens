/**
 * BGP anomaly detection (RIPE NCC RIS, BGPmon-style).
 *
 * Border Gateway Protocol anomalies — mass prefix withdrawals, origin-AS
 * changes (possible hijack), or route leaks — frequently precede or accompany
 * connectivity outages. RIPE NCC's RIS (Routing Information Service) and the
 * RIPEstat data API expose per-prefix routing history.
 *
 * Production sources:
 *   - https://stat.ripe.net/data/bgp-updates/data.json?resource=<prefix>
 *   - https://stat.ripe.net/data/routing-status/data.json?resource=<asn>
 *
 * This module ships a typed BGP update model + a transparent heuristic
 * classifier (the codeable contract) that scores anomalies and emits
 * NetBlocksIncident records. Editorial neutrality: a withdrawal or origin
 * change is reported as a routing anomaly, not attributed to any actor.
 */

import type { NetBlocksIncident } from "./types";

export type BgpAnomalyKind = "mass_withdrawal" | "origin_change" | "route_leak" | "as_path_anomaly";

/** Aggregated BGP routing observation for a monitored AS / country. */
export interface BgpObservation {
  /** Autonomous System under observation, e.g. 6849 (Ukrtelecom). */
  asn: number;
  asName: string;
  country: string;            // ISO 3166-1 alpha-2
  /** Prefixes the AS normally originates (baseline). */
  baselinePrefixCount: number;
  /** Prefixes currently visible as originated by the AS. */
  visiblePrefixCount: number;
  /** Count of prefixes whose origin AS changed in the window. */
  originChanges: number;
  /** Count of withdrawal updates in the window. */
  withdrawals: number;
  /** Whether an AS-path loop / leak pattern was seen. */
  pathAnomaly: boolean;
  observedAt: string;         // ISO 8601
}

export interface BgpAnomalyResult {
  asn: number;
  asName: string;
  country: string;
  kind: BgpAnomalyKind;
  /** Fraction of prefixes withdrawn vs. baseline, 0–1. */
  withdrawnFraction: number;
  /** Heuristic confidence 0–1. */
  confidence: number;
  observedAt: string;
}

export interface BgpAnomalyConfig {
  /** Withdrawn-prefix fraction to flag a mass withdrawal (default 0.3). */
  withdrawalThreshold: number;
  /** Origin changes to flag a possible hijack (default 1). */
  originChangeThreshold: number;
}

export const DEFAULT_BGP_CONFIG: BgpAnomalyConfig = {
  withdrawalThreshold: 0.3,
  originChangeThreshold: 1,
};

/**
 * Classify a single BGP observation. Returns null if nothing anomalous.
 * Precedence: mass withdrawal > origin change (hijack) > route leak > path anomaly.
 */
export function classifyBgpAnomaly(
  obs: BgpObservation,
  config: BgpAnomalyConfig = DEFAULT_BGP_CONFIG,
): BgpAnomalyResult | null {
  const withdrawnFraction =
    obs.baselinePrefixCount > 0
      ? Math.max(0, Math.min(1, 1 - obs.visiblePrefixCount / obs.baselinePrefixCount))
      : 0;

  let kind: BgpAnomalyKind | null = null;
  let confidence = 0;

  if (withdrawnFraction >= config.withdrawalThreshold) {
    kind = "mass_withdrawal";
    confidence = Math.min(1, 0.5 + withdrawnFraction / 2);
  } else if (obs.originChanges >= config.originChangeThreshold) {
    kind = "origin_change";
    confidence = Math.min(1, 0.5 + obs.originChanges * 0.1);
  } else if (obs.pathAnomaly) {
    kind = "route_leak";
    confidence = 0.55;
  } else if (obs.withdrawals > obs.baselinePrefixCount) {
    kind = "as_path_anomaly";
    confidence = 0.5;
  }

  if (!kind) return null;

  return {
    asn: obs.asn,
    asName: obs.asName,
    country: obs.country,
    kind,
    withdrawnFraction: parseFloat(withdrawnFraction.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    observedAt: obs.observedAt,
  };
}

const KIND_TEXT: Record<BgpAnomalyKind, { en: string; uk: string }> = {
  mass_withdrawal: { en: "mass prefix withdrawal", uk: "масове зняття префіксів" },
  origin_change: { en: "origin-AS change (possible hijack)", uk: "зміна origin-AS (можливий перехоплення маршруту)" },
  route_leak: { en: "route leak", uk: "витік маршруту" },
  as_path_anomaly: { en: "AS-path anomaly", uk: "аномалія AS-шляху" },
};

/** Convert BGP anomaly results into NetBlocksIncident records. */
export function bgpAnomaliesToIncidents(results: BgpAnomalyResult[]): NetBlocksIncident[] {
  return results.map((a) => {
    const txt = KIND_TEXT[a.kind];
    return {
      incidentId: `BGP-${a.asn}-${new Date(a.observedAt).getTime()}`,
      type: "bgp_anomaly",
      status: "monitoring",
      country: a.country,
      affectedNetworks: [`AS${a.asn} (${a.asName})`],
      severityFraction: a.withdrawnFraction,
      startedAt: a.observedAt,
      resolvedAt: null,
      sourceUrl: "https://stat.ripe.net",
      summary: `BGP ${txt.en} for AS${a.asn} (${a.asName}), ${Math.round(a.withdrawnFraction * 100)}% of prefixes withdrawn — confidence ${a.confidence}.`,
      summaryUk: `BGP ${txt.uk} для AS${a.asn} (${a.asName}), знято ${Math.round(a.withdrawnFraction * 100)}% префіксів — впевненість ${a.confidence}.`,
    };
  });
}

/** Demo observations for offline/dev use. */
export const DEMO_BGP_OBSERVATIONS: BgpObservation[] = [
  {
    asn: 6849,
    asName: "Ukrtelecom",
    country: "UA",
    baselinePrefixCount: 220,
    visiblePrefixCount: 130,
    originChanges: 0,
    withdrawals: 90,
    pathAnomaly: false,
    observedAt: new Date(Date.now() - 40 * 60_000).toISOString(),
  },
  {
    asn: 15895,
    asName: "Kyivstar",
    country: "UA",
    baselinePrefixCount: 180,
    visiblePrefixCount: 178,
    originChanges: 2,
    withdrawals: 4,
    pathAnomaly: false,
    observedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
];
