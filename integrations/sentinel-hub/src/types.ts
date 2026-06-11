/**
 * Shared types for the Sentinel Hub / satellite imagery integration (Aegis Lens).
 *
 * These are the codeable contracts for the C8 — Satellite Imagery cluster:
 * typed request/result models, scene metadata, provider gating, overlay config,
 * attribution, compare-slider pairs and analyst annotations.
 *
 * Live API access is provided by `client.ts`; commercial providers (Planet,
 * BlackSky, Capella) are gated behind phase flags — see `commercial-providers.ts`.
 */

import type { BBox } from "./client";

// Note: `BBox` is re-exported from `./client` via index.ts; we only import it here.

/** A localized user-facing string (this is a UA product — always provide both). */
export interface I18nText {
  en: string;
  uk: string;
}

/** Named regions / areas of interest used for per-region mosaics. */
export type RegionCode = string;

/** Sensor family that produced a scene. */
export type SensorFamily =
  | "sentinel_2_optical"
  | "sentinel_1_sar"
  | "planet_skysat"
  | "planet_planetscope"
  | "blacksky_optical"
  | "capella_sar"
  | "unknown";

/** Imagery license class — drives what may be shown / exported per access tier. */
export type ImageryLicense =
  | "copernicus_open"   // Sentinel-1/2 — free & open (attribution required)
  | "planet_commercial" // Planet — commercial, redistribution restricted
  | "blacksky_commercial"
  | "capella_commercial"
  | "unknown";

/** SAR polarization modes. */
export type Polarization = "VV" | "VH" | "HH" | "HV" | "VV+VH" | "HH+HV";

/**
 * Localized labels for per-image metadata fields (TODO i18n: "Metadata labels localized").
 * Keyed by the SceneMetadata field name.
 */
export const METADATA_LABELS: Record<string, I18nText> = {
  acquiredAt: { en: "Acquisition time", uk: "Час зйомки" },
  sensor: { en: "Sensor", uk: "Сенсор" },
  license: { en: "License", uk: "Ліцензія" },
  cloudCoverPct: { en: "Cloud cover", uk: "Хмарність" },
  resolutionM: { en: "Resolution", uk: "Роздільна здатність" },
  provider: { en: "Provider", uk: "Постачальник" },
  polarization: { en: "Polarization", uk: "Поляризація" },
  sceneId: { en: "Scene ID", uk: "Ідентифікатор знімка" },
  region: { en: "Region", uk: "Регіон" },
};

/** Human-readable label for an imagery license (en/uk). */
export const LICENSE_LABELS: Record<ImageryLicense, I18nText> = {
  copernicus_open: { en: "Copernicus (open data)", uk: "Copernicus (відкриті дані)" },
  planet_commercial: { en: "Planet (commercial)", uk: "Planet (комерційна)" },
  blacksky_commercial: { en: "BlackSky (commercial)", uk: "BlackSky (комерційна)" },
  capella_commercial: { en: "Capella (commercial)", uk: "Capella (комерційна)" },
  unknown: { en: "Unknown", uk: "Невідомо" },
};

/** Sensor display labels (en/uk). */
export const SENSOR_LABELS: Record<SensorFamily, I18nText> = {
  sentinel_2_optical: { en: "Sentinel-2 (optical)", uk: "Sentinel-2 (оптика)" },
  sentinel_1_sar: { en: "Sentinel-1 (SAR)", uk: "Sentinel-1 (РСА)" },
  planet_skysat: { en: "Planet SkySat", uk: "Planet SkySat" },
  planet_planetscope: { en: "Planet PlanetScope", uk: "Planet PlanetScope" },
  blacksky_optical: { en: "BlackSky (optical)", uk: "BlackSky (оптика)" },
  capella_sar: { en: "Capella (SAR)", uk: "Capella (РСА)" },
  unknown: { en: "Unknown sensor", uk: "Невідомий сенсор" },
};

/** A named area-of-interest definition (region + its bounding box). */
export interface RegionAOI {
  region: RegionCode;
  name: I18nText;
  bbox: BBox;
}
