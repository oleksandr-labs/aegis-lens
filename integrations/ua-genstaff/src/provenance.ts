/**
 * Citation in event provenance (task 11).
 *
 * Builds the official-source provenance + canonical SourceCitation for any
 * record ingested by this package. Official military comms are the HIGHEST trust
 * tier, but the citation framing stays neutral: it records WHO published the
 * claim and WHERE, with `sourceType: "official_statement"`, without asserting
 * independent verification. Downstream danger-scoring / verification workflows
 * decide the `verificationState`.
 */

import type { SourceCitation } from "@ua-map/event-schema";
import type { Branch, OfficialProvenance, RawOfficialPost, TrustTier } from "./types";
import { BRANCH_META } from "./types";
import { getChannel } from "./sources";

/** Trust tier for an official military source — always "official" here. */
export function trustTierForBranch(_branch: Branch): TrustTier {
  return "official";
}

/** Build the package-level provenance descriptor for a raw post. */
export function buildProvenance(
  post: RawOfficialPost,
  opts: { carriesOfficialFigures?: boolean } = {},
): OfficialProvenance {
  const meta = BRANCH_META[post.branch];
  return {
    authority: { uk: meta.authorityUk, en: meta.authorityEn },
    branch: post.branch,
    trustTier: trustTierForBranch(post.branch),
    sourceChannelId: post.channelId,
    url: post.url,
    capturedAt: new Date().toISOString(),
    carriesOfficialFigures:
      opts.carriesOfficialFigures ?? post.commKind === "daily_summary",
  };
}

/**
 * Build a canonical SourceCitation (packages/event-schema) for a raw post.
 * `sourceType` is "official_statement" — the canonical tag for official comms.
 */
export function toSourceCitation(post: RawOfficialPost): SourceCitation {
  const channel = getChannel(post.channelId);
  return {
    sourceId: post.channelId,
    sourceType: "official_statement",
    url: post.url ?? channel?.url,
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Render a human-readable attribution line (uk/en/de) for the UI. The product
 * MUST display this next to any figure carried from an official source.
 */
export function attributionLine(post: RawOfficialPost): { uk: string; en: string; de: string } {
  const meta = BRANCH_META[post.branch];
  return {
    uk: `Джерело: ${meta.authorityUk} (офіційне повідомлення)`,
    en: `Source: ${meta.authorityEn} (official statement)`,
    de: `Quelle: ${meta.authorityEn} (offizielle Mitteilung)`,
  };
}
