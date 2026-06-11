/**
 * Twitter/X ingest adapter.
 *
 * Polls tracked accounts' timelines and converts tweets to canonical events.
 * Uses per-account since_id cursors for incremental fetching.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { redactPII } from "../../ingest/src/pii";
import { XApiClient } from "./client";
import { ACCOUNT_REGISTRY, XAccountRegistryService } from "./registry";
import type { XTweet } from "./types";

const CONFLICT_KEYWORDS = [
  "missile", "drone", "explosion", "strike", "attack", "military",
  "ракета", "безпілотник", "вибух", "удар", "атака", "збройні",
  "war", "шахед", "ппо", "тривога",
];

function isConflictRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => lower.includes(kw));
}

function inferSeverityFromMetrics(
  metrics?: { retweet_count: number; like_count: number },
): 0 | 1 | 2 | 3 {
  if (!metrics) return 1;
  const engagement = metrics.retweet_count + metrics.like_count;
  if (engagement > 10_000) return 3;
  if (engagement > 1_000) return 2;
  return 1;
}

export class XAdapter implements SourceAdapter {
  private readonly registry = new XAccountRegistryService();
  /** account_id → last seen tweet id */
  private readonly cursors = new Map<string, string>();

  constructor(private readonly client: XApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    for (const account of ACCOUNT_REGISTRY) {
      const sinceId = this.cursors.get(account.username);

      let nextToken: string | undefined;
      let newestId: string | undefined;

      try {
        const { tweets, nextToken: nt, newestId: ni } = await this.client.getUserTimeline({
          userId: account.id,
          sinceId,
          maxResults: 10,
        });

        nextToken = nt;
        newestId = ni;

        for (const tweet of tweets) {
          if (!isConflictRelevant(tweet.text)) continue;
          yield {
            source_id: "twitter",
            external_id: tweet.id,
            collected_at: new Date().toISOString(),
            raw: tweet,
          };
        }

        if (newestId) this.cursors.set(account.username, newestId);
      } catch {
        // Skip this account on error — network or rate limit
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const tweet = payload.raw as XTweet;
    const account = this.registry.getByUsername(tweet.author_username);
    const sourceWeight = this.registry.getSourceWeight(tweet.author_username);
    const cleanText = redactPII(tweet.text);

    return {
      event: {
        eventId: `twitter:${tweet.id}`,
        class: "military_action",
        subclass: "unclassified",
        severity: inferSeverityFromMetrics(tweet.metrics),
        summary: { en: cleanText, uk: null },
        location: tweet.geo?.coordinates
          ? {
              lat: tweet.geo.coordinates.lat,
              lon: tweet.geo.coordinates.lon,
              precisionM: 10_000,
            }
          : null,
        occurredAt: tweet.created_at,
        reportedAt: tweet.created_at,
        sources: [
          {
            url: `https://twitter.com/${tweet.author_username}/status/${tweet.id}`,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: tweet.lang ?? "und",
            contentHash: payload.external_id,
          },
        ],
        media: [],
        originalText: cleanText,
      },
      sourceWeight,
      language: tweet.lang ?? "und",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const user = await this.client.getUserByUsername("Reuters");
      return { healthy: user !== null };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
