/**
 * Daily "Genstaff summary" widget (task 9).
 *
 * Pure data shaper that turns a parsed GenStaffDailySummary into a compact,
 * render-ready view-model for a sidebar / dashboard widget: headline figures,
 * loss tally rows (with 24h deltas), top frontline directions, and referenced
 * regions — all uk/en/de, all citing the official source.
 *
 * NEUTRALITY: the widget LABELS every figure as "officially reported" and
 * carries the source citation; it does not present the numbers as
 * independently-verified facts. The React/HTML rendering lives in apps/web.
 */

import type {
  GenStaffDailySummary,
  LossCategory,
  OblastCode,
} from "./types";
import { LOSS_CATEGORY_META } from "./types";
import { OBLASTS } from "./sources";

export interface LossRow {
  category: LossCategory;
  label: { uk: string; en: string; de: string };
  total: number;
  /** Formatted "+N" delta string, or undefined if not reported. */
  delta?: number;
  deltaLabel?: string;
}

export interface DirectionRow {
  directionUk: string;
  directionEn?: string;
  engagements?: number;
  noteUk?: string;
  oblastName?: { uk: string; en: string };
}

export interface RegionChip {
  oblast: OblastCode;
  name: { uk: string; en: string };
}

export interface GenStaffWidget {
  date: string;
  generatedAt: string;
  /** Headline label trio. */
  headline: { uk: string; en: string; de: string };
  totalEngagements?: number;
  /** Loss rows in canonical category order. */
  losses: LossRow[];
  directions: DirectionRow[];
  regions: RegionChip[];
  /** Source attribution — MUST be displayed by the UI. */
  attribution: { uk: string; en: string; de: string };
  sourceUrl?: string;
  /** True if some figures were unparseable. */
  partial: boolean;
}

const LOSS_ORDER: LossCategory[] = [
  "personnel", "tanks", "afv", "artillery", "mlrs", "air_defense",
  "aircraft", "helicopters", "uav", "cruise_missiles",
  "ships_boats", "submarines", "vehicles_fuel", "special_equipment",
];

/** Build the widget view-model from a parsed daily summary. */
export function buildGenStaffWidget(
  summary: GenStaffDailySummary,
  opts: { now?: number; topDirections?: number } = {},
): GenStaffWidget {
  const now = opts.now ?? Date.now();
  const byCat = new Map<LossCategory, { total: number; delta?: number }>();
  for (const l of summary.losses) byCat.set(l.category, { total: l.total, delta: l.delta });

  const losses: LossRow[] = LOSS_ORDER.filter((c) => byCat.has(c)).map((c) => {
    const v = byCat.get(c)!;
    const meta = LOSS_CATEGORY_META[c];
    return {
      category: c,
      label: { uk: meta.labelUk, en: meta.labelEn, de: meta.labelDe },
      total: v.total,
      delta: v.delta,
      deltaLabel: v.delta !== undefined ? `${v.delta >= 0 ? "+" : ""}${v.delta}` : undefined,
    };
  });

  const directions: DirectionRow[] = summary.directions
    .slice(0, opts.topDirections ?? 6)
    .map((d) => ({
      directionUk: d.directionUk,
      directionEn: d.directionEn,
      engagements: d.engagements,
      noteUk: d.noteUk,
      oblastName: d.oblast ? { uk: OBLASTS[d.oblast].nameUk, en: OBLASTS[d.oblast].nameEn } : undefined,
    }));

  const regions: RegionChip[] = summary.regions.map((r) => ({
    oblast: r,
    name: { uk: OBLASTS[r].nameUk, en: OBLASTS[r].nameEn },
  }));

  return {
    date: summary.date,
    generatedAt: new Date(now).toISOString(),
    headline: {
      uk: `Зведення Генштабу ЗСУ — ${summary.date}`,
      en: `General Staff daily summary — ${summary.date}`,
      de: `Generalstab-Tagesbericht — ${summary.date}`,
    },
    totalEngagements: summary.totalEngagements,
    losses,
    directions,
    regions,
    attribution: {
      uk: "Джерело: Генеральний штаб ЗСУ (офіційні дані, наведені без редагування)",
      en: "Source: General Staff of the AFU (figures as officially reported)",
      de: "Quelle: Generalstab der Streitkräfte der Ukraine (offiziell gemeldete Zahlen)",
    },
    sourceUrl: summary.url,
    partial: summary.partial,
  };
}
