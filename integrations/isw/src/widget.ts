/**
 * "ISW today" per-region widget provider.
 *
 * Produces a typed `IswRegionSummary` for a given oblast: today's ISW headline,
 * the assessed trend, short attributed snippets that mention the region, and the
 * net assessed control change (from the control-map diff). Consumed by the region
 * detail panel and the API route at /api/integrations/isw.
 *
 * EN canonical; UK strings are AI-translated and carry `translationReview = true`.
 */

import type {
  ControlMapDiff,
} from "./map-diff";
import type { IswAssessment, IswRegionSummary, OblastCode } from "./types";
import { regionMentions } from "./mentions";
import { translateToUk, UK_NEEDS_NATIVE_REVIEW } from "./i18n";

/** Oblast display names (subset relevant to the active front). */
const OBLAST_NAMES: Record<string, { en: string; uk: string }> = {
  "UA-14": { en: "Donetsk", uk: "Донецька" },
  "UA-09": { en: "Luhansk", uk: "Луганська" },
  "UA-63": { en: "Kharkiv", uk: "Харківська" },
  "UA-23": { en: "Zaporizhzhia", uk: "Запорізька" },
  "UA-65": { en: "Kherson", uk: "Херсонська" },
  "UA-59": { en: "Sumy", uk: "Сумська" },
  "UA-12": { en: "Dnipropetrovsk", uk: "Дніпропетровська" },
};

export interface RegionSummaryInput {
  oblastCode: OblastCode;
  assessments: IswAssessment[];
  /** Optional control-map diff to derive trend + net area change. */
  diff?: ControlMapDiff;
}

/** Derive a coarse trend label for the region from the control-map diff. */
function deriveTrend(
  oblastCode: OblastCode,
  diff: ControlMapDiff | undefined,
): { trend: IswRegionSummary["trend"]; netRussianGainKm2: number } {
  if (!diff) return { trend: "no_change", netRussianGainKm2: 0 };
  let net = 0;
  let contested = false;
  for (const c of diff.changes) {
    if (!c.oblastCodes.includes(oblastCode)) continue;
    if (c.toState === "contested") contested = true;
    if (c.toState === "ru_occupied" || c.toState === "ru_advance" || c.toState === "ru_claimed") {
      net += c.areaDeltaKm2;
    } else if (c.toState === "ua_controlled" || c.toState === "ua_counteroffensive") {
      net -= c.areaDeltaKm2;
    }
  }
  const rounded = Math.round(net * 100) / 100;
  let trend: IswRegionSummary["trend"];
  if (Math.abs(rounded) < 0.5) trend = contested ? "contested" : "stable";
  else if (rounded > 0) trend = "ru_advance";
  else trend = "ua_advance";
  return { trend, netRussianGainKm2: rounded };
}

/** Build the per-region "ISW today" summary. */
export function buildRegionSummary(input: RegionSummaryInput): IswRegionSummary {
  const { oblastCode, assessments, diff } = input;
  const names = OBLAST_NAMES[oblastCode] ?? { en: oblastCode, uk: oblastCode };
  const latest = [...assessments].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0];

  const mentions = regionMentions(assessments, oblastCode, 3);
  const snippets = mentions.map((m) => m.snippet);
  const { trend, netRussianGainKm2 } = deriveTrend(oblastCode, diff);

  const headlineEn =
    snippets[0]?.text.en ??
    latest?.keyTakeaways[0] ??
    `No ISW mentions for ${names.en} Oblast in the latest assessment.`;

  return {
    oblastCode,
    oblastNameEn: names.en,
    oblastNameUk: names.uk,
    assessmentDate: latest?.assessmentDate ?? "(none)",
    headline: { en: headlineEn, uk: translateToUk(headlineEn) },
    trend,
    snippets,
    netRussianGainKm2,
    sourceUrl: latest?.url ?? "https://www.understandingwar.org/",
    translationReview: UK_NEEDS_NATIVE_REVIEW,
  };
}

/** Convenience: build summaries for every known front-line oblast. */
export function buildAllRegionSummaries(
  assessments: IswAssessment[],
  diff?: ControlMapDiff,
): IswRegionSummary[] {
  return Object.keys(OBLAST_NAMES).map((oblastCode) =>
    buildRegionSummary({ oblastCode, assessments, diff }),
  );
}
