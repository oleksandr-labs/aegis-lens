/**
 * Citation chain on related events.
 *
 * When a platform event (a strike, an advance, a control change) is corroborated or
 * contradicted by an ISW assessment, this module builds the citation linkage:
 *   - a canonical `SourceCitation` pointing at the ISW assessment, and
 *   - an `EventLink` from the related event to the ISW assessment-event.
 *
 * This is how "double trust signal" surfaces in the UI: an event card can show
 * "Corroborated by ISW (June 5) →" with a proper attribution + link. It also keeps
 * a citation CHAIN — ISW assessments themselves cite primary OSINT, so we record the
 * provenance depth (event → ISW → ISW's cited primary source) where known.
 */

import type { EventLink, SourceCitation } from "../../../packages/event-schema/src/v1";
import type { IswAssessment } from "./types";

export type CitationRelation = "corroborates" | "contradicts" | "same_incident";

export interface IswCitationChain {
  /** The related platform event being annotated. */
  relatedEventId: string;
  /** The ISW assessment-event id (from adapter.assessmentToEvent). */
  iswEventId: string;
  relation: CitationRelation;
  /** Citation to attach to the related event's `citations[]`. */
  citation: SourceCitation;
  /** Link to attach to the related event's `links[]`. */
  link: EventLink;
  /** Human-readable attribution for the UI (EN + uk). */
  attribution: { en: string; uk: string };
  /**
   * Provenance depth: primary sources ISW itself cited (where parsed from text),
   * so the chain is event → ISW → primary. URLs only.
   */
  primarySourceUrls: string[];
}

/** Pull bare URLs out of an assessment body (ISW links its primary sources inline). */
export function extractPrimarySourceUrls(assessment: IswAssessment): string[] {
  const urls = new Set<string>();
  const rx = /https?:\/\/[^\s"'<>)]+/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(assessment.bodyText)) !== null) {
    // Don't double-count the assessment's own canonical URL.
    if (m[0] !== assessment.url) urls.add(m[0].replace(/[.,;]+$/, ""));
  }
  return [...urls].slice(0, 20);
}

/**
 * Build a citation chain linking a related event to an ISW assessment.
 *
 * @param relatedEventId  the event the user is viewing
 * @param iswEventId      the ISW assessment-event id (adapter output)
 * @param assessment      the ISW assessment (for URL + date + primary sources)
 * @param relation        how the ISW assessment relates to the event
 */
export function buildCitationChain(
  relatedEventId: string,
  iswEventId: string,
  assessment: IswAssessment,
  relation: CitationRelation = "corroborates",
): IswCitationChain {
  const citation: SourceCitation = {
    sourceId: assessment.assessmentId,
    sourceType: "official_statement",
    url: assessment.url,
    capturedAt: new Date().toISOString(),
  };

  const link: EventLink = {
    eventId: iswEventId,
    linkType: relation,
  };

  const dateLabel = assessment.assessmentDate;
  const relationLabels: Record<CitationRelation, { en: string; uk: string }> = {
    corroborates: { en: "Corroborated by ISW", uk: "Підтверджено ISW" },
    contradicts: { en: "Contradicted by ISW", uk: "Спростовано ISW" },
    same_incident: { en: "Same incident per ISW", uk: "Той самий інцидент за ISW" },
  };
  const rl = relationLabels[relation];

  return {
    relatedEventId,
    iswEventId,
    relation,
    citation,
    link,
    attribution: {
      en: `${rl.en} (${dateLabel}) — Institute for the Study of War`,
      uk: `${rl.uk} (${dateLabel}) — Інститут вивчення війни`,
    },
    primarySourceUrls: extractPrimarySourceUrls(assessment),
  };
}

/** Build citation chains for many related events at once. */
export function buildCitationChains(
  relations: Array<{ relatedEventId: string; relation?: CitationRelation }>,
  iswEventId: string,
  assessment: IswAssessment,
): IswCitationChain[] {
  return relations.map((r) =>
    buildCitationChain(r.relatedEventId, iswEventId, assessment, r.relation ?? "corroborates"),
  );
}
