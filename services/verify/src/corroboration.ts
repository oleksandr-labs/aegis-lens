/**
 * Cross-source agreement scorer.
 *
 * Compares multiple normalized representations of the same real-world event
 * to produce an agreement score and disagreement report.
 *
 * "Independent" means: different primary source domains (telegram vs FIRMS vs OSM).
 * Same Telegram channel re-posting → counts once.
 */

import type { SourceVote } from "./confidence";

export interface SourceReport {
  source_id: string;
  domain: string;
  class: string;
  subclass: string | null;
  lat: number;
  lon: number;
  occurred_at: string;
  weight: number;
}

export interface AgreementResult {
  /** Overall 0-1 agreement score */
  score: number;
  /** Number of independent source domains that agree */
  agreeing_count: number;
  /** Disagreements found (non-empty → contested event) */
  disagreements: Disagreement[];
  /** Ready for Bayesian confidence update */
  votes: SourceVote[];
}

export interface Disagreement {
  field: "class" | "subclass" | "location" | "timing";
  values: string[];
  description: string;
}

/** Max distance in km for two reports to be considered co-located */
const LOCATION_TOLERANCE_KM = 10;
/** Max time difference in minutes for two reports to be considered co-timed */
const TIMING_TOLERANCE_MINUTES = 60;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Score agreement across a set of source reports about the same event.
 * Caller must pre-cluster reports by event identity (dedup step).
 */
export function scoreAgreement(reports: SourceReport[]): AgreementResult {
  if (reports.length === 0) {
    return { score: 0, agreeing_count: 0, disagreements: [], votes: [] };
  }
  if (reports.length === 1) {
    return {
      score: reports[0].weight,
      agreeing_count: 1,
      disagreements: [],
      votes: [{ weight: reports[0].weight, agrees: true }],
    };
  }

  const disagreements: Disagreement[] = [];

  // ── Class agreement ─────────────────────────────────────────────────────────
  const classValues = [...new Set(reports.map((r) => r.class))];
  if (classValues.length > 1) {
    disagreements.push({
      field: "class",
      values: classValues,
      description: `Event class disputed: ${classValues.join(" vs ")}`,
    });
  }

  // ── Subclass agreement ───────────────────────────────────────────────────────
  const subclassValues = [...new Set(reports.map((r) => r.subclass).filter(Boolean))] as string[];
  if (subclassValues.length > 1) {
    disagreements.push({
      field: "subclass",
      values: subclassValues,
      description: `Event subclass disputed: ${subclassValues.join(" vs ")}`,
    });
  }

  // ── Location agreement ───────────────────────────────────────────────────────
  const [anchor, ...rest] = reports;
  const locationOutliers = rest.filter(
    (r) => haversineKm(anchor.lat, anchor.lon, r.lat, r.lon) > LOCATION_TOLERANCE_KM,
  );
  if (locationOutliers.length > 0) {
    disagreements.push({
      field: "location",
      values: [
        `${anchor.lat.toFixed(4)},${anchor.lon.toFixed(4)}`,
        ...locationOutliers.map((r) => `${r.lat.toFixed(4)},${r.lon.toFixed(4)}`),
      ],
      description: `Location spread > ${LOCATION_TOLERANCE_KM} km`,
    });
  }

  // ── Timing agreement ─────────────────────────────────────────────────────────
  const anchorMs = Date.parse(anchor.occurred_at);
  const timingOutliers = rest.filter((r) => {
    const diffMin = Math.abs(Date.parse(r.occurred_at) - anchorMs) / 60_000;
    return diffMin > TIMING_TOLERANCE_MINUTES;
  });
  if (timingOutliers.length > 0) {
    disagreements.push({
      field: "timing",
      values: [anchor.occurred_at, ...timingOutliers.map((r) => r.occurred_at)],
      description: `Timing spread > ${TIMING_TOLERANCE_MINUTES} min`,
    });
  }

  // ── Votes for Bayesian updater ───────────────────────────────────────────────
  // A source "agrees" if it shares class + is within tolerance
  const plurality_class = classValues.reduce<string>(
    (best, cls) => {
      const count = reports.filter((r) => r.class === cls).length;
      const bestCount = reports.filter((r) => r.class === best).length;
      return count > bestCount ? cls : best;
    },
    classValues[0],
  );

  const votes: SourceVote[] = reports.map((r) => ({
    weight: r.weight,
    agrees:
      r.class === plurality_class &&
      haversineKm(anchor.lat, anchor.lon, r.lat, r.lon) <= LOCATION_TOLERANCE_KM,
  }));

  const agreeing_count = votes.filter((v) => v.agrees).length;
  const totalWeight = reports.reduce((s, r) => s + r.weight, 0);
  const agreeWeight = reports
    .filter((_, i) => votes[i].agrees)
    .reduce((s, r) => s + r.weight, 0);

  const score =
    totalWeight > 0
      ? (agreeWeight / totalWeight) * (1 - 0.1 * disagreements.length)
      : 0;

  return {
    score: Math.max(0, Math.min(1, score)),
    agreeing_count,
    disagreements,
    votes,
  };
}
