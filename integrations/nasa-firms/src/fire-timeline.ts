/**
 * Per-fire timeline view.
 *
 * Clusters individual FIRMS detections (which arrive as independent points across
 * many overpasses) into "fire entities", each with a start, a peak, a duration,
 * and an FRP time-series. Clustering is spatial-temporal single-linkage: a
 * detection joins an existing fire if it is within `linkRadiusKm` of any of that
 * fire's detections AND within `linkGapHours` of its latest detection.
 *
 * This powers a per-fire timeline UI without any backend ML — it is deterministic
 * aggregation over the existing normalized detection stream.
 */

import type { FIRMSFirePointNormalized } from "./client";

export interface FireTimelinePoint {
  acquired_at: string;
  frp_mw: number;
  confidence: number;
  latitude: number;
  longitude: number;
}

export interface FireEntity {
  fireId: string;
  /** Centroid of all detections. */
  latitude: number;
  longitude: number;
  /** ISO-8601 UTC of first and last detection. */
  startedAt: string;
  lastSeenAt: string;
  /** Detection with the highest FRP. */
  peakAt: string;
  peakFrpMw: number;
  /** Hours between first and last detection. */
  durationHours: number;
  detectionCount: number;
  /** Chronologically ordered detections for charting. */
  timeline: FireTimelinePoint[];
}

export interface FireTimelineOptions {
  /** Spatial link radius in km. Default 3. */
  linkRadiusKm: number;
  /** Temporal link gap in hours. Default 36 (covers multi-pass gaps). */
  linkGapHours: number;
}

export const DEFAULT_FIRE_TIMELINE_OPTIONS: FireTimelineOptions = {
  linkRadiusKm: 3,
  linkGapHours: 36,
};

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface Cluster {
  points: FIRMSFirePointNormalized[];
  lastMs: number;
}

/**
 * Build fire entities from a batch of detections (any time order accepted —
 * sorted internally).
 */
export function buildFireTimelines(
  detections: FIRMSFirePointNormalized[],
  options: FireTimelineOptions = DEFAULT_FIRE_TIMELINE_OPTIONS,
): FireEntity[] {
  const sorted = [...detections].sort(
    (a, b) => new Date(a.acquired_at).getTime() - new Date(b.acquired_at).getTime(),
  );

  const clusters: Cluster[] = [];
  for (const d of sorted) {
    const dMs = new Date(d.acquired_at).getTime();
    let target: Cluster | undefined;
    for (const c of clusters) {
      if ((dMs - c.lastMs) / 3_600_000 > options.linkGapHours) continue;
      const near = c.points.some(
        (p) => haversineKm(d.latitude, d.longitude, p.latitude, p.longitude) <= options.linkRadiusKm,
      );
      if (near) {
        target = c;
        break;
      }
    }
    if (!target) {
      target = { points: [], lastMs: dMs };
      clusters.push(target);
    }
    target.points.push(d);
    target.lastMs = Math.max(target.lastMs, dMs);
  }

  return clusters.map((c, idx): FireEntity => {
    const pts = c.points;
    const lat = pts.reduce((s, p) => s + p.latitude, 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p.longitude, 0) / pts.length;
    let peak = pts[0];
    for (const p of pts) if (p.frp_mw > peak.frp_mw) peak = p;
    const startedAt = pts[0].acquired_at;
    const lastSeenAt = pts[pts.length - 1].acquired_at;
    const durationHours =
      (new Date(lastSeenAt).getTime() - new Date(startedAt).getTime()) / 3_600_000;
    return {
      fireId: `fire_${idx}_${startedAt}`,
      latitude: lat,
      longitude: lng,
      startedAt,
      lastSeenAt,
      peakAt: peak.acquired_at,
      peakFrpMw: peak.frp_mw,
      durationHours,
      detectionCount: pts.length,
      timeline: pts.map((p) => ({
        acquired_at: p.acquired_at,
        frp_mw: p.frp_mw,
        confidence: p.confidence,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    };
  });
}
