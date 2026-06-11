/**
 * Active-alert highlighting — derives map styling state for oblast polygons.
 *
 * Task: "Active-alert highlighting on map" (TODO_civilian_alerts.md).
 *
 * This module turns an AlertFeedSnapshot into a per-oblast styling state that
 * the map layer (`air_raid_alerts`) consumes. It is pure data derivation — no
 * map SDK is imported here so it works on both server and client. The actual
 * paint expressions live in the shared LAYER_PAINT_SPECS (`air_raid_alerts`);
 * this module supplies the per-feature properties those expressions read
 * (`highlight`, `alertType`, `severity`, `pulse`).
 *
 * Latency note: highlight derivation is O(oblasts) and runs on every snapshot
 * (~30s poll). Keep it allocation-light to stay inside the <5s budget.
 */

import type {
  AlertFeedSnapshot,
  AlertType,
  CivilianAlert,
  OblastCode,
} from "./types";
import { OBLASTS } from "./types";

/** Visual highlight tier for an oblast on the map. */
export type HighlightTier = "active" | "recent_clear" | "calm";

/** Severity-driven highlight palette (kept in sync with the paint spec). */
export const HIGHLIGHT_COLORS: Record<HighlightTier, string> = {
  active: "#ff0000",       // red — alert in progress
  recent_clear: "#f59e0b", // amber — cleared within the grace window
  calm: "#00aa00",         // green — all clear
};

/** Per-alert-type intensity used to drive pulse speed / opacity weighting. */
const TYPE_INTENSITY: Record<AlertType, number> = {
  air_raid: 0.8,
  artillery: 0.85,
  urban_fighting: 1,
  chemical: 1,
  nuclear: 1,
  radiological: 1,
  info: 0.3,
};

/** Highest-priority alert type when an oblast has several at once. */
const TYPE_PRIORITY: AlertType[] = [
  "nuclear",
  "radiological",
  "chemical",
  "urban_fighting",
  "artillery",
  "air_raid",
  "info",
];

export interface OblastHighlightState {
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  center: [number, number];
  tier: HighlightTier;
  /** Dominant alert type (only set when tier === "active"). */
  alertType?: AlertType;
  /** 0..1 — drives pulse speed / opacity in the paint spec. */
  intensity: number;
  /** Convenience: true when the oblast currently has any active alert. */
  isActive: boolean;
  /** Whether the map overlay should animate (pulse) for this oblast. */
  pulse: boolean;
  color: string;
}

export interface HighlightDerivationOptions {
  /**
   * Oblasts cleared within this window (ms) are shown as `recent_clear`
   * (amber) instead of immediately dropping to calm. Helps civilians notice a
   * just-ended alert. Set 0 to disable. Default 5 min.
   */
  recentClearWindowMs?: number;
  /** Oblast codes cleared recently, with their clear timestamp (ISO). */
  recentlyCleared?: Partial<Record<OblastCode, string>>;
  /** Reference "now" (ISO) — defaults to current time. */
  now?: string;
}

function pickDominantType(alerts: CivilianAlert[]): AlertType {
  for (const t of TYPE_PRIORITY) {
    if (alerts.some((a) => a.type === t)) return t;
  }
  return "air_raid";
}

/**
 * Derive a styling state for ALL oblasts from a live snapshot. Returns one
 * entry per oblast so the map can render the full base layer plus highlights.
 */
export function deriveHighlights(
  snapshot: AlertFeedSnapshot,
  opts: HighlightDerivationOptions = {},
): OblastHighlightState[] {
  const windowMs = opts.recentClearWindowMs ?? 300_000;
  const nowMs = Date.parse(opts.now ?? new Date().toISOString());
  const recentlyCleared = opts.recentlyCleared ?? {};

  // Index active alerts by oblast.
  const byOblast = new Map<OblastCode, CivilianAlert[]>();
  for (const alert of snapshot.activeAlerts) {
    const list = byOblast.get(alert.oblastCode);
    if (list) list.push(alert);
    else byOblast.set(alert.oblastCode, [alert]);
  }

  const codes = Object.keys(OBLASTS) as OblastCode[];
  return codes.map((code) => {
    const info = OBLASTS[code];
    const active = byOblast.get(code);

    if (active && active.length > 0) {
      const alertType = pickDominantType(active);
      return {
        oblastCode: code,
        oblastNameUk: info.nameUk,
        oblastNameEn: info.nameEn,
        center: info.center,
        tier: "active",
        alertType,
        intensity: TYPE_INTENSITY[alertType],
        isActive: true,
        pulse: alertType !== "info",
        color: HIGHLIGHT_COLORS.active,
      } satisfies OblastHighlightState;
    }

    const clearedAt = recentlyCleared[code];
    if (windowMs > 0 && clearedAt) {
      const clearedMs = Date.parse(clearedAt);
      if (Number.isFinite(clearedMs) && nowMs - clearedMs <= windowMs) {
        return {
          oblastCode: code,
          oblastNameUk: info.nameUk,
          oblastNameEn: info.nameEn,
          center: info.center,
          tier: "recent_clear",
          intensity: 0.4,
          isActive: false,
          pulse: false,
          color: HIGHLIGHT_COLORS.recent_clear,
        } satisfies OblastHighlightState;
      }
    }

    return {
      oblastCode: code,
      oblastNameUk: info.nameUk,
      oblastNameEn: info.nameEn,
      center: info.center,
      tier: "calm",
      intensity: 0,
      isActive: false,
      pulse: false,
      color: HIGHLIGHT_COLORS.calm,
    } satisfies OblastHighlightState;
  });
}

/**
 * Convenience GeoJSON-friendly feature properties for an oblast, matching the
 * property names the `air_raid_alerts` paint spec expects.
 */
export function toFeatureProperties(state: OblastHighlightState): {
  oblast: OblastCode;
  highlight: HighlightTier;
  alertType: AlertType | "none";
  intensity: number;
  pulse: boolean;
} {
  return {
    oblast: state.oblastCode,
    highlight: state.tier,
    alertType: state.alertType ?? "none",
    intensity: state.intensity,
    pulse: state.pulse,
  };
}
