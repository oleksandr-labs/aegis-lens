/**
 * Per-region recent ISW mentions.
 *
 * Given a stream of ingested ISW assessments, surface the most recent attributed
 * snippets that mention a given oblast — used by the region detail panel and the
 * "ISW today" widget. EN canonical; UK is AI-translated and flagged for native review.
 */

import type { AssessmentSnippet, IswAssessment, OblastCode } from "./types";
import { translateToUk, UK_NEEDS_NATIVE_REVIEW } from "./i18n";

/** Region keyword table (EN surface forms) → oblast code. */
const REGION_KEYWORDS: Array<{ code: OblastCode; nameEn: string; rx: RegExp }> = [
  { code: "UA-14", nameEn: "Donetsk", rx: /\b(Donetsk|Avdiivka|Pokrovsk|Bakhmut|Chasiv Yar|Vuhledar|Toretsk|Marinka|Lyman)\b/i },
  { code: "UA-09", nameEn: "Luhansk", rx: /\b(Luhansk|Kreminna|Svatove|Bilohorivka)\b/i },
  { code: "UA-63", nameEn: "Kharkiv", rx: /\b(Kharkiv|Kupiansk|Vovchansk)\b/i },
  { code: "UA-23", nameEn: "Zaporizhzhia", rx: /\b(Zaporizhzhia|Robotyne|Orikhiv)\b/i },
  { code: "UA-65", nameEn: "Kherson", rx: /\b(Kherson|Krynky|Dnipro River)\b/i },
  { code: "UA-59", nameEn: "Sumy", rx: /\b(Sumy)\b/i },
  { code: "UA-12", nameEn: "Dnipropetrovsk", rx: /\b(Dnipropetrovsk|Dnipro)\b/i },
];

const ATTRIBUTION = "Source: Institute for the Study of War (understandingwar.org)";

export interface RegionMention {
  oblastCode: OblastCode;
  oblastNameEn: string;
  assessmentId: string;
  assessmentDate: string;
  snippet: AssessmentSnippet;
}

/** Cap snippet length to stay inside fair-use boundaries (see COMPLIANCE.md). */
const SNIPPET_MAX_CHARS = 240;

function clampSnippet(text: string): string {
  const t = text.trim();
  return t.length > SNIPPET_MAX_CHARS ? `${t.slice(0, SNIPPET_MAX_CHARS).trim()}…` : t;
}

/** Pull the takeaway/sentence(s) of an assessment that mention `rx`. */
function matchingLines(assessment: IswAssessment, rx: RegExp): string[] {
  const candidates = [
    ...assessment.keyTakeaways,
    ...assessment.bodyText.split(/(?<=[.!?])\s+/),
  ];
  return candidates.filter((line) => rx.test(line));
}

/**
 * Extract per-region mentions from a set of assessments, newest first.
 * `oblastCode` optionally filters to a single region.
 */
export function regionMentions(
  assessments: IswAssessment[],
  oblastCode?: OblastCode,
  limitPerRegion = 3,
): RegionMention[] {
  const sorted = [...assessments].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));
  const out: RegionMention[] = [];
  const counts = new Map<OblastCode, number>();

  for (const assessment of sorted) {
    for (const region of REGION_KEYWORDS) {
      if (oblastCode && region.code !== oblastCode) continue;
      const used = counts.get(region.code) ?? 0;
      if (used >= limitPerRegion) continue;

      const lines = matchingLines(assessment, region.rx);
      if (lines.length === 0) continue;

      const en = clampSnippet(lines[0]);
      const snippet: AssessmentSnippet = {
        assessmentId: assessment.assessmentId,
        text: { en, uk: translateToUk(en) },
        translationReview: UK_NEEDS_NATIVE_REVIEW,
        attribution: ATTRIBUTION,
        url: assessment.url,
      };
      out.push({
        oblastCode: region.code,
        oblastNameEn: region.nameEn,
        assessmentId: assessment.assessmentId,
        assessmentDate: assessment.assessmentDate,
        snippet,
      });
      counts.set(region.code, used + 1);
    }
  }
  return out;
}
