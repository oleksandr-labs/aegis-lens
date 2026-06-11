/**
 * Task 7 — Activation banner on relevant regions.
 *
 * Per-region banner provider: given the active EMS activations and a region the
 * user is viewing (oblast pcode or [lon,lat]), returns a localized banner card
 * ("Active EMS crisis mapping: flood — EMSR698") with a link to the activation.
 *
 * Region resolution is coarse (oblast bbox / centroid radius) — it only needs to
 * decide "is this activation relevant to what the user is looking at".
 */

import type { EmsActivation, EmsHazardType, I18nText } from "./types";
import { HAZARD_LABELS } from "./types";

/** Coarse oblast centroids (subset) → used for region matching. */
export const OBLAST_CENTROIDS: Record<string, { center: [number, number]; nameUk: string }> = {
  UA14: { center: [37.8, 48.02], nameUk: "Донецька" },
  UA12: { center: [35.04, 48.46], nameUk: "Дніпропетровська" },
  UA23: { center: [35.14, 47.84], nameUk: "Запорізька" },
  UA65: { center: [32.6, 46.65], nameUk: "Херсонська" },
  UA63: { center: [36.23, 49.99], nameUk: "Харківська" },
};

export interface ActivationBanner {
  activationCode: string;
  hazard: EmsHazardType;
  severity: "info" | "warning" | "critical";
  title: I18nText;
  body: I18nText;
  url: string;
  /** Region this banner was matched to (pcode or "near:lon,lat"). */
  region: string;
}

/** Haversine-ish flat distance (km) for coarse proximity (good enough <1000 km). */
function flatDistanceKm(a: [number, number], b: [number, number]): number {
  const latMean = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (a[0] - b[0]) * 111.32 * Math.cos(latMean);
  const dy = (a[1] - b[1]) * 110.57;
  return Math.sqrt(dx * dx + dy * dy);
}

function severityFor(a: EmsActivation): ActivationBanner["severity"] {
  if (a.status === "completed" || a.status === "closed") return "info";
  if (a.hazard === "conflict" || a.hazard === "flood") return "critical";
  return "warning";
}

function bannerFor(a: EmsActivation, region: string): ActivationBanner {
  const hz = HAZARD_LABELS[a.hazard];
  return {
    activationCode: a.code,
    hazard: a.hazard,
    severity: severityFor(a),
    title: {
      en: `Copernicus EMS active: ${hz.en} (${a.code})`,
      uk: `Активна карта Copernicus EMS: ${hz.uk} (${a.code})`,
    },
    body: {
      en: `${a.title}. Authoritative EU crisis mapping is available for this area.`,
      uk: `${a.title}. Для цієї території доступне офіційне кризове картографування ЄС.`,
    },
    url: a.url,
    region,
  };
}

/** Banners for an oblast pcode (e.g. "UA14"). */
export function bannersForOblast(
  activations: EmsActivation[],
  pcode: string,
  opts: { radiusKm?: number } = {},
): ActivationBanner[] {
  const oblast = OBLAST_CENTROIDS[pcode];
  if (!oblast) return [];
  const radius = opts.radiusKm ?? 200;
  return activations
    .filter((a) => a.centroid && flatDistanceKm(a.centroid, oblast.center) <= radius)
    .map((a) => bannerFor(a, pcode));
}

/** Banners for an arbitrary point the user is viewing. */
export function bannersForPoint(
  activations: EmsActivation[],
  point: [number, number],
  opts: { radiusKm?: number } = {},
): ActivationBanner[] {
  const radius = opts.radiusKm ?? 150;
  const region = `near:${point[0]},${point[1]}`;
  return activations
    .filter((a) => a.centroid && flatDistanceKm(a.centroid, point) <= radius)
    .map((a) => bannerFor(a, region));
}

/** All currently-active banners, keyed by oblast (for the region overview). */
export function allRegionBanners(activations: EmsActivation[]): Record<string, ActivationBanner[]> {
  const out: Record<string, ActivationBanner[]> = {};
  for (const pcode of Object.keys(OBLAST_CENTROIDS)) {
    const banners = bannersForOblast(activations, pcode);
    if (banners.length) out[pcode] = banners;
  }
  return out;
}
