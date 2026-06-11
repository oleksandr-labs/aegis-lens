/**
 * Task 5 — Commercial providers integration.
 *
 * Provider interface + Phase enum gating (Planet = Phase 2; BlackSky / Capella
 * = Phase 3) + a per-scene usage metering hook. Commercial licensing is TIGHT:
 * every commercial provider is OFF unless its phase is explicitly enabled, and
 * every tasked/downloaded scene MUST be metered (see `meterScene`).
 *
 * Sentinel-1/2 (Copernicus) is free/open and is therefore NOT gated here — it is
 * always available via `client.ts`.
 */

import type { BBox } from "./client";
import type { ImageryLicense, RegionCode, SensorFamily } from "./types";
import type { SceneMetadata } from "./scene-metadata";

/** Roll-out phases. Sentinel (free) is Phase 1 and always on. */
export enum ImageryPhase {
  Phase1_SentinelOpen = 1,
  Phase2_Planet = 2,
  Phase3_BlackSkyCapella = 3,
}

export type CommercialProviderId = "planet" | "blacksky" | "capella";

/** The phase each commercial provider unlocks at. */
export const PROVIDER_PHASE: Record<CommercialProviderId, ImageryPhase> = {
  planet: ImageryPhase.Phase2_Planet,
  blacksky: ImageryPhase.Phase3_BlackSkyCapella,
  capella: ImageryPhase.Phase3_BlackSkyCapella,
};

export const PROVIDER_LICENSE: Record<CommercialProviderId, ImageryLicense> = {
  planet: "planet_commercial",
  blacksky: "blacksky_commercial",
  capella: "capella_commercial",
};

export const PROVIDER_SENSOR: Record<CommercialProviderId, SensorFamily> = {
  planet: "planet_planetscope",
  blacksky: "blacksky_optical",
  capella: "capella_sar",
};

/** A tasking / search request to a commercial provider. */
export interface CommercialSearchRequest {
  provider: CommercialProviderId;
  region: RegionCode;
  bbox: BBox;
  time_range: { from: string; to: string };
  maxCloudCoverPct?: number;
}

/** A search hit (a candidate scene that could be downloaded — i.e. metered). */
export interface CommercialSceneRef {
  provider: CommercialProviderId;
  externalProductId: string;
  acquiredAt: string;
  cloudCoverPct?: number;
  resolutionM?: number;
  bbox?: BBox;
}

/**
 * Per-scene usage record — emitted to the metering hook on every commercial
 * download/tasking so the licence quota can be tracked per scene (per the
 * cluster's Примітки: "Track usage per scene").
 */
export interface SceneUsageRecord {
  provider: CommercialProviderId;
  externalProductId: string;
  region: RegionCode;
  license: ImageryLicense;
  /** "search" is free; "download"/"tasking" consume quota. */
  action: "search" | "download" | "tasking";
  /** Estimated km² billed (provider-specific). */
  areaKm2?: number;
  userId?: string;
  at: string;
}

/** Hook the host app implements to record commercial usage (billing/quota). */
export type UsageMeterHook = (record: SceneUsageRecord) => void | Promise<void>;

/** Common interface every commercial imagery provider adapter implements. */
export interface CommercialImageryProvider {
  readonly id: CommercialProviderId;
  readonly phase: ImageryPhase;
  search(req: CommercialSearchRequest): Promise<CommercialSceneRef[]>;
  /** Downloads a scene — MUST meter usage. Throws if provider not enabled. */
  download(ref: CommercialSceneRef, opts: { userId?: string }): Promise<SceneMetadata>;
}

/** Returns true iff the provider's phase is at or below the enabled phase. */
export function isProviderEnabled(
  provider: CommercialProviderId,
  enabledPhase: ImageryPhase,
): boolean {
  return PROVIDER_PHASE[provider] <= enabledPhase;
}

/** Throws a typed error when a provider is used before its phase is enabled. */
export function assertProviderEnabled(
  provider: CommercialProviderId,
  enabledPhase: ImageryPhase,
): void {
  if (!isProviderEnabled(provider, enabledPhase)) {
    throw new Error(
      `[commercial-providers] "${provider}" is gated behind Phase ${PROVIDER_PHASE[provider]} ` +
        `(current enabled phase: ${enabledPhase}). Refusing to call a commercial API.`,
    );
  }
}

/**
 * Base adapter that enforces phase gating + metering for all commercial
 * providers. Concrete adapters override `doSearch` / `doDownload` with the real
 * provider API; the heuristic baseline here returns empty results so the
 * contract is exercisable without a commercial key.
 */
export abstract class BaseCommercialProvider implements CommercialImageryProvider {
  abstract readonly id: CommercialProviderId;

  constructor(
    protected readonly enabledPhase: ImageryPhase,
    protected readonly meter: UsageMeterHook,
  ) {}

  get phase(): ImageryPhase {
    return PROVIDER_PHASE[this.id];
  }

  async search(req: CommercialSearchRequest): Promise<CommercialSceneRef[]> {
    assertProviderEnabled(this.id, this.enabledPhase);
    await this.meter({
      provider: this.id,
      externalProductId: "*",
      region: req.region,
      license: PROVIDER_LICENSE[this.id],
      action: "search",
      at: new Date().toISOString(),
    });
    return this.doSearch(req);
  }

  async download(ref: CommercialSceneRef, opts: { userId?: string }): Promise<SceneMetadata> {
    assertProviderEnabled(this.id, this.enabledPhase);
    await this.meter({
      provider: this.id,
      externalProductId: ref.externalProductId,
      region: "",
      license: PROVIDER_LICENSE[this.id],
      action: "download",
      areaKm2: bboxAreaKm2(ref.bbox),
      userId: opts.userId,
      at: new Date().toISOString(),
    });
    return this.doDownload(ref, opts);
  }

  /** Heuristic baseline: no commercial key → no results. Override in subclass. */
  protected async doSearch(_req: CommercialSearchRequest): Promise<CommercialSceneRef[]> {
    return [];
  }

  protected async doDownload(ref: CommercialSceneRef, _opts: { userId?: string }): Promise<SceneMetadata> {
    const now = new Date().toISOString();
    return {
      sceneId: `${this.id}:${ref.externalProductId}`,
      acquiredAt: ref.acquiredAt,
      ingestedAt: now,
      sensor: PROVIDER_SENSOR[this.id],
      provider: this.id,
      license: PROVIDER_LICENSE[this.id],
      cloudCoverPct: ref.cloudCoverPct,
      resolutionM: ref.resolutionM,
      externalProductId: ref.externalProductId,
      bbox: ref.bbox,
      publicViewable: false, // commercial scenes are never public-tier
    };
  }
}

/** Rough bbox area in km² (equirectangular approximation). */
export function bboxAreaKm2(bbox?: BBox): number | undefined {
  if (!bbox) return undefined;
  const latMid = ((bbox.north + bbox.south) / 2) * (Math.PI / 180);
  const kmPerDegLat = 111.32;
  const kmPerDegLon = 111.32 * Math.cos(latMid);
  const h = Math.abs(bbox.north - bbox.south) * kmPerDegLat;
  const w = Math.abs(bbox.east - bbox.west) * kmPerDegLon;
  return Math.round(w * h * 100) / 100;
}
