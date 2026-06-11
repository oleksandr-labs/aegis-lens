/**
 * No actionable point predictions — directional only.
 *
 * AI forecasts must NEVER produce a coordinate/timestamp an operator could act
 * on as if it were targeting. This guard strips precise lat/lon/time from raw
 * model output and downgrades it to region + direction + horizon-bucket
 * granularity. It is the enforcement boundary between the model and any API
 * response or map layer.
 *
 * Rule of thumb: the layer answers "where is risk elevated and trending which
 * way", never "strike will hit X at time T".
 */

export type CardinalDirection =
  | "rising"
  | "falling"
  | "stable"
  | "spreading_north"
  | "spreading_south"
  | "spreading_east"
  | "spreading_west";

export type HorizonBucket = "next_24h" | "next_7d";

/** Raw, too-precise model output that must NOT leave the service as-is. */
export interface RawPointPrediction {
  /** Precise coordinates the model emitted (forbidden in output). */
  lat: number;
  lon: number;
  /** Precise timestamp the model emitted (forbidden in output). */
  predictedAt?: string;
  /** Model probability 0–1. */
  probability: number;
  /** ISO 3166-2 oblast code the point falls in. */
  regionCode: string;
  regionName: string;
  /** Optional trend hint from the model. */
  trend?: CardinalDirection;
}

/** Safe, directional-only prediction permitted to reach the UI. */
export interface DirectionalPrediction {
  regionCode: string;
  regionName: string;
  /** Coarse oblast centroid only — NOT a target coordinate. */
  centroidLat: number;
  centroidLon: number;
  /** Probability rounded to a coarse band, never an exact point figure. */
  probabilityBand: "low" | "elevated" | "high" | "severe";
  /** Direction of travel of the risk, not a vector to a target. */
  direction: CardinalDirection;
  horizonBucket: HorizonBucket;
  isPrediction: true;
  /** Audit trail of what the policy removed. */
  redacted: Array<"exact_lat" | "exact_lon" | "exact_time" | "exact_probability">;
  disclaimerEn: string;
  disclaimerUk: string;
}

const DISCLAIMER_EN =
  "AI forecast — directional only. This is NOT a target coordinate or strike time. Do not use for tactical decisions.";
const DISCLAIMER_UK =
  "AI-прогноз — лише напрямок. Це НЕ цільові координати чи час удару. Не використовувати для тактичних рішень.";

/** Oblast centroids — the only coordinates ever exposed (coarse, public). */
const OBLAST_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  "UA-63": { lat: 49.99, lon: 36.23 },
  "UA-30": { lat: 50.45, lon: 30.52 },
  "UA-14": { lat: 48.0, lon: 37.8 },
  "UA-23": { lat: 47.84, lon: 35.14 },
  "UA-65": { lat: 46.65, lon: 32.61 },
  "UA-48": { lat: 46.97, lon: 31.99 },
  "UA-51": { lat: 46.48, lon: 30.73 },
  "UA-46": { lat: 49.84, lon: 24.02 },
  "UA-12": { lat: 48.46, lon: 35.04 },
  "UA-59": { lat: 50.91, lon: 34.8 },
  "UA-09": { lat: 48.57, lon: 39.3 },
};

function toProbabilityBand(p: number): DirectionalPrediction["probabilityBand"] {
  if (p >= 0.75) return "severe";
  if (p >= 0.5) return "high";
  if (p >= 0.25) return "elevated";
  return "low";
}

/**
 * Enforcement function: reject the precise point prediction and round it down to
 * region + direction + horizon-bucket granularity. Throws if the region is
 * unknown, because emitting a raw point through a fallback would defeat the
 * whole guard.
 */
export function enforceDirectionalOnly(
  raw: RawPointPrediction,
  horizonBucket: HorizonBucket,
): DirectionalPrediction {
  const centroid = OBLAST_CENTROIDS[raw.regionCode];
  if (!centroid) {
    throw new Error(
      `[prediction-policy] unknown regionCode "${raw.regionCode}" — refusing to emit point prediction`,
    );
  }

  const redacted: DirectionalPrediction["redacted"] = ["exact_lat", "exact_lon", "exact_probability"];
  if (raw.predictedAt) redacted.push("exact_time");

  return {
    regionCode: raw.regionCode,
    regionName: raw.regionName,
    centroidLat: centroid.lat,
    centroidLon: centroid.lon,
    probabilityBand: toProbabilityBand(raw.probability),
    direction: raw.trend ?? "stable",
    horizonBucket,
    isPrediction: true,
    redacted,
    disclaimerEn: DISCLAIMER_EN,
    disclaimerUk: DISCLAIMER_UK,
  };
}

/**
 * Validate that an already-built output object contains no actionable point
 * data. Use as a defensive assertion before serializing a response. Returns the
 * list of violations (empty = safe).
 */
export function findActionableViolations(output: Record<string, unknown>): string[] {
  const violations: string[] = [];
  // Coordinate precision finer than oblast centroid (≈2 decimal places) is a leak.
  for (const k of ["lat", "lon", "predictedLat", "predictedLon", "impactLat", "impactLon"]) {
    const v = output[k];
    if (typeof v === "number") {
      const decimals = (String(v).split(".")[1] ?? "").length;
      if (decimals > 2) violations.push(`${k} has ${decimals} decimals (max 2 — oblast centroid only)`);
    }
  }
  for (const k of ["predictedAt", "strikeTime", "impactTime", "etaSeconds"]) {
    if (output[k] !== undefined && output[k] !== null) {
      violations.push(`${k} present — point-in-time predictions are forbidden`);
    }
  }
  return violations;
}
