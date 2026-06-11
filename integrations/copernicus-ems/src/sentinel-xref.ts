/**
 * Task 6 — Cross-reference EMS outputs with our Sentinel-derived layers.
 *
 * Both EMS and our own `@ua-map/sentinel-hub` change-detection pipeline produce
 * geometry over the same disasters (EMS uses Copernicus Sentinel-1/2 as its own
 * input). This module correlates an EMS activation's AOI with our Sentinel
 * change-detected features to:
 *   - CORROBORATE (independent confirmation raises confidence), or
 *   - flag a DISCREPANCY (EMS extent vs our detected change diverge).
 *
 * It is geometry-only and dependency-free: the Sentinel side is passed in as a
 * minimal `SentinelChange` shape (mirrors sentinel-hub `ChangedFeature` /
 * `ChangedPixelResult`) so we avoid a cross-package build edge.
 */

import type { ActivationAOI, BBox } from "./types";

/** Minimal mirror of sentinel-hub's changed feature (no import coupling). */
export interface SentinelChange {
  /** Centroid [lon, lat]. */
  centroid: [number, number];
  areaM2: number;
  /** 0–1 confidence the change is real. */
  confidence: number;
}

/** A sentinel change-detection result over a bbox (mirror of ChangedPixelResult). */
export interface SentinelChangeResult {
  bbox: BBox;
  changedFraction: number | null;
  features: SentinelChange[];
}

export type XrefVerdict = "corroborated" | "partial" | "no_sentinel_coverage" | "discrepancy";

export interface XrefResult {
  activationCode: string;
  aoiId: string;
  verdict: XrefVerdict;
  /** EMS AOI ↔ sentinel bbox overlap fraction (0–1, of the AOI). */
  bboxOverlap: number;
  /** Number of sentinel changes whose centroid falls inside the AOI bbox. */
  sentinelHits: number;
  /** Confidence delta we recommend applying to the EMS-derived event. */
  confidenceBoost: number;
  note: { en: string; uk: string };
}

/** Intersection-over-AOI of two bboxes (fraction of the AOI covered). */
export function bboxOverlapFraction(aoi: BBox, other: BBox): number {
  const w = Math.max(aoi.west, other.west);
  const s = Math.max(aoi.south, other.south);
  const e = Math.min(aoi.east, other.east);
  const n = Math.min(aoi.north, other.north);
  if (e <= w || n <= s) return 0;
  const interArea = (e - w) * (n - s);
  const aoiArea = (aoi.east - aoi.west) * (aoi.north - aoi.south);
  if (aoiArea <= 0) return 0;
  return Math.min(1, interArea / aoiArea);
}

function pointInBBox(p: [number, number], b: BBox): boolean {
  return p[0] >= b.west && p[0] <= b.east && p[1] >= b.south && p[1] <= b.north;
}

/**
 * Cross-reference one EMS AOI against a Sentinel change-detection result.
 *
 * Verdicts:
 *   - corroborated: good bbox overlap AND sentinel detected change inside AOI.
 *   - partial: overlap but weak/low-confidence sentinel signal.
 *   - discrepancy: EMS reports an event but sentinel found essentially no change
 *     in the overlapping area (possible cloud cover, or one side is wrong).
 *   - no_sentinel_coverage: bboxes don't overlap → cannot cross-reference.
 */
export function crossReference(
  aoi: ActivationAOI,
  sentinel: SentinelChangeResult,
  opts: { minConfidence?: number } = {},
): XrefResult {
  const minConf = opts.minConfidence ?? 0.5;
  const overlap = bboxOverlapFraction(aoi.bbox, sentinel.bbox);
  const hits = sentinel.features.filter(
    (f) => pointInBBox(f.centroid, aoi.bbox) && f.confidence >= minConf,
  );
  const sentinelHits = hits.length;
  const changed = sentinel.changedFraction ?? 0;

  let verdict: XrefVerdict;
  let confidenceBoost: number;
  if (overlap <= 0) {
    verdict = "no_sentinel_coverage";
    confidenceBoost = 0;
  } else if (sentinelHits > 0 && changed >= 0.02) {
    verdict = "corroborated";
    confidenceBoost = 0.1;
  } else if (overlap > 0 && (sentinelHits > 0 || changed > 0)) {
    verdict = "partial";
    confidenceBoost = 0.03;
  } else {
    verdict = "discrepancy";
    confidenceBoost = -0.05;
  }

  const NOTES: Record<XrefVerdict, { en: string; uk: string }> = {
    corroborated: {
      en: "EMS extent corroborated by independent Sentinel change detection.",
      uk: "Зону EMS підтверджено незалежним виявленням змін Sentinel.",
    },
    partial: {
      en: "Partial agreement between EMS extent and Sentinel change detection.",
      uk: "Часткова відповідність між зоною EMS та виявленням змін Sentinel.",
    },
    no_sentinel_coverage: {
      en: "No overlapping Sentinel change-detection coverage for this AOI.",
      uk: "Немає перекриття зі змінами Sentinel для цієї зони.",
    },
    discrepancy: {
      en: "Discrepancy: EMS reports an event but Sentinel found little change (check cloud cover).",
      uk: "Розбіжність: EMS повідомляє про подію, але Sentinel майже не виявив змін (перевірте хмарність).",
    },
  };

  return {
    activationCode: aoi.activationCode,
    aoiId: aoi.aoiId,
    verdict,
    bboxOverlap: Math.round(overlap * 100) / 100,
    sentinelHits,
    confidenceBoost,
    note: NOTES[verdict],
  };
}

/** Cross-reference every AOI of an activation against a set of Sentinel results. */
export function crossReferenceAll(
  aois: ActivationAOI[],
  sentinelResults: SentinelChangeResult[],
  opts: { minConfidence?: number } = {},
): XrefResult[] {
  const out: XrefResult[] = [];
  for (const aoi of aois) {
    // Pick the best-overlapping sentinel result for this AOI.
    let best: SentinelChangeResult | undefined;
    let bestOverlap = 0;
    for (const s of sentinelResults) {
      const ov = bboxOverlapFraction(aoi.bbox, s.bbox);
      if (ov > bestOverlap) {
        bestOverlap = ov;
        best = s;
      }
    }
    if (!best) {
      out.push({
        activationCode: aoi.activationCode,
        aoiId: aoi.aoiId,
        verdict: "no_sentinel_coverage",
        bboxOverlap: 0,
        sentinelHits: 0,
        confidenceBoost: 0,
        note: {
          en: "No Sentinel change-detection result available for this AOI.",
          uk: "Немає результату виявлення змін Sentinel для цієї зони.",
        },
      });
      continue;
    }
    out.push(crossReference(aoi, best, opts));
  }
  return out;
}
