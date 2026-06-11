/**
 * Task 4 — AOI-based scheduled refresh.
 *
 * AOI registration + refresh cadence model. Analysts register an area of
 * interest with a cadence; the scheduler computes which AOIs are due for a new
 * acquisition and produces refresh jobs (consumed by a cron/worker elsewhere).
 */

import type { BBox } from "./client";
import type { I18nText, Polarization, RegionCode } from "./types";

export type RefreshCadence =
  | "on_demand"   // never auto; manual trigger only
  | "daily"
  | "every_3_days"
  | "weekly"
  | "biweekly"
  | "monthly";

/** Which products to refresh for an AOI. */
export type AOIProduct = "s2_optical" | "s1_sar" | "change_detection";

/** Approximate cadence period in milliseconds (used to decide "due"). */
export const CADENCE_INTERVAL_MS: Record<RefreshCadence, number | null> = {
  on_demand: null,
  daily: 24 * 3600_000,
  every_3_days: 3 * 24 * 3600_000,
  weekly: 7 * 24 * 3600_000,
  biweekly: 14 * 24 * 3600_000,
  monthly: 30 * 24 * 3600_000,
};

export const CADENCE_LABELS: Record<RefreshCadence, I18nText> = {
  on_demand: { en: "On demand", uk: "За запитом" },
  daily: { en: "Daily", uk: "Щодня" },
  every_3_days: { en: "Every 3 days", uk: "Кожні 3 дні" },
  weekly: { en: "Weekly", uk: "Щотижнево" },
  biweekly: { en: "Every 2 weeks", uk: "Кожні 2 тижні" },
  monthly: { en: "Monthly", uk: "Щомісяця" },
};

/** A registered area of interest with its refresh policy. */
export interface RegisteredAOI {
  aoiId: string;
  region: RegionCode;
  name: I18nText;
  bbox: BBox;
  cadence: RefreshCadence;
  products: AOIProduct[];
  /** Max cloud cover to accept for optical refreshes (0–100). */
  maxCloudCoverPct?: number;
  polarization?: Polarization;
  /** ISO timestamp of the last successful refresh, if any. */
  lastRefreshedAt?: string;
  /** Owner / requesting analyst. */
  ownerId?: string;
  enabled: boolean;
}

/** A computed refresh job for a due AOI + product. */
export interface RefreshJob {
  aoiId: string;
  region: RegionCode;
  bbox: BBox;
  product: AOIProduct;
  /** Time window to request: [from, to]. */
  window: { from: string; to: string };
  cadence: RefreshCadence;
  maxCloudCoverPct?: number;
  polarization?: Polarization;
  scheduledAt: string;
}

/** True when an AOI is due for refresh relative to `now`. */
export function isDue(aoi: RegisteredAOI, now: number = Date.now()): boolean {
  if (!aoi.enabled) return false;
  const interval = CADENCE_INTERVAL_MS[aoi.cadence];
  if (interval === null) return false; // on_demand
  if (!aoi.lastRefreshedAt) return true;
  const last = Date.parse(aoi.lastRefreshedAt);
  if (Number.isNaN(last)) return true;
  return now - last >= interval;
}

/** Builds refresh jobs for every due AOI/product pair. */
export function planRefreshes(
  aois: RegisteredAOI[],
  now: number = Date.now(),
): RefreshJob[] {
  const jobs: RefreshJob[] = [];
  const nowIso = new Date(now).toISOString();

  for (const aoi of aois) {
    if (!isDue(aoi, now)) continue;
    const interval = CADENCE_INTERVAL_MS[aoi.cadence] ?? 7 * 24 * 3600_000;
    const fromIso = new Date(now - interval).toISOString();

    for (const product of aoi.products) {
      jobs.push({
        aoiId: aoi.aoiId,
        region: aoi.region,
        bbox: aoi.bbox,
        product,
        window: { from: fromIso, to: nowIso },
        cadence: aoi.cadence,
        maxCloudCoverPct: aoi.maxCloudCoverPct,
        polarization: aoi.polarization,
        scheduledAt: nowIso,
      });
    }
  }
  return jobs;
}

/** Marks an AOI as just refreshed (returns a new object — no mutation). */
export function markRefreshed(aoi: RegisteredAOI, at: string = new Date().toISOString()): RegisteredAOI {
  return { ...aoi, lastRefreshedAt: at };
}
