/**
 * Differential control-of-terrain polygons: diff today's ISW control map against
 * yesterday's. Produces a compact change-set (gains / losses / state changes) that
 * the product can render as a "what moved overnight" overlay on the existing control
 * layer, rather than re-drawing the whole map each day.
 *
 * Polygon geometry is matched by `sourceFeatureId` when present, otherwise by a
 * centroid-proximity heuristic. Area deltas use the planar estimate from map-ingest.
 */

import type { ControlMapSnapshot, ControlPolygon, ControlState } from "./types";
import { polygonCentroid } from "./map-ingest";

export type ControlChangeKind =
  | "added"           // polygon present today, absent yesterday
  | "removed"         // polygon present yesterday, absent today
  | "state_changed"   // same feature, different control state
  | "unchanged";

export interface ControlPolygonDiff {
  kind: ControlChangeKind;
  polygonId: string;
  sourceFeatureId?: string;
  fromState?: ControlState;
  toState?: ControlState;
  oblastCodes: string[];
  /** Signed area delta in km^2 (positive = larger today). */
  areaDeltaKm2: number;
  /** The current polygon (or, for "removed", the prior polygon). */
  polygon: ControlPolygon;
}

export interface ControlMapDiff {
  fromDate: string;
  toDate: string;
  changes: ControlPolygonDiff[];
  summary: {
    added: number;
    removed: number;
    stateChanged: number;
    unchanged: number;
    /** Net Russian-controlled area change in km^2 (positive = Russian gain). */
    netRussianGainKm2: number;
  };
}

const RUSSIAN_STATES: ReadonlySet<ControlState> = new Set<ControlState>([
  "ru_occupied",
  "ru_advance",
  "ru_claimed",
]);

function russianAreaSign(state: ControlState): number {
  if (RUSSIAN_STATES.has(state)) return 1;
  if (state === "ua_controlled" || state === "ua_counteroffensive") return -1;
  return 0;
}

/** Match key: prefer the stable ISW feature id; else a quantized centroid. */
function matchKey(p: ControlPolygon): string {
  if (p.sourceFeatureId) return `f:${p.sourceFeatureId}`;
  const c = polygonCentroid(p.rings);
  if (!c) return `id:${p.polygonId}`;
  // Quantize to ~1km so small geometry jitter still matches yesterday.
  return `c:${c[0].toFixed(2)},${c[1].toFixed(2)}:${p.controlState}`;
}

/**
 * Diff two daily control-map snapshots.
 * `prev` may be undefined (first day) — then every polygon is "added".
 */
export function diffControlMaps(
  prev: ControlMapSnapshot | undefined,
  today: ControlMapSnapshot,
): ControlMapDiff {
  const prevByKey = new Map<string, ControlPolygon>();
  for (const p of prev?.polygons ?? []) prevByKey.set(matchKey(p), p);

  const changes: ControlPolygonDiff[] = [];
  const matchedPrevKeys = new Set<string>();
  let netRussianGainKm2 = 0;

  for (const cur of today.polygons) {
    const key = matchKey(cur);
    const before = prevByKey.get(key);
    const curArea = cur.areaKm2 ?? 0;

    if (!before) {
      // Try feature-id fallback match across differing state keys.
      const byFeature = cur.sourceFeatureId
        ? [...prevByKey.values()].find((p) => p.sourceFeatureId === cur.sourceFeatureId)
        : undefined;
      if (byFeature && byFeature.controlState !== cur.controlState) {
        matchedPrevKeys.add(matchKey(byFeature));
        const delta = curArea - (byFeature.areaKm2 ?? 0);
        netRussianGainKm2 +=
          russianAreaSign(cur.controlState) * curArea - russianAreaSign(byFeature.controlState) * (byFeature.areaKm2 ?? 0);
        changes.push({
          kind: "state_changed",
          polygonId: cur.polygonId,
          sourceFeatureId: cur.sourceFeatureId,
          fromState: byFeature.controlState,
          toState: cur.controlState,
          oblastCodes: cur.oblastCodes,
          areaDeltaKm2: round2(delta),
          polygon: cur,
        });
        continue;
      }
      // Genuinely new polygon.
      netRussianGainKm2 += russianAreaSign(cur.controlState) * curArea;
      changes.push({
        kind: "added",
        polygonId: cur.polygonId,
        sourceFeatureId: cur.sourceFeatureId,
        toState: cur.controlState,
        oblastCodes: cur.oblastCodes,
        areaDeltaKm2: round2(curArea),
        polygon: cur,
      });
      continue;
    }

    matchedPrevKeys.add(key);
    const delta = curArea - (before.areaKm2 ?? 0);
    if (Math.abs(delta) < 0.5) {
      changes.push({
        kind: "unchanged",
        polygonId: cur.polygonId,
        sourceFeatureId: cur.sourceFeatureId,
        fromState: before.controlState,
        toState: cur.controlState,
        oblastCodes: cur.oblastCodes,
        areaDeltaKm2: round2(delta),
        polygon: cur,
      });
    } else {
      netRussianGainKm2 += russianAreaSign(cur.controlState) * delta;
      changes.push({
        kind: "state_changed",
        polygonId: cur.polygonId,
        sourceFeatureId: cur.sourceFeatureId,
        fromState: before.controlState,
        toState: cur.controlState,
        oblastCodes: cur.oblastCodes,
        areaDeltaKm2: round2(delta),
        polygon: cur,
      });
    }
  }

  // Anything in prev that wasn't matched → removed.
  for (const [key, before] of prevByKey) {
    if (matchedPrevKeys.has(key)) continue;
    netRussianGainKm2 -= russianAreaSign(before.controlState) * (before.areaKm2 ?? 0);
    changes.push({
      kind: "removed",
      polygonId: before.polygonId,
      sourceFeatureId: before.sourceFeatureId,
      fromState: before.controlState,
      oblastCodes: before.oblastCodes,
      areaDeltaKm2: round2(-(before.areaKm2 ?? 0)),
      polygon: before,
    });
  }

  return {
    fromDate: prev?.assessmentDate ?? "(none)",
    toDate: today.assessmentDate,
    changes,
    summary: {
      added: changes.filter((c) => c.kind === "added").length,
      removed: changes.filter((c) => c.kind === "removed").length,
      stateChanged: changes.filter((c) => c.kind === "state_changed").length,
      unchanged: changes.filter((c) => c.kind === "unchanged").length,
      netRussianGainKm2: round2(netRussianGainKm2),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
