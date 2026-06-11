/**
 * Daily snapshot ingestion + diff vs previous (TODO task:
 * "Daily snapshot ingestion + diff vs previous").
 *
 * Compares two normalized FrontlineSnapshots and emits a structured diff:
 *   - added / removed polygons,
 *   - status flips (e.g. contested → liberated),
 *   - boundary shifts (geometry changed, area delta),
 *   - net km^2 that moved toward each side.
 *
 * Matching is by polygon id when stable; when ids are not stable across snapshots
 * (DeepState ids can churn), callers may pre-key by a derived label. Here we match on
 * id, treating unmatched ids as added/removed — a conservative, explainable default.
 */

import type {
  ControlPolygon,
  FrontlineSnapshot,
  PolygonChange,
  SnapshotDiff,
} from "./types";
import { polygonAreaKm2 } from "./polygons";

function index(polys: ControlPolygon[]): Map<string, ControlPolygon> {
  return new Map(polys.map((p) => [p.id, p]));
}

/** Cheap geometry-change signal: vertex count or first-vertex shift. */
function geometryChanged(a: ControlPolygon, b: ControlPolygon): boolean {
  return JSON.stringify(a.geometry) !== JSON.stringify(b.geometry);
}

export function diffSnapshots(
  prev: FrontlineSnapshot,
  next: FrontlineSnapshot,
): SnapshotDiff {
  const prevIdx = index(prev.polygons);
  const nextIdx = index(next.polygons);
  const changes: PolygonChange[] = [];
  let towardRu = 0;
  let towardUa = 0;
  let contestedDelta = 0;

  // Added + changed
  for (const [id, np] of nextIdx) {
    const pp = prevIdx.get(id);
    if (!pp) {
      const area = polygonAreaKm2(np);
      changes.push({ type: "added", polygonId: id, newStatus: np.status, areaDeltaKm2: area, label: np.label });
      if (np.status === "controlled") towardRu += area;
      else if (np.status === "liberated") towardUa += area;
      else contestedDelta += area;
      continue;
    }
    if (pp.status !== np.status) {
      const area = polygonAreaKm2(np);
      changes.push({
        type: "status_changed",
        polygonId: id,
        previousStatus: pp.status,
        newStatus: np.status,
        areaDeltaKm2: area,
        label: np.label ?? pp.label,
      });
      if (np.status === "controlled") towardRu += area;
      else if (np.status === "liberated") towardUa += area;
      else contestedDelta += area;
    } else if (geometryChanged(pp, np)) {
      const delta = polygonAreaKm2(np) - polygonAreaKm2(pp);
      changes.push({
        type: "geometry_changed",
        polygonId: id,
        previousStatus: pp.status,
        newStatus: np.status,
        areaDeltaKm2: delta,
        label: np.label ?? pp.label,
      });
      if (np.status === "controlled") towardRu += Math.max(0, delta);
      else if (np.status === "liberated") towardUa += Math.max(0, delta);
    }
  }

  // Removed
  for (const [id, pp] of prevIdx) {
    if (!nextIdx.has(id)) {
      const area = polygonAreaKm2(pp);
      changes.push({ type: "removed", polygonId: id, previousStatus: pp.status, areaDeltaKm2: area, label: pp.label });
      // A removed `controlled` polygon implies ground no longer occupied → toward UA.
      if (pp.status === "controlled") towardUa += area;
    }
  }

  return {
    fromDate: prev.date,
    toDate: next.date,
    changes,
    netKm2: {
      towardRu: round(towardRu),
      towardUa: round(towardUa),
      contested: round(contestedDelta),
    },
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
