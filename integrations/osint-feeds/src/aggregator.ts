import 'server-only';
import type { OsintFeed } from './registry';

export interface OsintUpdate {
  feedId: string;
  content: string;
  timestamp: string;         // ISO-8601
  /** Heuristic confidence 0–1 based on trust tier and source type. */
  confidence: number;
  /** If true, the update must pass editorial review before entering the verified event stream. */
  requiresVerification: boolean;
  /** Original URL or deep link if available. */
  sourceUrl?: string;
}

/** Confidence heuristics per trust tier. */
const TIER_CONFIDENCE: Record<OsintFeed['trustTier'], number> = {
  verified: 0.75,
  community: 0.45,
  unvetted: 0.2,
};

/**
 * Stub aggregator for OSINT community feeds.
 *
 * Real implementation depends on the transport layer for each feed type:
 * - `telegram` feeds → @ua-map/telegram client (Sprint 2.58)
 * - `twitter` feeds → @ua-map/twitter client (Sprint 2.59)
 * - `rss` feeds → @ua-map/rss client (this sprint)
 * - `discord` feeds → planned (webhook or bot token)
 * - `api` feeds → feed-specific clients
 *
 * This function provides the normalisation contract that the ingest pipeline
 * expects regardless of transport.
 */
export async function aggregateFeedUpdates(
  feeds: OsintFeed[],
): Promise<OsintUpdate[]> {
  // Real implementation: dispatch to transport-specific fetch functions,
  // normalise, and merge. Stub returns empty arrays so the pipeline compiles.
  const results: OsintUpdate[] = [];

  for (const feed of feeds) {
    // Each feed integration (telegram, rss, twitter) returns items in a
    // normalised format; here we show the shape and apply the policy rules.
    const rawItems = await fetchFeedItems(feed);

    for (const raw of rawItems) {
      results.push({
        feedId: feed.id,
        content: raw.content,
        timestamp: raw.timestamp ?? new Date().toISOString(),
        confidence: TIER_CONFIDENCE[feed.trustTier],
        // RU-side sources + unvetted always require verification
        requiresVerification: feed.autoFlagVerification,
        sourceUrl: raw.url,
      });
    }
  }

  return results.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// ─── Internal stub — replace with real transport dispatch ────────────────────

interface RawFeedItem {
  content: string;
  timestamp?: string;
  url?: string;
}

/**
 * Dispatch to the appropriate transport client for a feed.
 * Currently stubs — real implementation wires to @ua-map/telegram, @ua-map/rss, etc.
 */
async function fetchFeedItems(feed: OsintFeed): Promise<RawFeedItem[]> {
  // TODO (Sprint 2.64+): wire transport adapters:
  // if (feed.type === 'rss' && feed.url) return fetchRssItems(feed);
  // if (feed.type === 'telegram' && feed.handle) return fetchTelegramItems(feed);
  // if (feed.type === 'twitter' && feed.handle) return fetchTwitterItems(feed);
  void feed; // suppress unused variable lint
  return [];
}
