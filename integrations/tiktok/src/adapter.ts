/**
 * TikTok Research API adapter.
 * Normalizes public TikTok posts to AegisEvent stream.
 *
 * Constraints:
 * - No face data captured
 * - Author display names only (no private profile data)
 * - Geo: region_code only, no precise coordinates
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { TikTokApiClient, TIKTOK_RESEARCH_ENABLED } from "./client";
import type { TikTokPost, TikTokSearchParams } from "./types";

const CONFLICT_HASHTAGS = [
  "ukraine", "russia", "war", "conflict", "kyiv", "kharkiv", "donbas",
  "україна", "росія", "війна", "київ", "харків", "донбас",
  "slava_ukraini", "stopwar", "uawar",
];

const SEARCH_QUERIES = [
  "ukraine war",
  "ukraine russia",
  "ukraine attack",
  "україна війна",
];

function inferSeverity(post: TikTokPost): 0 | 1 | 2 | 3 {
  const engagement = post.play_count / 1000 + post.digg_count + post.comment_count * 2;
  if (engagement > 100_000) return 3;
  if (engagement > 10_000) return 2;
  return 1;
}

export class TikTokAdapter implements SourceAdapter {
  private readonly cursors = new Map<string, number>();

  constructor(private readonly client: TikTokApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    if (!TIKTOK_RESEARCH_ENABLED) return;

    const startTs = Math.floor(since.getTime() / 1000);
    const endTs = Math.floor(Date.now() / 1000);

    for (const query of SEARCH_QUERIES) {
      try {
        const params: TikTokSearchParams = {
          query,
          start_date: startTs,
          end_date: endTs,
          max_count: 20,
          cursor: this.cursors.get(query) ?? 0,
        };

        const resp = await this.client.search(params);
        if (resp.error) continue;

        for (const post of resp.data.videos) {
          yield {
            source_id: "tiktok",
            external_id: post.id,
            collected_at: new Date().toISOString(),
            raw: post,
          };
        }

        if (resp.data.has_more) {
          this.cursors.set(query, resp.data.cursor);
        }
      } catch {
        // Skip on error — fail-soft
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const post = payload.raw as TikTokPost;

    const summaryEn = post.desc.slice(0, 280) || `TikTok video by @${post.author_unique_id}`;

    return {
      event: {
        eventId: `tiktok:${post.id}`,
        class: "military_action",
        subclass: "social_report",
        severity: inferSeverity(post),
        summary: { en: summaryEn, uk: null },
        // No precise geo — region code only
        location: null,
        occurredAt: new Date(post.create_time * 1000).toISOString(),
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: post.embed_link ?? `https://www.tiktok.com/@${post.author_unique_id}/video/${post.id}`,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "en",
            contentHash: post.id,
          },
        ],
        media: post.cover_image_url
          ? [{ type: "image", url: post.cover_image_url }]
          : [],
        originalText: post.desc,
      },
      sourceWeight: 0.4, // Unverified social; lower weight
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
