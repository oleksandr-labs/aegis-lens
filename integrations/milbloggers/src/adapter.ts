/**
 * Adapter: classified milblogger post → canonical Aegis Event v1.
 *
 * Maps a `ClassifiedPost` onto `packages/event-schema/src/v1.ts` (AegisEventV1),
 * preserving source/evidence URLs and forwarding a confidence input derived from
 * the source reputation + any corroboration boost.
 *
 * The `side` label is preserved into the event's subclass/title prefix so it is
 * never lost on the canonical surface; RU-side events also retain the opposition
 * caveat in the summary. (No false equivalence even after normalization.)
 *
 * This package does not import the event-schema package at build time (additive,
 * no cross-package coupling); the relevant shapes are mirrored locally so the
 * mapping is type-checked here and the canonical objects validate downstream.
 */

import type { ClassifiedPost, ContentClass } from "./types";

// ── Mirrored canonical shapes (subset) from packages/event-schema/src/v1.ts ──
type EventClass =
  | "drone" | "missile" | "airstrike" | "artillery" | "ground_combat"
  | "explosion" | "fire" | "infrastructure_damage" | "humanitarian" | "other";
type LocalizedText = { en?: string; uk?: string } & Record<string, string | undefined>;
interface SourceCitation {
  sourceId: string;
  sourceType: "telegram_channel" | "twitter" | "youtube" | "scraper";
  url?: string;
  capturedAt?: string;
}
interface AegisEventLike {
  eventId: string;
  schemaVersion: "1.0.0";
  class: EventClass;
  subclass?: string;
  country: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  verificationState: "unverified" | "in_review" | "verified" | "disputed" | "retracted";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: LocalizedText;
  summary?: LocalizedText;
  originalText?: string;
  mediaUrls?: string[];
  citations: SourceCitation[];
  orgId: string;
  isPublic: boolean;
  isRetracted: boolean;
}

const CLASS_MAP: Record<ContentClass, EventClass> = {
  frontline_report: "ground_combat",
  strike_claim: "airstrike",
  equipment_loss: "ground_combat",
  geolocation: "other",
  official_statement: "other",
  analysis: "other",
  humanitarian: "humanitarian",
  propaganda: "other",
  unclassified: "other",
};

function platformSourceType(post: ClassifiedPost): SourceCitation["sourceType"] {
  if (post.postId.startsWith("telegram:")) return "telegram_channel";
  if (post.postId.startsWith("x:")) return "twitter";
  if (post.postId.startsWith("youtube:")) return "youtube";
  return "scraper";
}

export interface AdaptOptions {
  orgId: string;
  /** Extra confidence from same-camp corroboration (0–0.3). */
  corroborationBoost?: number;
}

/** Normalize a classified post into a canonical-shaped event. */
export function toAegisEvent(post: ClassifiedPost, opts: AdaptOptions): AegisEventLike {
  const now = new Date().toISOString();
  // Confidence: reputation-weighted, plus bounded corroboration boost.
  // RU-side claims are capped low — they are NOT verified reporting.
  const baseConfidence = post.sourceReputation * post.classConfidence;
  const boosted = Math.min(1, baseConfidence + (opts.corroborationBoost ?? 0));
  const confidence = post.side === "ru" ? Math.min(0.35, boosted) : boosted;

  const sidePrefix = post.side === "ru" ? "[OPPOSING NARRATIVE] " : "";
  const sidePrefixUk = post.side === "ru" ? "[ПРОТИЛЕЖНИЙ НАРАТИВ] " : "";

  const summary: LocalizedText | undefined = post.side === "ru" && post.oppositionLabel
    ? { en: post.oppositionLabel.en, uk: post.oppositionLabel.uk, ru: post.oppositionLabel.ru }
    : undefined;

  return {
    eventId: `milblog:${post.postId}`,
    schemaVersion: "1.0.0",
    class: CLASS_MAP[post.contentClass],
    subclass: `milblogger:${post.side}:${post.contentClass}`,
    country: "UA",
    severity: post.contentClass === "strike_claim" ? 4 : 2,
    confidence,
    verificationState: "unverified",
    occurredAt: post.publishedAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `${sidePrefix}${post.contentClass} via @${post.accountId}`,
      uk: `${sidePrefixUk}${post.contentClass} від @${post.accountId}`,
    },
    summary,
    originalText: post.text,
    mediaUrls: post.mediaUrls,
    citations: [
      {
        sourceId: post.accountId,
        sourceType: platformSourceType(post),
        url: post.url,
        capturedAt: now,
      },
    ],
    orgId: opts.orgId,
    isPublic: post.side !== "ru", // opposition material stays internal by default
    isRetracted: false,
  };
}
