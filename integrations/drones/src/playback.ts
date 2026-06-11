/**
 * Historical playback with trajectory animation.
 *
 * Turns a reconstructed `DroneMission` (from `trajectory.ts`) into an ordered set
 * of time-indexed frames the map can scrub/animate. Between known waypoints we
 * linearly interpolate position so the drone marker moves smoothly; each frame
 * carries the active mission state for styling (in-flight vs intercepted).
 */

import { DroneMission } from "./types";

export interface PlaybackFrame {
  /** Frame timestamp (ISO). */
  ts: string;
  /** Interpolated position at this frame. */
  lat: number;
  lon: number;
  /** Mission this frame belongs to. */
  missionId: string;
  /** State used by the map paint spec. */
  state: "in_flight" | "intercepted" | "ended";
  /** 0–1 progress along the known trajectory. */
  progress: number;
}

export interface PlaybackTimeline {
  missionId: string;
  startTs: string;
  endTs: string;
  frameIntervalMs: number;
  frames: PlaybackFrame[];
}

/**
 * Build an animation timeline for a mission.
 * @param mission        mission with an ordered trajectory (see buildMission)
 * @param frameIntervalMs spacing between frames (default 5s)
 */
export function buildPlaybackTimeline(
  mission: DroneMission,
  frameIntervalMs = 5000,
): PlaybackTimeline {
  const wp = mission.trajectory;
  if (wp.length === 0) {
    const ts = mission.estimatedLaunchAt ?? new Date().toISOString();
    return { missionId: mission.missionId, startTs: ts, endTs: ts, frameIntervalMs, frames: [] };
  }

  const startMs = new Date(wp[0].ts).getTime();
  const endMs = new Date(wp[wp.length - 1].ts).getTime();
  const interceptMs = mission.interceptedAt ? new Date(mission.interceptedAt).getTime() : undefined;
  const frames: PlaybackFrame[] = [];

  for (let t = startMs; t <= endMs; t += frameIntervalMs) {
    const pos = interpolateAlong(wp, t);
    const progress = endMs === startMs ? 1 : (t - startMs) / (endMs - startMs);
    let state: PlaybackFrame["state"] = "in_flight";
    if (interceptMs != null && t >= interceptMs) state = "intercepted";
    else if (t >= endMs) state = "ended";

    frames.push({
      ts: new Date(t).toISOString(),
      lat: pos.lat,
      lon: pos.lon,
      missionId: mission.missionId,
      state,
      progress: parseFloat(progress.toFixed(3)),
    });
  }

  return {
    missionId: mission.missionId,
    startTs: wp[0].ts,
    endTs: wp[wp.length - 1].ts,
    frameIntervalMs,
    frames,
  };
}

/** Linear interpolation of position along time-ordered waypoints. */
function interpolateAlong(
  wp: Array<{ lat: number; lon: number; ts: string }>,
  tMs: number,
): { lat: number; lon: number } {
  if (tMs <= new Date(wp[0].ts).getTime()) return { lat: wp[0].lat, lon: wp[0].lon };
  const last = wp[wp.length - 1];
  if (tMs >= new Date(last.ts).getTime()) return { lat: last.lat, lon: last.lon };

  for (let i = 0; i < wp.length - 1; i++) {
    const aMs = new Date(wp[i].ts).getTime();
    const bMs = new Date(wp[i + 1].ts).getTime();
    if (tMs >= aMs && tMs <= bMs) {
      const f = bMs === aMs ? 0 : (tMs - aMs) / (bMs - aMs);
      return {
        lat: wp[i].lat + (wp[i + 1].lat - wp[i].lat) * f,
        lon: wp[i].lon + (wp[i + 1].lon - wp[i].lon) * f,
      };
    }
  }
  return { lat: last.lat, lon: last.lon };
}
