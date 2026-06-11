/**
 * Privacy policy guard for drone launch points.
 *
 * HARD RULE: do not publish near-real-time (NRT) precise launch coordinates in
 * civilian areas unless they are aggregated. Pinpointing a launch site in a
 * populated area in real time could endanger residents or expose Ukrainian
 * operators. The guard either suppresses or snaps such coordinates to an
 * aggregation grid before they reach a public payload.
 */

import { DroneEvent } from "./types";

/** Events newer than this are considered near-real-time. */
export const NRT_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Aggregation grid size (deg) applied to suppressed civilian launch coords. */
export const AGGREGATION_CELL_DEG = 0.1; // ~11 km

export interface CivilianAreaLookup {
  /** True if the coordinate falls inside a populated/civilian area. */
  isCivilianArea(lat: number, lon: number): boolean;
}

export type LaunchCoordDecision =
  | { action: "publish"; lat: number; lon: number; locationUncertaintyM?: number }
  | { action: "aggregate"; lat: number; lon: number; locationUncertaintyM: number; reasonEn: string; reasonUk: string }
  | { action: "suppress"; reasonEn: string; reasonUk: string };

function isNrt(occurredAt: string, now = Date.now()): boolean {
  return now - new Date(occurredAt).getTime() <= NRT_WINDOW_MS;
}

function snapToGrid(value: number, cell: number): number {
  return Math.floor(value / cell) * cell + cell / 2;
}

/**
 * Decide how a launch event's coordinates may be published.
 * Only `launch` subtype events carry launch-point sensitivity.
 */
export function decideLaunchCoord(
  event: DroneEvent,
  civilian: CivilianAreaLookup,
  opts: { aggregate?: boolean; now?: number } = {},
): LaunchCoordDecision {
  // Non-launch events, or events without coords, publish as-is.
  if (event.subtype !== "launch" || event.lat == null || event.lon == null) {
    return { action: "publish", lat: event.lat ?? NaN, lon: event.lon ?? NaN };
  }

  const nrt = isNrt(event.occurredAt, opts.now);
  const inCivilian = civilian.isCivilianArea(event.lat, event.lon);

  if (!nrt || !inCivilian) {
    return {
      action: "publish",
      lat: event.lat,
      lon: event.lon,
      locationUncertaintyM: event.locationUncertaintyM,
    };
  }

  // NRT + civilian area: aggregate if allowed, else suppress entirely.
  if (opts.aggregate ?? true) {
    return {
      action: "aggregate",
      lat: snapToGrid(event.lat, AGGREGATION_CELL_DEG),
      lon: snapToGrid(event.lon, AGGREGATION_CELL_DEG),
      locationUncertaintyM: 11000,
      reasonEn: "NRT launch point in civilian area aggregated to grid for privacy.",
      reasonUk: "NRT-точку пуску в цивільній зоні агреговано до сітки задля приватності.",
    };
  }

  return {
    action: "suppress",
    reasonEn: "NRT launch point in civilian area suppressed (aggregation disabled).",
    reasonUk: "NRT-точку пуску в цивільній зоні приховано (агрегацію вимкнено).",
  };
}
