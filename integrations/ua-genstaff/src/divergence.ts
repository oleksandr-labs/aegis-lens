/**
 * Official-vs-OSINT divergence detection (task 10).
 *
 * Compares an official claim (General Staff / MoD) against the corresponding
 * OSINT picture (e.g. ISW assessments, geolocated combat footage, equipment-loss
 * trackers like Oryx) for the same time window + region, and flags where they
 * AGREE, where OSINT is SILENT, or where they DIVERGE.
 *
 * NEUTRALITY (critical for this YMYL-adjacent module): divergence is reported as
 * a neutral observation — "official says X; OSINT-tracked Y; Δ = …" — NOT as a
 * judgement that either side is lying. The output is an analyst aid, not a
 * verdict. Both inputs are passed in via minimal structural types so this
 * package stays loosely coupled to the OSINT integrations.
 */

import type { GenStaffDailySummary, LossCategory, OblastCode } from "./types";
import { LOSS_CATEGORY_META } from "./types";
import { OBLASTS } from "./sources";

/** A minimal OSINT loss observation (e.g. from Oryx visually-confirmed counts). */
export interface OsintLossObservation {
  category: LossCategory;
  /** OSINT-tracked count for the SAME measure (e.g. visually confirmed total). */
  count: number;
  /** Method label, e.g. "oryx_visually_confirmed". */
  method: string;
  asOf: string;
}

/** A minimal OSINT activity observation for a frontline direction / oblast. */
export interface OsintActivityObservation {
  oblast: OblastCode;
  /** Free OSINT note (e.g. ISW control-change assessment). */
  noteEn: string;
  source: string;
  asOf: string;
}

export type DivergenceKind =
  | "agreement"      // figures within tolerance / both report activity
  | "osint_silent"   // official reports it, OSINT has nothing comparable
  | "divergence";    // both have figures but they differ beyond tolerance

export interface LossDivergence {
  category: LossCategory;
  label: { uk: string; en: string };
  officialTotal: number;
  /** OSINT comparator, if any (different methodology — see note). */
  osintCount?: number;
  osintMethod?: string;
  kind: DivergenceKind;
  /** official − osint (only when both present). */
  delta?: number;
  /** Neutral, non-editorialised explanation. */
  note: { uk: string; en: string };
}

export interface DivergenceReport {
  date: string;
  generatedAt: string;
  losses: LossDivergence[];
  activity: Array<{
    oblast: OblastCode;
    oblastName: { uk: string; en: string };
    officialMentioned: boolean;
    osintNoteEn?: string;
    osintSource?: string;
    kind: DivergenceKind;
  }>;
  counts: Record<DivergenceKind, number>;
  /** Standing disclaimer surfaced in the UI. */
  disclaimer: { uk: string; en: string };
}

const DISCLAIMER = {
  uk:
    "Розбіжність наведено нейтрально: офіційні дані та OSINT використовують різні методології " +
    "(офіційний облік vs візуально підтверджені втрати). Розбіжність не є твердженням про " +
    "недостовірність жодної зі сторін.",
  en:
    "Divergence is shown neutrally: official figures and OSINT use different methodologies " +
    "(official tally vs visually-confirmed losses). A divergence is NOT a claim that either " +
    "side is inaccurate.",
};

/**
 * Detect divergence between an official daily summary and OSINT observations.
 * `tolerancePct` (default 0.25) is how far OSINT may sit below the official
 * figure before it counts as a divergence (OSINT under-counts by design, so the
 * comparison is one-sided and explicitly noted).
 */
export function detectDivergence(
  summary: GenStaffDailySummary,
  osint: { losses?: OsintLossObservation[]; activity?: OsintActivityObservation[] } = {},
  opts: { tolerancePct?: number } = {},
): DivergenceReport {
  const tol = opts.tolerancePct ?? 0.25;
  const osintLossByCat = new Map<LossCategory, OsintLossObservation>();
  for (const o of osint.losses ?? []) osintLossByCat.set(o.category, o);

  const losses: LossDivergence[] = summary.losses.map((l) => {
    const meta = LOSS_CATEGORY_META[l.category];
    const o = osintLossByCat.get(l.category);
    if (!o) {
      return {
        category: l.category,
        label: { uk: meta.labelUk, en: meta.labelEn },
        officialTotal: l.total,
        kind: "osint_silent",
        note: {
          uk: `OSINT-трекер не надає співставного показника для «${meta.labelUk}».`,
          en: `No comparable OSINT measure available for "${meta.labelEn}".`,
        },
      };
    }
    const delta = l.total - o.count;
    // OSINT visually-confirmed is expected ≤ official. Flag divergence only if
    // OSINT EXCEEDS official, or sits below by more than tolerance (large gap).
    const ratio = o.count / Math.max(1, l.total);
    const kind: DivergenceKind =
      o.count > l.total ? "divergence" : ratio < 1 - tol ? "divergence" : "agreement";
    return {
      category: l.category,
      label: { uk: meta.labelUk, en: meta.labelEn },
      officialTotal: l.total,
      osintCount: o.count,
      osintMethod: o.method,
      kind,
      delta,
      note: {
        uk:
          kind === "agreement"
            ? `Офіційні дані та OSINT (${o.method}) узгоджуються в межах допуску.`
            : `Δ=${delta} між офіційним обліком (${l.total}) та OSINT (${o.count}, ${o.method}). Різні методології.`,
        en:
          kind === "agreement"
            ? `Official and OSINT (${o.method}) agree within tolerance.`
            : `Δ=${delta} between official tally (${l.total}) and OSINT (${o.count}, ${o.method}). Different methodologies.`,
      },
    };
  });

  const officialOblasts = new Set<OblastCode>(summary.regions);
  const osintByOblast = new Map<OblastCode, OsintActivityObservation>();
  for (const a of osint.activity ?? []) osintByOblast.set(a.oblast, a);
  const allOblasts = new Set<OblastCode>([...officialOblasts, ...osintByOblast.keys()]);

  const activity = [...allOblasts].sort().map((code) => {
    const officialMentioned = officialOblasts.has(code);
    const o = osintByOblast.get(code);
    const kind: DivergenceKind =
      officialMentioned && o ? "agreement" : officialMentioned && !o ? "osint_silent" : "divergence";
    return {
      oblast: code,
      oblastName: { uk: OBLASTS[code].nameUk, en: OBLASTS[code].nameEn },
      officialMentioned,
      osintNoteEn: o?.noteEn,
      osintSource: o?.source,
      kind,
    };
  });

  const counts: Record<DivergenceKind, number> = { agreement: 0, osint_silent: 0, divergence: 0 };
  for (const l of losses) counts[l.kind]++;
  for (const a of activity) counts[a.kind]++;

  return {
    date: summary.date,
    generatedAt: new Date().toISOString(),
    losses,
    activity,
    counts,
    disclaimer: DISCLAIMER,
  };
}
