/**
 * Task — Archive fallback via Wayback / academic dumps where lawful.
 *
 * X/Twitter posts are exceptionally volatile (deletions, suspensions, paywalled
 * API). This module:
 *   1. archives each ingested tweet URL via the shared Internet Archive
 *      Save-Page-Now client (reused from the youtube package — one implementation),
 *   2. documents the **academic-dump** fallback path for lawful bulk access.
 *
 * It does NOT scrape X or bypass the API; archival targets the public canonical
 * tweet URL only.
 */

import { WaybackClient, waybackConfigFromEnv, type ArchiveResult } from "../../youtube/src/wayback";
import type { XTweet } from "./types";

export { WaybackClient, waybackConfigFromEnv };
export type { ArchiveResult };

/** Canonical public URL for a tweet (the thing we archive). */
export function tweetUrl(tweet: Pick<XTweet, "id" | "author_username">): string {
  return `https://twitter.com/${tweet.author_username || "i"}/status/${tweet.id}`;
}

/**
 * Archive a tweet's canonical URL. Thin wrapper over the shared Wayback client so
 * the twitter adapter can populate `sources[].archiveUrl`.
 */
export async function archiveTweet(
  tweet: Pick<XTweet, "id" | "author_username">,
  client: WaybackClient = new WaybackClient(waybackConfigFromEnv()),
): Promise<ArchiveResult> {
  return client.archive(tweetUrl(tweet));
}

/** Archive many tweets, respecting the shared client's polite interval. */
export async function archiveTweets(
  tweets: Array<Pick<XTweet, "id" | "author_username">>,
  client: WaybackClient = new WaybackClient(waybackConfigFromEnv()),
): Promise<ArchiveResult[]> {
  return client.archiveAll(tweets.map(tweetUrl));
}

// ── Academic / bulk-dump fallback (documented contract) ─────────────────────

/**
 * Lawful bulk-access sources for historical/deleted tweets when the live API is
 * unavailable. These are *documented* options the platform may ingest from under
 * their respective terms — this is the contract, not an automated scraper.
 */
export type AcademicDumpSource =
  | "internet_archive_twitterstream" // IA's archived Twitter Streaming Grab
  | "academic_research_dataset"      // institution-held tweet-ID rehydration sets
  | "gdelt"                          // GDELT event/text dumps referencing posts
  | "researcher_api_archive";        // (historic) Academic Research tier archive

export interface AcademicDumpRef {
  source: AcademicDumpSource;
  /** Tweet IDs to rehydrate, or a dataset locator. */
  tweetIds?: string[];
  datasetUrl?: string;
  /** Terms gate: only ingest where the dataset license permits it. */
  licenseNote: string;
}

/**
 * Compliance gate. Returns true only when the dump source is one we have a lawful
 * basis to ingest from. Academic datasets are typically distributed as tweet-ID
 * lists for *rehydration*, NOT full content, to respect X's terms — honour that.
 */
export function isDumpIngestPermitted(ref: AcademicDumpRef): boolean {
  // Rehydration-by-ID and IA/GDELT public archives are the lawful paths.
  const lawful: AcademicDumpSource[] = [
    "internet_archive_twitterstream",
    "academic_research_dataset",
    "gdelt",
    "researcher_api_archive",
  ];
  if (!lawful.includes(ref.source)) return false;
  // An explicit license note is required before any ingest.
  return Boolean(ref.licenseNote && ref.licenseNote.trim().length > 0);
}
