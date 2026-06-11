/**
 * Mapbox account & billing plan — typed config.
 *
 * Mapbox bills Pay-As-You-Go by metered "free tiers": web map loads (counted as
 * Monthly Active Users), tile requests, and Static Images API requests, each with
 * a monthly free allotment then per-1000 overage. We keep the thresholds typed
 * here so usage-tracking + the monthly audit can reason about them in code rather
 * than re-reading the dashboard. Numbers below are conservative defaults; confirm
 * against https://www.mapbox.com/pricing/ during the monthly audit.
 *
 * Account/token facts and the audit obligation are documented in COMPLIANCE.md.
 * Secrets are NEVER hardcoded — token is read at runtime (see `getMapboxToken`).
 */

export type MapboxPlanTier = "free" | "pay_as_you_go" | "commercial";

export type MapboxBilledFeature =
  | "map_loads" // web GL map loads (MAU-billed)
  | "vector_tiles" // vector tile requests
  | "raster_tiles" // raster/satellite tile requests
  | "static_images" // Static Images API (OG / report snapshots)
  | "directions" // not used today; reserved
  | "geocoding"; // not used today; reserved

export interface MapboxFeatureAllotment {
  feature: MapboxBilledFeature;
  /** Free units included per month before overage billing kicks in. */
  freeMonthlyUnits: number;
  /** Overage price (USD) per 1,000 units beyond the free allotment. */
  overagePer1000Usd: number;
  /** Soft alert threshold as a fraction of the free allotment (0–1). */
  alertAtFraction: number;
  /** Whether this feature is actually used by Aegis Lens today. */
  inUse: boolean;
}

export interface MapboxPlanConfig {
  tier: MapboxPlanTier;
  /** Env var names the token may come from (documented, not the value). */
  tokenEnvVars: readonly string[];
  /** Billing audit cadence — see COMPLIANCE.md "AUDIT MONTHLY". */
  auditCadence: "monthly";
  allotments: Record<MapboxBilledFeature, MapboxFeatureAllotment>;
}

/** Default Pay-As-You-Go plan config (free-tier allotments as of audit baseline). */
export const MAPBOX_PLAN: MapboxPlanConfig = {
  tier: "pay_as_you_go",
  tokenEnvVars: ["NEXT_PUBLIC_MAPBOX_TOKEN", "MAPBOX_TOKEN"],
  auditCadence: "monthly",
  allotments: {
    map_loads: {
      feature: "map_loads",
      freeMonthlyUnits: 50_000,
      overagePer1000Usd: 5.0,
      alertAtFraction: 0.8,
      inUse: true,
    },
    vector_tiles: {
      feature: "vector_tiles",
      freeMonthlyUnits: 200_000,
      overagePer1000Usd: 0.25,
      alertAtFraction: 0.8,
      inUse: true,
    },
    raster_tiles: {
      feature: "raster_tiles",
      freeMonthlyUnits: 200_000,
      overagePer1000Usd: 0.25,
      alertAtFraction: 0.8,
      inUse: true,
    },
    static_images: {
      feature: "static_images",
      freeMonthlyUnits: 50_000,
      overagePer1000Usd: 1.0,
      alertAtFraction: 0.8,
      inUse: true,
    },
    directions: {
      feature: "directions",
      freeMonthlyUnits: 100_000,
      overagePer1000Usd: 2.0,
      alertAtFraction: 0.9,
      inUse: false,
    },
    geocoding: {
      feature: "geocoding",
      freeMonthlyUnits: 100_000,
      overagePer1000Usd: 0.75,
      alertAtFraction: 0.9,
      inUse: false,
    },
  },
};

/** Estimate monthly overage cost (USD) for a feature given a usage count. */
export function estimateOverageUsd(feature: MapboxBilledFeature, units: number): number {
  const a = MAPBOX_PLAN.allotments[feature];
  const over = Math.max(0, units - a.freeMonthlyUnits);
  return (over / 1000) * a.overagePer1000Usd;
}

/** True when usage has crossed the soft alert threshold for a feature. */
export function isOverAlertThreshold(feature: MapboxBilledFeature, units: number): boolean {
  const a = MAPBOX_PLAN.allotments[feature];
  return units >= a.freeMonthlyUnits * a.alertAtFraction;
}

/** Read the Mapbox access token from env (mirrors apps/web map-style helper). */
export function getMapboxToken(): string {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? "";
}
