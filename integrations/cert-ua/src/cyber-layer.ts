/**
 * Cyber-incident map layer data provider (task 9).
 *
 * Produces a per-region INTENSITY model for the `cyber_incidents` map layer
 * (registry entry + paint spec proposed via the handoff file
 * c:\tmp\sprint258_shared_CERT.txt). Renders as a choropleth / heatmap where each
 * oblast's color encodes recent cyber-incident intensity, broken down by sector.
 *
 * Intensity = recency-weighted sum of advisory severities affecting the region.
 * Nationwide ("UA-ALL") advisories are distributed across all regions at reduced
 * weight so they raise the baseline without dominating any single oblast.
 *
 * Display expectation (RETROSPECTIVE): the layer legend / cadence must state the
 * data lags real events by days. Do not present as live.
 */

import type { CertAdvisory, RegionCode, Sector } from "./types";
import { CYBER_REGIONS, SEVERITY_RANK, SECTOR_LABELS } from "./types";

export const CYBER_LAYER_ID = "cyber_incidents";

export interface RegionIntensity {
  regionCode: RegionCode;
  nameEn: string;
  nameUk: string;
  center: [number, number];
  /** 0–100 composite intensity. */
  intensity: number;
  /** Dominant sector for coloring. */
  topSector: Sector;
  /** Per-sector intensity breakdown. */
  bySector: Partial<Record<Sector, number>>;
  advisoryCount: number;
}

export interface CyberLayerSnapshot {
  layerId: typeof CYBER_LAYER_ID;
  generatedAt: string;
  /** GeoJSON-friendly per-region intensities (only regions with activity). */
  regions: RegionIntensity[];
  cadenceLabel: { en: string; uk: string };
  isRetrospective: true;
}

const HALF_LIFE_DAYS = 14; // intensity halves every two weeks
const NATIONWIDE_WEIGHT = 0.25;

function recencyWeight(publishedAt: string, now: number): number {
  const ageDays = Math.max(0, (now - Date.parse(publishedAt)) / 86_400_000);
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

/** Build per-region intensity from a set of (enriched) advisories. */
export function buildCyberLayer(advisories: CertAdvisory[], now = Date.now()): CyberLayerSnapshot {
  const acc = new Map<RegionCode, { bySector: Map<Sector, number>; count: number }>();

  const bump = (code: RegionCode, sector: Sector, amount: number) => {
    if (code === "UA-ALL") return;
    if (!acc.has(code)) acc.set(code, { bySector: new Map(), count: 0 });
    const entry = acc.get(code)!;
    entry.bySector.set(sector, (entry.bySector.get(sector) ?? 0) + amount);
  };

  const realRegions = (Object.keys(CYBER_REGIONS) as RegionCode[]).filter((r) => r !== "UA-ALL");

  for (const adv of advisories) {
    const w = recencyWeight(adv.publishedAt, now) * SEVERITY_RANK[adv.severity];
    const sectors = adv.sectors.length > 0 ? adv.sectors : (["other"] as Sector[]);
    const isNationwide = adv.regions.length === 0 || adv.regions.every((r) => r === "UA-ALL");

    if (isNationwide) {
      for (const region of realRegions) {
        for (const sector of sectors) bump(region, sector, (w * NATIONWIDE_WEIGHT) / sectors.length);
      }
    } else {
      for (const region of adv.regions) {
        if (region === "UA-ALL") continue;
        for (const sector of sectors) bump(region, sector, w / sectors.length);
        if (acc.has(region)) acc.get(region)!.count += 1;
      }
    }
  }

  // Normalize to 0–100 by the max regional total.
  const totals = new Map<RegionCode, number>();
  for (const [code, entry] of acc) {
    let sum = 0;
    for (const v of entry.bySector.values()) sum += v;
    totals.set(code, sum);
  }
  const max = Math.max(1, ...totals.values());

  const regions: RegionIntensity[] = [];
  for (const [code, entry] of acc) {
    const info = CYBER_REGIONS[code];
    const bySector: Partial<Record<Sector, number>> = {};
    let topSector: Sector = "other";
    let topVal = -1;
    for (const [sector, v] of entry.bySector) {
      const scaled = Math.round((v / max) * 100);
      bySector[sector] = scaled;
      if (v > topVal) { topVal = v; topSector = sector; }
    }
    regions.push({
      regionCode: code,
      nameEn: info.nameEn,
      nameUk: info.nameUk,
      center: info.center,
      intensity: Math.round(((totals.get(code) ?? 0) / max) * 100),
      topSector,
      bySector,
      advisoryCount: entry.count,
    });
  }

  regions.sort((a, b) => b.intensity - a.intensity);

  return {
    layerId: CYBER_LAYER_ID,
    generatedAt: new Date(now).toISOString(),
    regions,
    cadenceLabel: {
      en: "Daily, retrospective (lags real events by days)",
      uk: "Щоденно, ретроспективно (відстає від подій на дні)",
    },
    isRetrospective: true,
  };
}

/** GeoJSON FeatureCollection of region centroids for heatmap/choropleth rendering. */
export function toGeoJSON(snapshot: CyberLayerSnapshot) {
  return {
    type: "FeatureCollection" as const,
    features: snapshot.regions.map((r) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: r.center },
      properties: {
        regionCode: r.regionCode,
        nameEn: r.nameEn,
        nameUk: r.nameUk,
        intensity: r.intensity,
        topSector: r.topSector,
        topSectorLabel: SECTOR_LABELS[r.topSector],
        advisoryCount: r.advisoryCount,
      },
    })),
  };
}
