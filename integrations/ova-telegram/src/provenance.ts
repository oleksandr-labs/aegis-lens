/**
 * Task 9 — Quote the OVA source in an event's provenance chain.
 *
 * When an OVA post corroborates or originates an event, we attach a structured
 * provenance link so the UI can show "Official source: <OVA> — t.me/...". This
 * builds a `SourceCitation` (canonical v1 shape) plus a richer, human-facing
 * provenance record (institution label, trust tier, verbatim quote, permalink).
 *
 * The trust tier is recorded explicitly: OVA = "official_of_record", the highest
 * tier this package emits (short of a Cabinet of Ministers statement).
 */

import type { SourceCitation } from "../../../packages/event-schema/src/v1";
import type { OvaTranslatedPost, OvaPost } from "./types";
import { channelByUsername, oblastInfo } from "./registry";

export type TrustTier = "official_of_record" | "official_municipal" | "verified_osint";

export interface ProvenanceQuote {
  /** Canonical citation for AegisEventV1.citations[]. */
  citation: SourceCitation;
  trustTier: TrustTier;
  /** Institution display label. */
  institution: { uk: string; en: string; ru?: string };
  oblastCode: string;
  /** Short verbatim quote (UA original preserved) + derived translations. */
  quote: { uk: string; en?: string; ru?: string };
  permalink: string;
  postedAt: string;
}

function tierFor(post: OvaPost): TrustTier {
  return post.kind === "city_council" ? "official_municipal" : "official_of_record";
}

/** Build a provenance quote from a translated OVA post. */
export function buildProvenance(post: OvaTranslatedPost): ProvenanceQuote {
  const channel = channelByUsername(post.username);
  const info = oblastInfo(post.oblastCode);

  const institution = channel?.label ?? {
    uk: info?.nameUk ?? post.oblastCode,
    en: info?.nameEn ?? post.oblastCode,
  };

  const citation: SourceCitation = {
    sourceId: post.postId,
    sourceType: "official_statement",
    url: post.evidenceUrl,
    capturedAt: new Date().toISOString(),
  };

  return {
    citation,
    trustTier: tierFor(post),
    institution,
    oblastCode: post.oblastCode,
    quote: {
      uk: post.translations.uk.slice(0, 280),
      en: post.translations.en?.slice(0, 280),
      ru: post.translations.ru?.slice(0, 280),
    },
    permalink: post.evidenceUrl,
    postedAt: post.postedAt,
  };
}

/**
 * Append an OVA provenance citation to an existing chain (dedup by sourceId).
 * The OVA citation is prepended — official-of-record leads the provenance chain.
 */
export function quoteInChain(
  existing: SourceCitation[],
  prov: ProvenanceQuote,
): SourceCitation[] {
  if (existing.some((c) => c.sourceId === prov.citation.sourceId)) return existing;
  return [prov.citation, ...existing];
}
