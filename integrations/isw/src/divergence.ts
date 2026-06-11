/**
 * Cross-reference ISW control claims against DeepStateMAP (DSM) for divergence.
 *
 * ISW and DeepStateMAP are the two most-cited control-of-terrain sources and they
 * frequently disagree at the front line (different verification thresholds, update
 * cadence, and "claimed vs assessed" conventions). Surfacing those disagreements is
 * itself a trust signal — agreement = high confidence, divergence = "contested,
 * verify". This module compares the two control models and emits a divergence report.
 *
 * DSM data is NOT bundled or fetched here (separate source / separate ToS). The
 * comparator accepts an already-normalized DSM control model in our generic shape so
 * the DSM integration (or a test fixture) can feed it.
 */

import type { ControlMapSnapshot, ControlPolygon, ControlState } from "./types";
import { polygonCentroid } from "./map-ingest";

/** Minimal control claim shape both sources are reduced to for comparison. */
export interface ControlClaim {
  /** Centroid [lon, lat] of the claimed area. */
  centroid: [number, number];
  controlState: ControlState;
  areaKm2: number;
  oblastCodes: string[];
  /** Optional settlement label for human-readable divergence rows. */
  label?: string;
}

/** A normalized DSM snapshot (fed by the DSM integration / a fixture). */
export interface DsmControlModel {
  assessmentDate: string;
  claims: ControlClaim[];
  sourceUrl: string;
}

export type DivergenceKind =
  | "agree"               // both assess the same side controls the area
  | "state_divergence"    // both cover the area but assess different control
  | "isw_only"            // ISW shows a claim DSM does not (in proximity)
  | "dsm_only";           // DSM shows a claim ISW does not

export interface DivergenceRow {
  kind: DivergenceKind;
  /** Representative centroid of the disputed area. */
  centroid: [number, number];
  oblastCodes: string[];
  iswState?: ControlState;
  dsmState?: ControlState;
  label?: string;
  /** Approximate area of the disputed/agreeing patch (km^2). */
  areaKm2: number;
}

export interface DivergenceReport {
  assessmentDate: string;
  iswSourceUrl: string;
  dsmSourceUrl: string;
  rows: DivergenceRow[];
  summary: {
    agree: number;
    stateDivergence: number;
    iswOnly: number;
    dsmOnly: number;
    /** 0–1 agreement ratio across matched areas (1 = full agreement). */
    agreementRatio: number;
  };
}

/** Reduce a normalized ISW control snapshot to comparable claims. */
export function iswSnapshotToClaims(snapshot: ControlMapSnapshot): ControlClaim[] {
  const claims: ControlClaim[] = [];
  for (const p of snapshot.polygons) {
    const c = polygonCentroid(p.rings);
    if (!c) continue;
    claims.push({
      centroid: c,
      controlState: p.controlState,
      areaKm2: p.areaKm2 ?? 0,
      oblastCodes: p.oblastCodes,
      label: p.label?.en,
    });
  }
  return claims;
}

/** Coarse side classification so "ru_occupied" vs "ru_advance" still counts as agreement. */
function side(state: ControlState): "ru" | "ua" | "contested" {
  if (state === "ru_occupied" || state === "ru_advance" || state === "ru_claimed") return "ru";
  if (state === "ua_controlled" || state === "ua_counteroffensive") return "ua";
  return "contested";
}

/** Great-circle-ish distance (km) between two [lon,lat] points (equirectangular). */
function distKm(a: [number, number], b: [number, number]): number {
  const latRef = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (a[0] - b[0]) * 111.32 * Math.cos(latRef);
  const dy = (a[1] - b[1]) * 111.32;
  return Math.hypot(dx, dy);
}

export interface DivergenceOptions {
  /** Max centroid distance (km) to treat two claims as the same area. Default 25km. */
  matchRadiusKm?: number;
}

/**
 * Compare ISW vs DSM control claims and produce a divergence report.
 * Matching is by centroid proximity within `matchRadiusKm`.
 */
export function compareControl(
  isw: { claims: ControlClaim[]; sourceUrl: string; assessmentDate: string },
  dsm: DsmControlModel,
  options: DivergenceOptions = {},
): DivergenceReport {
  const radius = options.matchRadiusKm ?? 25;
  const rows: DivergenceRow[] = [];
  const usedDsm = new Set<number>();

  for (const i of isw.claims) {
    // Nearest unused DSM claim within radius.
    let bestIdx = -1;
    let bestDist = Infinity;
    dsm.claims.forEach((d, idx) => {
      if (usedDsm.has(idx)) return;
      const dist = distKm(i.centroid, d.centroid);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    if (bestIdx >= 0 && bestDist <= radius) {
      const d = dsm.claims[bestIdx];
      usedDsm.add(bestIdx);
      const agree = side(i.controlState) === side(d.controlState);
      rows.push({
        kind: agree ? "agree" : "state_divergence",
        centroid: i.centroid,
        oblastCodes: i.oblastCodes.length ? i.oblastCodes : d.oblastCodes,
        iswState: i.controlState,
        dsmState: d.controlState,
        label: i.label ?? d.label,
        areaKm2: Math.max(i.areaKm2, d.areaKm2),
      });
    } else {
      rows.push({
        kind: "isw_only",
        centroid: i.centroid,
        oblastCodes: i.oblastCodes,
        iswState: i.controlState,
        label: i.label,
        areaKm2: i.areaKm2,
      });
    }
  }

  // DSM claims with no ISW counterpart.
  dsm.claims.forEach((d, idx) => {
    if (usedDsm.has(idx)) return;
    rows.push({
      kind: "dsm_only",
      centroid: d.centroid,
      oblastCodes: d.oblastCodes,
      dsmState: d.controlState,
      label: d.label,
      areaKm2: d.areaKm2,
    });
  });

  const agree = rows.filter((r) => r.kind === "agree").length;
  const stateDivergence = rows.filter((r) => r.kind === "state_divergence").length;
  const matched = agree + stateDivergence;

  return {
    assessmentDate: isw.assessmentDate,
    iswSourceUrl: isw.sourceUrl,
    dsmSourceUrl: dsm.sourceUrl,
    rows,
    summary: {
      agree,
      stateDivergence,
      iswOnly: rows.filter((r) => r.kind === "isw_only").length,
      dsmOnly: rows.filter((r) => r.kind === "dsm_only").length,
      agreementRatio: matched > 0 ? Math.round((agree / matched) * 100) / 100 : 1,
    },
  };
}
