/**
 * Equipment-movement timeline through Belarus.
 *
 * Belarus is a transit corridor: the same echelon / SAM battery / aircraft is
 * often sighted at successive POIs (Brest → Zhabinka → Luninets → UA border).
 * This module stitches individual sightings into per-equipment MOVEMENT TRACKS
 * by chaining sightings of a compatible equipment class that progress in time
 * along plausible geography, then derives a heading + a UA-flank threat note.
 *
 * Pure functions over `HajunSighting[]`; demo-safe. Output feeds the timeline UI
 * and the Belarus-flank map layer (arrows between consecutive POIs).
 */

import type { HajunSighting, EquipmentClass } from "./types";

export interface TimelineStop {
  eventId: string;
  poiId?: string;
  poiNameEn?: string;
  poiNameUk?: string;
  lat?: number;
  lon?: number;
  occurredAt: string;
  confidence: number;
}

export interface MovementTrack {
  trackId: string;
  equipmentClass: EquipmentClass;
  model?: string;
  /** Chronological stops along the corridor. */
  stops: TimelineStop[];
  /** Net heading of the track (great-circle bearing first→last), degrees. */
  headingDeg?: number;
  /** Whether the net motion trends toward the UA border (southward). */
  towardUaBorder: boolean;
  /** Total span of the track in hours. */
  spanHours: number;
  note: { en: string; uk: string; be: string };
}

const EARTH_R_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Initial great-circle bearing first→last, degrees [0,360). */
function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export interface TimelineOptions {
  /** Max gap between consecutive stops to stay in one track (hours). Default 72. */
  maxGapHours?: number;
  /** Max hop distance between consecutive POIs (km). Default 400. */
  maxHopKm?: number;
}

/**
 * Build movement tracks. Sightings are grouped by equipment class (and model
 * when present), sorted by time, then segmented whenever the temporal/spatial
 * gap to the next sighting exceeds the thresholds (a new track begins).
 */
export function buildMovementTracks(
  sightings: HajunSighting[],
  opts: TimelineOptions = {},
): MovementTrack[] {
  const maxGapH = opts.maxGapHours ?? 72;
  const maxHopKm = opts.maxHopKm ?? 400;

  // Group by class+model.
  const groups = new Map<string, HajunSighting[]>();
  for (const s of sightings) {
    if (!s.location) continue;
    const key = `${s.equipment.class}:${s.equipment.model ?? "*"}`;
    let bucket = groups.get(key);
    if (!bucket) {
      bucket = [];
      groups.set(key, bucket);
    }
    bucket.push(s);
  }

  const tracks: MovementTrack[] = [];
  let seq = 0;

  for (const [key, group] of groups) {
    const sorted = [...group].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
    let segment: HajunSighting[] = [];
    const flush = () => {
      if (segment.length >= 1) tracks.push(toTrack(`bytrk-${seq++}`, key, segment));
      segment = [];
    };
    for (const s of sorted) {
      if (segment.length === 0) {
        segment.push(s);
        continue;
      }
      const prev = segment[segment.length - 1];
      const gapH =
        (new Date(s.occurredAt).getTime() - new Date(prev.occurredAt).getTime()) / 3_600_000;
      const hopKm = haversineKm(
        prev.location!.lat,
        prev.location!.lon,
        s.location!.lat,
        s.location!.lon,
      );
      if (gapH > maxGapH || hopKm > maxHopKm) flush();
      segment.push(s);
    }
    flush();
  }

  return tracks;
}

function toTrack(trackId: string, key: string, segment: HajunSighting[]): MovementTrack {
  const [equipmentClass, model] = key.split(":") as [EquipmentClass, string];
  const stops: TimelineStop[] = segment.map((s) => ({
    eventId: s.eventId,
    poiId: s.poiId,
    poiNameEn: s.poiNameEn,
    poiNameUk: s.poiNameUk,
    lat: s.location?.lat,
    lon: s.location?.lon,
    occurredAt: s.occurredAt,
    confidence: s.confidence,
  }));

  const first = stops[0];
  const last = stops[stops.length - 1];
  let headingDeg: number | undefined;
  let towardUaBorder = false;
  if (stops.length >= 2 && first.lat != null && last.lat != null) {
    headingDeg = Math.round(((bearingDeg(first.lat!, first.lon!, last.lat!, last.lon!) + 360) % 360));
    // Southward motion (latitude decreasing) trends toward the UA border.
    towardUaBorder = last.lat! < first.lat! - 0.1;
  }
  const spanHours =
    Math.round(
      ((new Date(last.occurredAt).getTime() - new Date(first.occurredAt).getTime()) / 3_600_000) *
        10,
    ) / 10;

  const path = stops.map((s) => s.poiNameEn ?? "?").join(" → ");
  const pathUk = stops.map((s) => s.poiNameUk ?? "?").join(" → ");
  const flank = towardUaBorder
    ? { en: " — trending toward the UA border.", uk: " — рух у бік кордону з Україною.", be: " — рух у бок мяжы з Украінай." }
    : { en: "", uk: "", be: "" };

  return {
    trackId,
    equipmentClass,
    model: model === "*" ? undefined : model,
    stops,
    headingDeg,
    towardUaBorder,
    spanHours,
    note: {
      en: `${equipmentClass} movement: ${path}${flank.en}`,
      uk: `Переміщення (${equipmentClass}): ${pathUk}${flank.uk}`,
      be: `Перамяшчэнне (${equipmentClass}): ${path}${flank.be}`,
    },
  };
}
