/**
 * Adapter: normalize an ISW assessment into the canonical Aegis Lens Event (v1).
 *
 * ISW assessments are analytical (not single-incident) so they map to a low-severity
 * "other"-class event that acts as an analytical anchor: other events can link to it
 * via `corroborates` (see citations.ts). We preserve the ISW URL as a SourceCitation
 * and forward a confidence input reflecting ISW's high analytical credibility.
 *
 * Per COMPLIANCE.md, the event stores only short snippets in `summary`, never the
 * full body — the full text lives in `rawPayload` for INTERNAL pipeline use and is
 * stripped before the public API.
 */

import type { AegisEventV1, SourceCitation } from "../../../packages/event-schema/src/v1";
import { EVENT_SCHEMA_VERSION } from "../../../packages/event-schema/src/v1";
import type { IswAssessment } from "./types";
import { translateToUk } from "./i18n";

/** ISW is a highly-credible analytical source; we forward a high confidence input. */
export const ISW_CONFIDENCE = 0.85;

export interface IswAdapterOptions {
  orgId?: string;
  isPublic?: boolean;
  /** Cap on snippet length (chars) stored in the public summary. */
  snippetMaxChars?: number;
}

/** Build a short, fair-use summary snippet from the assessment body. */
function buildSnippet(assessment: IswAssessment, maxChars: number): string {
  const first = assessment.keyTakeaways[0] ?? assessment.bodyText;
  const trimmed = first.slice(0, maxChars).trim();
  return trimmed.length < first.length ? `${trimmed}…` : trimmed;
}

/**
 * Normalize an ISW assessment → canonical AegisEventV1.
 * `dangerScore` / `dangerBand` are intentionally left unset (computed server-side).
 */
export function assessmentToEvent(
  assessment: IswAssessment,
  options: IswAdapterOptions = {},
): AegisEventV1 {
  const orgId = options.orgId ?? "public";
  const isPublic = options.isPublic ?? true;
  const maxChars = options.snippetMaxChars ?? 280;
  const now = new Date().toISOString();

  const snippetEn = buildSnippet(assessment, maxChars);
  const snippetUk = translateToUk(snippetEn);

  const citation: SourceCitation = {
    sourceId: assessment.assessmentId,
    sourceType: "official_statement",
    url: assessment.url,
    capturedAt: now,
  };

  return {
    eventId: `${assessment.assessmentId}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "other",
    subclass: "isw_assessment",
    country: "UA",
    severity: 1,
    confidence: ISW_CONFIDENCE,
    verificationState: "verified",
    occurredAt: `${assessment.assessmentDate}T00:00:00Z`,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: assessment.title.en,
      uk: assessment.title.uk ?? translateToUk(assessment.title.en),
    },
    summary: {
      en: snippetEn,
      uk: snippetUk,
    },
    // Full body kept for internal pipeline (entity extraction); stripped before public API.
    originalText: assessment.bodyText,
    citations: [citation],
    orgId,
    isPublic,
    isRetracted: false,
    rawPayload: assessment,
  };
}
