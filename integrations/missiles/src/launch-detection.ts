/**
 * Launch detection for missile events.
 *
 * Fuses two evidence streams into candidate launch points:
 *   1. Satellite thermal/IR signatures (NASA FIRMS hotspots, Sentinel-2/3 SWIR),
 *      which around a launch present as a brief, high-intensity, isolated hotspot.
 *   2. Community OSINT reports (Telegram / sighting channels) geolocating a
 *      launch flash or plume.
 *
 * There is no commercial early-warning IR feed available to this project, so the
 * detector is a typed, heuristic *correlation* pipeline: it scores how well an IR
 * hotspot and an OSINT report corroborate one another in space and time and emits
 * a `LaunchDetection` with a confidence schema, mirroring `classifier.ts`.
 */

import { MissileSubtype } from "./types";

/** A thermal/IR hotspot adapted from a satellite fire/thermal feed. */
export interface IrHotspot {
  id: string;
  lat: number;
  lon: number;
  /** Brightness temperature in Kelvin (FIRMS bright_ti4/bright_ti5 analogue). */
  brightnessK: number;
  /** Detector confidence 0–1 (FIRMS confidence normalised). */
  confidence: number;
  detectedAt: string;
  source: "nasa_firms" | "sentinel_hub";
}

/** A geolocated community OSINT launch report. */
export interface OsintLaunchReport {
  id: string;
  lat: number;
  lon: number;
  /** Self-reported / triangulated radius of uncertainty in metres. */
  locationUncertaintyM: number;
  reportedAt: string;
  text: string;
  sourceId: string;
  /** Whether the reporting channel has been editorially vetted. */
  trusted: boolean;
}

export interface LaunchDetection {
  detectionId: string;
  launchLat: number;
  launchLon: number;
  locationUncertaintyM: number;
  estimatedLaunchedAt: string;
  /** Probable subtype if inferable from the report text, else undefined. */
  subtypeHint?: MissileSubtype;
  /** 0–1 fused confidence. */
  confidence: number;
  evidence: {
    irHotspotIds: string[];
    osintReportIds: string[];
    /** Set when at least one IR hotspot AND one OSINT report corroborate. */
    corroborated: boolean;
  };
}

const EARTH_R_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Spatial + temporal correlation windows for launch corroboration. */
export const LAUNCH_CORRELATION = {
  /** Max distance (km) between an IR hotspot and an OSINT report to pair them. */
  maxDistanceKm: 8,
  /** Max time gap (ms) between IR detection and OSINT report. */
  maxGapMs: 15 * 60 * 1000,
  /** Brightness floor (K) below which an IR hotspot is unlikely to be a launch. */
  minBrightnessK: 360,
};

/**
 * Heuristic correlation: pair each OSINT launch report with the nearest IR
 * hotspot inside the spatio-temporal window and emit a fused detection.
 * Reports with no IR support are still emitted (un-corroborated, lower confidence)
 * if the channel is trusted.
 */
export function detectLaunches(
  hotspots: IrHotspot[],
  reports: OsintLaunchReport[],
): LaunchDetection[] {
  const detections: LaunchDetection[] = [];
  const usedHotspots = new Set<string>();

  for (const report of reports) {
    const reportMs = new Date(report.reportedAt).getTime();
    let best: { hs: IrHotspot; distKm: number } | undefined;

    for (const hs of hotspots) {
      if (usedHotspots.has(hs.id)) continue;
      if (hs.brightnessK < LAUNCH_CORRELATION.minBrightnessK) continue;
      const gap = Math.abs(new Date(hs.detectedAt).getTime() - reportMs);
      if (gap > LAUNCH_CORRELATION.maxGapMs) continue;
      const distKm = haversineKm(report.lat, report.lon, hs.lat, hs.lon);
      if (distKm > LAUNCH_CORRELATION.maxDistanceKm) continue;
      if (!best || distKm < best.distKm) best = { hs, distKm };
    }

    if (best) {
      usedHotspots.add(best.hs.id);
      // Fuse: IR brightness confidence + OSINT trust, weighted toward agreement.
      const irScore = Math.min(1, best.hs.confidence + (best.hs.brightnessK - 360) / 200);
      const osintScore = report.trusted ? 0.7 : 0.4;
      const proximityBonus = 1 - best.distKm / LAUNCH_CORRELATION.maxDistanceKm;
      const confidence = clamp01(0.4 * irScore + 0.4 * osintScore + 0.2 * proximityBonus);
      detections.push({
        detectionId: `launch_${report.id}`,
        launchLat: best.hs.lat,
        launchLon: best.hs.lon,
        locationUncertaintyM: Math.min(report.locationUncertaintyM, best.distKm * 1000),
        estimatedLaunchedAt: report.reportedAt,
        confidence,
        evidence: {
          irHotspotIds: [best.hs.id],
          osintReportIds: [report.id],
          corroborated: true,
        },
      });
    } else if (report.trusted) {
      detections.push({
        detectionId: `launch_${report.id}`,
        launchLat: report.lat,
        launchLon: report.lon,
        locationUncertaintyM: report.locationUncertaintyM,
        estimatedLaunchedAt: report.reportedAt,
        confidence: 0.45,
        evidence: { irHotspotIds: [], osintReportIds: [report.id], corroborated: false },
      });
    }
  }

  return detections;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
