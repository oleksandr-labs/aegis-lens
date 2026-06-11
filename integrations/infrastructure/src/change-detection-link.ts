/**
 * Sentinel change-detection cross-reference.
 *
 * Satellite change-detection (Sentinel-1 SAR coherence loss / Sentinel-2 optical
 * delta) produces "change tiles": small bounding boxes flagged as changed between
 * two acquisition dates. We cross-reference damage events against those tiles to
 * (a) corroborate a reported strike with an independent satellite signal and
 * (b) attach a `changeDetectionConfidence` to the event.
 *
 * This is a codeable contract: the actual tiles come from Sentinel Hub / an external
 * CD pipeline. Here we implement the deterministic spatio-temporal matching logic.
 */

import { InfrastructureDamageEvent } from "./types";

/** A change-detection tile from the satellite pipeline. */
export interface ChangeDetectionTile {
  tileId: string;
  /** Bounding box [west, south, east, north] in WGS84. */
  bbox: [number, number, number, number];
  /** Acquisition window of the "after" image. */
  observedFrom: string; // ISO-8601
  observedTo: string;   // ISO-8601
  /** Pipeline-reported change strength, 0–1. */
  changeScore: number;
  /** Which sensor flagged it. */
  sensor: "sentinel1_sar" | "sentinel2_optical";
}

export interface ChangeDetectionMatch {
  eventId: string;
  tileId: string;
  /** Combined confidence the event corresponds to this satellite-observed change. */
  confidence: number;
  /** Hours between event time and the tile's mid-acquisition time. */
  timeDeltaHours: number;
  sensor: ChangeDetectionTile["sensor"];
}

function pointInBbox(lat: number, lon: number, bbox: [number, number, number, number]): boolean {
  const [w, s, e, n] = bbox;
  return lon >= w && lon <= e && lat >= s && lat <= n;
}

function midTimeMs(tile: ChangeDetectionTile): number {
  return (new Date(tile.observedFrom).getTime() + new Date(tile.observedTo).getTime()) / 2;
}

export interface ChangeDetectionLinkOptions {
  /** Max hours between event and tile acquisition to still count as a match. */
  maxTimeDeltaHours?: number;
  /** Minimum tile changeScore to consider. */
  minChangeScore?: number;
}

/**
 * Find the best change-detection tile for a single event (point-in-bbox + temporal
 * proximity). Returns undefined when no tile satisfies the constraints.
 *
 * The "after" acquisition must be at or after the event time (a strike cannot be
 * seen by a satellite that flew over before it happened) — we allow a small −2h
 * slack for clock/timezone noise.
 */
export function matchEventToTiles(
  event: InfrastructureDamageEvent,
  tiles: ChangeDetectionTile[],
  opts: ChangeDetectionLinkOptions = {},
): ChangeDetectionMatch | undefined {
  if (event.lat === undefined || event.lon === undefined) return undefined;
  const maxDelta = opts.maxTimeDeltaHours ?? 72;
  const minScore = opts.minChangeScore ?? 0.3;
  const eventMs = new Date(event.occurredAt).getTime();

  let best: ChangeDetectionMatch | undefined;
  for (const tile of tiles) {
    if (tile.changeScore < minScore) continue;
    if (!pointInBbox(event.lat, event.lon, tile.bbox)) continue;

    const afterMs = new Date(tile.observedTo).getTime();
    if (afterMs < eventMs - 2 * 3600_000) continue; // tile predates the event

    const deltaH = Math.abs(midTimeMs(tile) - eventMs) / 3600_000;
    if (deltaH > maxDelta) continue;

    // Confidence: tile strength, decayed by temporal distance.
    const temporalFactor = Math.max(0, 1 - deltaH / maxDelta);
    const confidence = Number((tile.changeScore * (0.5 + 0.5 * temporalFactor)).toFixed(3));

    if (!best || confidence > best.confidence) {
      best = { eventId: event.eventId, tileId: tile.tileId, confidence, timeDeltaHours: Number(deltaH.toFixed(1)), sensor: tile.sensor };
    }
  }
  return best;
}

/**
 * Annotate events with their best change-detection match. Returns NEW event objects
 * with `changeDetectionConfidence` populated; events without a match are returned
 * unchanged. Also returns the match list for auditing.
 */
export function linkChangeDetection(
  events: InfrastructureDamageEvent[],
  tiles: ChangeDetectionTile[],
  opts?: ChangeDetectionLinkOptions,
): { events: InfrastructureDamageEvent[]; matches: ChangeDetectionMatch[] } {
  const matches: ChangeDetectionMatch[] = [];
  const annotated = events.map((e) => {
    const m = matchEventToTiles(e, tiles, opts);
    if (!m) return e;
    matches.push(m);
    return { ...e, changeDetectionConfidence: m.confidence };
  });
  return { events: annotated, matches };
}
