/**
 * Per-region communications severity index.
 *
 * Aggregates heterogeneous comms-outage incidents (NetBlocks, Cloudflare Radar,
 * RIPE Atlas, operator status pages, BGP, submarine cables) into a single 0–100
 * severity index per Ukrainian region, with a 1–5 band and a bilingual label.
 *
 * The index is a transparent weighted sum (the codeable contract): each incident
 * type carries a trust/impact weight; the per-region score saturates so a single
 * critical incident already pushes the region into a high band, while multiple
 * corroborating incidents raise confidence.
 *
 * Editorial neutrality: the index measures DISRUPTION, never intent or cause.
 */

import type { NetBlocksIncident, NetBlocksIncidentType } from "./types";

/** Impact weight per incident type (higher = more user-facing disruption). */
const TYPE_WEIGHT: Record<NetBlocksIncidentType, number> = {
  internet_outage: 1.0,
  submarine_cable: 0.9,
  throttling: 0.5,
  bgp_anomaly: 0.6,
  social_media_block: 0.4,
  vpn_block: 0.3,
};

/** Status multiplier — resolved incidents contribute little. */
const STATUS_MULTIPLIER: Record<NetBlocksIncident["status"], number> = {
  ongoing: 1.0,
  monitoring: 0.6,
  resolved: 0.15,
};

export interface RegionSeverity {
  /** ISO 3166-2:UA oblast code, or "UA" for nationwide. */
  regionCode: string;
  /** Severity index 0–100. */
  index: number;
  /** Banded severity 1–5. */
  band: 1 | 2 | 3 | 4 | 5;
  /** Bilingual band label. */
  label: { en: string; uk: string };
  /** Number of incidents contributing. */
  incidentCount: number;
  /** Dominant incident type by weighted contribution. */
  dominantType: NetBlocksIncidentType;
}

/**
 * Map an incident to the region(s) it affects. NetBlocksIncident is
 * country-scoped; callers that have oblast-level detail can pass a resolver to
 * spread an incident across specific oblasts. By default UA incidents map to
 * the nationwide "UA" bucket.
 */
export type RegionResolver = (incident: NetBlocksIncident) => string[];

const defaultResolver: RegionResolver = (i) => [i.country];

function indexToBand(index: number): 1 | 2 | 3 | 4 | 5 {
  if (index >= 80) return 5;
  if (index >= 60) return 4;
  if (index >= 40) return 3;
  if (index >= 20) return 2;
  return 1;
}

const BAND_LABELS: Record<number, { en: string; uk: string }> = {
  1: { en: "Minimal", uk: "Мінімальний" },
  2: { en: "Low", uk: "Низький" },
  3: { en: "Moderate", uk: "Помірний" },
  4: { en: "High", uk: "Високий" },
  5: { en: "Severe", uk: "Критичний" },
};

/**
 * Compute a per-region severity index from a set of incidents.
 *
 * Score model: each incident contributes
 *   typeWeight × statusMultiplier × severityFraction × 100.
 * Per region the contributions are combined with a saturating sum
 *   index = 100 · (1 − ∏(1 − cᵢ/100))
 * so the score is monotone, bounded at 100, and rewards corroboration without
 * unbounded stacking.
 */
export function computeSeverityIndex(
  incidents: NetBlocksIncident[],
  resolveRegions: RegionResolver = defaultResolver,
): RegionSeverity[] {
  interface Acc {
    survival: number; // ∏(1 − cᵢ/100)
    count: number;
    typeScore: Map<NetBlocksIncidentType, number>;
  }
  const byRegion = new Map<string, Acc>();

  for (const inc of incidents) {
    const contribution =
      TYPE_WEIGHT[inc.type] *
      STATUS_MULTIPLIER[inc.status] *
      Math.max(0, Math.min(1, inc.severityFraction)) *
      100;
    if (contribution <= 0) continue;

    for (const region of resolveRegions(inc)) {
      const acc = byRegion.get(region) ?? { survival: 1, count: 0, typeScore: new Map() };
      acc.survival *= 1 - contribution / 100;
      acc.count += 1;
      acc.typeScore.set(inc.type, (acc.typeScore.get(inc.type) ?? 0) + contribution);
      byRegion.set(region, acc);
    }
  }

  const out: RegionSeverity[] = [];
  for (const [regionCode, acc] of byRegion) {
    const index = Math.round(100 * (1 - acc.survival));
    const band = indexToBand(index);
    const dominantType = [...acc.typeScore.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "internet_outage";
    out.push({
      regionCode,
      index,
      band,
      label: BAND_LABELS[band],
      incidentCount: acc.count,
      dominantType,
    });
  }

  return out.sort((a, b) => b.index - a.index);
}
