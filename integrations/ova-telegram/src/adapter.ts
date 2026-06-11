/**
 * Adapter — normalize a translated OVA post → canonical Aegis Event v1.
 *
 * Maps to `packages/event-schema/src/v1.ts` (AegisEventV1). OVA posts are
 * official-of-record, so they carry a high source-confidence input and a
 * `verificationState` of "verified" when the channel passed authenticity.
 * Source/evidence URLs are preserved as `SourceCitation`s.
 */

import type {
  AegisEventV1,
  SourceCitation,
  LocalizedText,
} from "../../../packages/event-schema/src/v1";
import { getConfidenceLabel } from "../../../packages/event-schema/src/v1";
import type { OvaTranslatedPost, OvaConfidenceInput } from "./types";
import { OBLASTS } from "./types";

/** OVA official-of-record base trust (input to confidence). */
export const OVA_CHANNEL_TRUST = 0.85;

/** Combine the OVA confidence inputs into a single 0–1 score. */
export function ovaConfidence(input: OvaConfidenceInput): number {
  const c = input.channelTrust * input.authenticity * input.reputation;
  return Math.max(0, Math.min(1, Number(c.toFixed(3))));
}

export interface AdaptOptions {
  orgId: string;
  isPublic?: boolean;
  confidence?: OvaConfidenceInput;
  /** Override verification state (default verified for authentic OVA posts). */
  verified?: boolean;
}

/**
 * Map a translated OVA post into a canonical event. Class defaults to "other"
 * (an OVA advisory) — classification of the post body into drone/missile/etc.
 * is the job of dedicated classifiers; here we preserve the official statement
 * with full provenance and let downstream link/merge it.
 */
export function toAegisEvent(post: OvaTranslatedPost, opts: AdaptOptions): AegisEventV1 {
  const info = OBLASTS[post.oblastCode];
  const conf = opts.confidence
    ? ovaConfidence(opts.confidence)
    : OVA_CHANNEL_TRUST;

  const title: LocalizedText = {
    uk: post.translations.uk.slice(0, 140),
    en: post.translations.en?.slice(0, 140),
    ru: post.translations.ru?.slice(0, 140),
  };

  const citation: SourceCitation = {
    sourceId: post.postId,
    sourceType: "official_statement",
    url: post.evidenceUrl,
    capturedAt: new Date().toISOString(),
  };

  const verified = opts.verified ?? true;

  return {
    eventId: `ova:${post.postId}`,
    schemaVersion: "1.0.0",
    class: "other",
    subclass: "ova_advisory",
    location: info ? { lat: info.center[1], lon: info.center[0], uncertaintyM: 40_000 } : undefined,
    country: "UA",
    regionCode: post.oblastCode,
    severity: 2,
    confidence: conf,
    verificationState: verified ? "verified" : "unverified",
    occurredAt: post.postedAt,
    ingestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title,
    summary: title,
    originalText: post.textUk, // UA original preserved on the canonical event
    mediaUrls: post.mediaUrls,
    citations: [citation],
    orgId: opts.orgId,
    isPublic: opts.isPublic ?? true,
    isRetracted: false,
    rawPayload: { confidenceLabel: getConfidenceLabel(conf), provider: post.translationProvider },
  };
}
