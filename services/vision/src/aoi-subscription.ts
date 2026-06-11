/**
 * AOI (Area Of Interest) subscription system (Satellite cluster).
 *
 * Analysts subscribe to a polygon/bbox; whenever a new Sentinel-2/-1 scene covers
 * it (per the satellite revisit cadence), a vision job is scheduled to run change
 * detection / SAR / burn-scar over that AOI and notify the subscriber on findings.
 *
 * This module owns the subscription model + the "is a scene due?" scheduling logic.
 * It is pure-TS (in-memory store + cadence math); the actual scene-availability
 * polling and job enqueue are wired by the worker against the satellite client and
 * the vision `dispatcher` (createJob). Replace the in-memory store with a DB table
 * in production — the interface is stable.
 *
 * === DATA ACCESS PENDING ===
 * Scene availability requires Copernicus Data Space catalog access (creds via
 * process.env — see COMPLIANCE.md). Revisit cadences below are nominal constellation
 * figures used to *estimate* the next overpass when live catalog polling is absent.
 */

import type { GeoPoint } from "@ua-map/event-schema";

export type SatelliteConstellation = "sentinel-2" | "sentinel-1";

/** Nominal revisit cadence (days) at Ukraine's latitude, both satellites combined. */
const REVISIT_DAYS: Record<SatelliteConstellation, number> = {
  "sentinel-2": 5, // S2A+S2B combined
  "sentinel-1": 6, // S1 (post-S1B-loss); 3 with S1C
};

export type AoiProduct = "change_detection" | "burn_scar" | "sar" | "all";

export interface AoiSubscription {
  id: string;
  orgId: string;
  name: { en: string; uk: string };
  /** Bounding envelope (WGS-84). */
  envelope: { minLat: number; minLon: number; maxLat: number; maxLon: number };
  /** Optional polygon vertices for finer masking (worker clips to this). */
  polygon?: GeoPoint[];
  constellations: SatelliteConstellation[];
  products: AoiProduct[];
  /** Max cloud cover (%) to accept an optical scene. */
  maxCloudCoverPct: number;
  /** Notify destinations resolved by the worker (webhook ids, user ids…). */
  notifyChannels: string[];
  active: boolean;
  createdAt: string;
  /** Last scene timestamp we processed (per constellation). */
  lastProcessedAt: Partial<Record<SatelliteConstellation, string>>;
}

const subs = new Map<string, AoiSubscription>();
let counter = 0;

export function createAoiSubscription(params: Omit<AoiSubscription, "id" | "createdAt" | "lastProcessedAt" | "active"> & { active?: boolean }): AoiSubscription {
  const id = `aoi-${++counter}-${Date.now()}`;
  const sub: AoiSubscription = {
    ...params,
    id,
    active: params.active ?? true,
    createdAt: new Date().toISOString(),
    lastProcessedAt: {},
  };
  subs.set(id, sub);
  return sub;
}

export function getAoiSubscription(id: string): AoiSubscription | undefined { return subs.get(id); }
export function listAoiSubscriptions(orgId?: string): AoiSubscription[] {
  return [...subs.values()].filter((s) => !orgId || s.orgId === orgId);
}
export function deactivateAoiSubscription(id: string): void {
  const s = subs.get(id);
  if (s) subs.set(id, { ...s, active: false });
}
export function markAoiProcessed(id: string, constellation: SatelliteConstellation, sceneTime: string): void {
  const s = subs.get(id);
  if (s) subs.set(id, { ...s, lastProcessedAt: { ...s.lastProcessedAt, [constellation]: sceneTime } });
}

/** Approximate area of the AOI envelope in km^2 (for cost/coverage estimates). */
export function aoiAreaKm2(env: AoiSubscription["envelope"]): number {
  const latKm = (env.maxLat - env.minLat) * 111;
  const midLat = (env.maxLat + env.minLat) / 2;
  const lonKm = (env.maxLon - env.minLon) * 111 * Math.cos((midLat * Math.PI) / 180);
  return parseFloat(Math.abs(latKm * lonKm).toFixed(1));
}

/**
 * Decide which subscriptions are "due" a new scene check, based on nominal revisit
 * cadence and when we last processed each constellation. The worker calls this on a
 * cron, then polls the catalog only for the returned (sub, constellation) pairs.
 */
export function dueForCheck(now: Date = new Date()): Array<{ subscription: AoiSubscription; constellation: SatelliteConstellation }> {
  const out: Array<{ subscription: AoiSubscription; constellation: SatelliteConstellation }> = [];
  for (const s of subs.values()) {
    if (!s.active) continue;
    for (const c of s.constellations) {
      const last = s.lastProcessedAt[c];
      const dueMs = REVISIT_DAYS[c] * 24 * 3600 * 1000;
      if (!last || now.getTime() - new Date(last).getTime() >= dueMs) {
        out.push({ subscription: s, constellation: c });
      }
    }
  }
  return out;
}

/** Map an AOI product set to the vision task types the dispatcher should enqueue. */
export function aoiTasksFor(products: AoiProduct[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    if (p === "all" || p === "change_detection") set.add("change_detection");
    if (p === "all" || p === "burn_scar") set.add("burn_scar_detection");
    if (p === "all" || p === "sar") set.add("sar_processing");
  }
  return [...set];
}
