/**
 * Cross-correlate reported grid outages with Cloudflare Radar internet-quality
 * data to estimate impact extent.
 *
 * When grid power drops, consumer internet (last-mile routers, mobile cells on
 * battery) degrades within minutes-to-hours. Cloudflare Radar publishes
 * country/region traffic + outage signals (radar.cloudflare.com). A drop in
 * normalised request volume vs. a trailing baseline is an independent proxy for
 * outage *extent*: a deeper traffic drop implies a wider area affected.
 *
 * Pure functions; Radar samples are supplied by the caller (Radar API client
 * lives elsewhere / is contracted). This module turns a traffic-drop fraction
 * into an impact-extent estimate and a confidence delta for the reported outage.
 */

import type { OblastCode } from "./types";

/** Normalised Cloudflare Radar traffic sample for a region. */
export interface RadarSample {
  regionCode: OblastCode;
  /** Current normalised request volume (0–1 of baseline). 1 = normal. */
  trafficRatio: number;
  /** Trailing-baseline confidence / data sufficiency, 0–1. */
  baselineConfidence: number;
  /** Sample timestamp (ISO 8601). */
  observedAt: string;
}

export interface RadarCorrelation {
  regionCode: OblastCode;
  /** Traffic drop vs. baseline, 0–1 (1 = total loss). */
  trafficDrop: number;
  /** Estimated impact extent (fraction of region affected), 0–1. */
  estimatedExtent: number;
  /** Confidence in the extent estimate, 0–1. */
  confidence: number;
  /** Adjustment to apply to the reported-outage coverage, −0.2..+0.2. */
  coverageDelta: number;
  noteEn: string;
  noteUk: string;
  noteRu: string;
}

/**
 * Map a normalised traffic ratio to an outage impact extent.
 * Internet does not fail 1:1 with power (battery/UPS buffer), so we apply a
 * gentle concave mapping: a 60% traffic drop ≈ ~50% extent.
 */
export function trafficDropToExtent(trafficDrop: number): number {
  const d = Math.max(0, Math.min(1, trafficDrop));
  // Concave: extent = d^1.2 keeps small drops modest, large drops near-linear.
  return parseFloat(Math.pow(d, 1.2).toFixed(2));
}

export interface RadarCorrelationOptions {
  /** Traffic drop below which we treat as noise (default 0.15). */
  noiseFloor?: number;
  /** Reported coverage from the operator, if any (for the delta). */
  reportedCoverage?: number;
}

/** Correlate one region's Radar sample with the reported outage. */
export function correlateRadar(
  sample: RadarSample,
  opts: RadarCorrelationOptions = {},
): RadarCorrelation {
  const noiseFloor = opts.noiseFloor ?? 0.15;
  const trafficDrop = Math.max(0, Math.min(1, 1 - sample.trafficRatio));
  const extent = trafficDropToExtent(trafficDrop);
  const confidence = parseFloat(
    Math.min(1, sample.baselineConfidence * (trafficDrop >= noiseFloor ? 0.9 : 0.4)).toFixed(2),
  );

  // Coverage delta nudges the fused coverage toward the Radar-implied extent.
  let coverageDelta = 0;
  if (trafficDrop >= noiseFloor && opts.reportedCoverage != null) {
    coverageDelta = parseFloat(Math.max(-0.2, Math.min(0.2, (extent - opts.reportedCoverage) * 0.5)).toFixed(2));
  }

  const significant = trafficDrop >= noiseFloor;
  return {
    regionCode: sample.regionCode,
    trafficDrop: parseFloat(trafficDrop.toFixed(2)),
    estimatedExtent: extent,
    confidence,
    coverageDelta,
    noteEn: significant
      ? `Cloudflare Radar shows a ${Math.round(trafficDrop * 100)}% traffic drop — impact extent ≈ ${Math.round(extent * 100)}%.`
      : "Cloudflare Radar traffic near baseline — no significant outage extent.",
    noteUk: significant
      ? `Cloudflare Radar фіксує падіння трафіку на ${Math.round(trafficDrop * 100)}% — обсяг впливу ≈ ${Math.round(extent * 100)}%.`
      : "Трафік Cloudflare Radar близький до базового — істотного впливу немає.",
    noteRu: significant
      ? `Cloudflare Radar фиксирует падение трафика на ${Math.round(trafficDrop * 100)}% — масштаб воздействия ≈ ${Math.round(extent * 100)}%.`
      : "Трафик Cloudflare Radar близок к базовому — существенного воздействия нет.",
  };
}

/** Correlate a batch of Radar samples. */
export function correlateRadarAll(
  samples: RadarSample[],
  reportedByRegion: Record<OblastCode, number> = {},
): RadarCorrelation[] {
  return samples.map((s) =>
    correlateRadar(s, { reportedCoverage: reportedByRegion[s.regionCode] }),
  );
}
