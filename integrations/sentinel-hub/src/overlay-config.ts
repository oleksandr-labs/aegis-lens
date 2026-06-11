/**
 * Task 7 (part) — Map style: switchable base layer + overlay opacity.
 *
 * The base-layer switching itself lives in `apps/web/src/lib/map-style.ts`
 * (MapStyleVariant: "dark" | "satellite" | "print") — READ ONLY. This module is
 * the opacity model for raster imagery overlays (S2 mosaic, S1 SAR, change
 * detection) that ride on top of the chosen base. See the shared paint note in
 * c:/tmp/sprint257_shared_C8.txt.
 */

import type { I18nText } from "./types";

/** Imagery overlay layer ids that support opacity control. */
export type OverlayLayerId =
  | "satellite_optical"  // Sentinel-2 (or commercial optical) mosaic
  | "sentinel_sar"       // Sentinel-1 (or commercial SAR) overlay
  | "change_detection";

export interface OverlayConfig {
  layerId: OverlayLayerId;
  /** 0 = transparent, 1 = fully opaque. */
  opacity: number;
  /** Whether the overlay is currently rendered. */
  visible: boolean;
  /** Optional brightness/contrast for raster paint (MapLibre raster props). */
  brightness?: number; // -1 .. 1 maps to raster-brightness-min/max midpoint
  contrast?: number;   // -1 .. 1
  /** Render order; higher draws on top. */
  zIndex: number;
}

export const OVERLAY_LABELS: Record<OverlayLayerId, I18nText> = {
  satellite_optical: { en: "Optical imagery", uk: "Оптичні знімки" },
  sentinel_sar: { en: "SAR overlay", uk: "Шар РСА" },
  change_detection: { en: "Change detection", uk: "Виявлення змін" },
};

/** Default overlay configs (all hidden, sensible default opacity). */
export const DEFAULT_OVERLAYS: Record<OverlayLayerId, OverlayConfig> = {
  satellite_optical: { layerId: "satellite_optical", opacity: 1, visible: false, zIndex: 10 },
  sentinel_sar: { layerId: "sentinel_sar", opacity: 0.7, visible: false, zIndex: 11 },
  change_detection: { layerId: "change_detection", opacity: 0.85, visible: false, zIndex: 12 },
};

/** Clamp an opacity value into [0,1]. */
export function clampOpacity(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

/** Immutably set an overlay's opacity. */
export function setOpacity(config: OverlayConfig, opacity: number): OverlayConfig {
  return { ...config, opacity: clampOpacity(opacity) };
}

/**
 * Produces the MapLibre/Mapbox raster paint object for an overlay config.
 * Mirrors the expression style used in `apps/web/src/lib/map-style.ts`.
 */
export function toRasterPaint(config: OverlayConfig): Record<string, number> {
  const paint: Record<string, number> = {
    "raster-opacity": clampOpacity(config.opacity),
  };
  if (config.brightness !== undefined) {
    paint["raster-brightness-min"] = Math.max(0, 0.5 + config.brightness / 2 - 0.5);
    paint["raster-brightness-max"] = Math.min(1, 0.5 + config.brightness / 2 + 0.5);
  }
  if (config.contrast !== undefined) {
    paint["raster-contrast"] = Math.min(1, Math.max(-1, config.contrast));
  }
  return paint;
}
