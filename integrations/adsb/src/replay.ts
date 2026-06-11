/**
 * Historical replay: typed track-history model with frame interpolation.
 *
 * Lets the UI scrub through recorded aircraft positions for a time window and
 * play them back at an arbitrary speed. Between recorded samples it linearly
 * interpolates position, altitude and heading so playback is smooth even when
 * samples are sparse (OpenSky free tier ≈ one sample / 10–15 s).
 *
 * Pure, dependency-free model — feed it samples, ask for a frame at time T.
 */

/** A single recorded position sample for one aircraft. */
export interface TrackSample {
  /** Epoch milliseconds. */
  t: number;
  lat: number;
  lon: number;
  altitudeM: number | null;
  headingDeg: number | null;
  velocityMs: number | null;
  onGround: boolean;
}

/** A full recorded history for a single aircraft. */
export interface AircraftTrackHistory {
  icao24: string;
  callsign: string | null;
  /** Samples sorted ascending by `t`. */
  samples: TrackSample[];
}

/** An interpolated frame produced during replay. */
export interface ReplayFrame {
  icao24: string;
  callsign: string | null;
  t: number;
  lat: number;
  lon: number;
  altitudeM: number | null;
  headingDeg: number | null;
  velocityMs: number | null;
  onGround: boolean;
  /** True when the frame is interpolated rather than an exact sample. */
  interpolated: boolean;
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

/** Interpolate a heading across the shortest angular path (0–360 wrap). */
function lerpHeading(a: number, b: number, f: number): number {
  let delta = ((b - a + 540) % 360) - 180;
  return (a + delta * f + 360) % 360;
}

/** Ensure samples are sorted ascending by time. */
export function sortHistory(history: AircraftTrackHistory): AircraftTrackHistory {
  return { ...history, samples: [...history.samples].sort((a, b) => a.t - b.t) };
}

/**
 * Compute the interpolated frame for a single aircraft at epoch-ms `t`.
 * Returns null if `t` is outside the recorded window (no extrapolation).
 */
export function frameAt(history: AircraftTrackHistory, t: number): ReplayFrame | null {
  const s = history.samples;
  if (s.length === 0) return null;
  if (t < s[0].t || t > s[s.length - 1].t) return null;

  // Exact / boundary match.
  if (t === s[0].t) return toFrame(history, s[0], false);
  if (t === s[s.length - 1].t) return toFrame(history, s[s.length - 1], false);

  // Find bracketing samples.
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid].t <= t) lo = mid;
    else hi = mid;
  }

  const a = s[lo];
  const b = s[hi];
  if (a.t === t) return toFrame(history, a, false);
  const f = (t - a.t) / (b.t - a.t);

  return {
    icao24: history.icao24,
    callsign: history.callsign,
    t,
    lat: lerp(a.lat, b.lat, f),
    lon: lerp(a.lon, b.lon, f),
    altitudeM: a.altitudeM != null && b.altitudeM != null ? lerp(a.altitudeM, b.altitudeM, f) : a.altitudeM ?? b.altitudeM,
    headingDeg: a.headingDeg != null && b.headingDeg != null ? lerpHeading(a.headingDeg, b.headingDeg, f) : a.headingDeg ?? b.headingDeg,
    velocityMs: a.velocityMs != null && b.velocityMs != null ? lerp(a.velocityMs, b.velocityMs, f) : a.velocityMs ?? b.velocityMs,
    onGround: f < 0.5 ? a.onGround : b.onGround,
    interpolated: true,
  };
}

function toFrame(history: AircraftTrackHistory, s: TrackSample, interpolated: boolean): ReplayFrame {
  return {
    icao24: history.icao24,
    callsign: history.callsign,
    t: s.t,
    lat: s.lat,
    lon: s.lon,
    altitudeM: s.altitudeM,
    headingDeg: s.headingDeg,
    velocityMs: s.velocityMs,
    onGround: s.onGround,
    interpolated,
  };
}

/**
 * Replay model over many aircraft. Produces the set of frames visible at a
 * given playback time across all tracked aircraft.
 */
export class ReplaySession {
  private readonly histories: AircraftTrackHistory[];
  readonly startMs: number;
  readonly endMs: number;

  constructor(histories: AircraftTrackHistory[]) {
    this.histories = histories.map(sortHistory).filter((h) => h.samples.length > 0);
    const starts = this.histories.map((h) => h.samples[0].t);
    const ends = this.histories.map((h) => h.samples[h.samples.length - 1].t);
    this.startMs = starts.length ? Math.min(...starts) : 0;
    this.endMs = ends.length ? Math.max(...ends) : 0;
  }

  /** All aircraft frames at absolute epoch-ms time `t`. */
  frameAtTime(t: number): ReplayFrame[] {
    const out: ReplayFrame[] = [];
    for (const h of this.histories) {
      const f = frameAt(h, t);
      if (f) out.push(f);
    }
    return out;
  }

  /**
   * Generate evenly spaced playback frames.
   * @param stepMs sampling step in ms (e.g. 1000 for 1 fps of model time)
   */
  *frames(stepMs: number): Generator<{ t: number; frames: ReplayFrame[] }> {
    for (let t = this.startMs; t <= this.endMs; t += stepMs) {
      yield { t, frames: this.frameAtTime(t) };
    }
  }
}
