/**
 * Task 6 — Per-image metadata (acquisition time, sensor, license).
 *
 * Typed SceneMetadata with a license field, plus helpers to render localized
 * (en/uk) metadata for the UI footer / inspector panel.
 */

import type { BBox } from "./client";
import type {
  I18nText,
  ImageryLicense,
  Polarization,
  RegionCode,
  SensorFamily,
} from "./types";
import { LICENSE_LABELS, METADATA_LABELS, SENSOR_LABELS } from "./types";

export type ImageryProvider =
  | "sentinel_hub"
  | "copernicus"
  | "planet"
  | "blacksky"
  | "capella";

/** Normalized metadata for a single satellite scene. */
export interface SceneMetadata {
  sceneId: string;
  region?: RegionCode;
  bbox?: BBox;

  /** ISO-8601 acquisition timestamp (when the satellite imaged the scene). */
  acquiredAt: string;
  /** ISO-8601 ingestion timestamp (when Aegis Lens fetched it). */
  ingestedAt: string;

  sensor: SensorFamily;
  provider: ImageryProvider;
  license: ImageryLicense;

  /** 0–100, optical only. */
  cloudCoverPct?: number;
  /** Ground sample distance in metres. */
  resolutionM?: number;
  /** SAR only. */
  polarization?: Polarization;

  /** Orbit / relative-orbit identifiers where available. */
  orbit?: number;
  /** Source-specific opaque id (e.g. Planet item id, SH product id). */
  externalProductId?: string;

  /** Whether this scene may be shown to public (free) tier — commercial = false. */
  publicViewable: boolean;
}

/** One rendered metadata row: localized label + display value. */
export interface MetadataRow {
  field: string;
  label: I18nText;
  value: string;
}

/** Renders SceneMetadata into localized label/value rows for the UI inspector. */
export function describeScene(scene: SceneMetadata): MetadataRow[] {
  const rows: MetadataRow[] = [];
  const push = (field: string, value: string | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    const label = METADATA_LABELS[field];
    if (!label) return;
    rows.push({ field, label, value });
  };

  push("sceneId", scene.sceneId);
  push("region", scene.region);
  push("acquiredAt", scene.acquiredAt);
  push("sensor", `${SENSOR_LABELS[scene.sensor].en} / ${SENSOR_LABELS[scene.sensor].uk}`);
  push("license", `${LICENSE_LABELS[scene.license].en} / ${LICENSE_LABELS[scene.license].uk}`);
  if (scene.cloudCoverPct !== undefined) push("cloudCoverPct", `${scene.cloudCoverPct}%`);
  if (scene.resolutionM !== undefined) push("resolutionM", `${scene.resolutionM} m`);
  push("polarization", scene.polarization);
  return rows;
}

/** True when the scene is a free/open Copernicus product. */
export function isOpenData(scene: SceneMetadata): boolean {
  return scene.license === "copernicus_open";
}
