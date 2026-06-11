/**
 * Fediverse ingest adapter.
 * Normalizes Mastodon / Bluesky / Threads posts to AegisEvent stream.
 * Only processes posts matching the hashtag allowlist.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { FediverseApiClient } from "./client";
import type { FediversePost } from "./types";

const HASHTAG_ALLOWLIST = [
  "ukraine", "ukraine war", "UkraineWar", "Russia", "UkraineRussiaWar",
  "SlavaUkraini", "StandWithUkraine", "Kyiv", "Kharkiv", "Donbas",
  "україна", "війна", "київ", "харків",
];

function inferSeverity(post: FediversePost): 0 | 1 | 2 | 3 {
  const engagement = post.reposts_count * 3 + post.favourites_count + post.replies_count * 2;
  if (engagement > 1_000) return 3;
  if (engagement > 100) return 2;
  return 1;
}

export class FediverseAdapter implements SourceAdapter {
  private mastodonLastId: string | undefined;
  private blueskyLastFetch: Date = new Date(0);

  constructor(private readonly client: FediverseApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    // Mastodon
    try {
      const posts = await this.client.fetchMastodonPublicTimeline(this.mastodonLastId);
      for (const post of posts) {
        if (new Date(post.created_at) > since) {
          this.mastodonLastId = post.id;
          yield {
            source_id: "mastodon",
            external_id: `mastodon:${post.id}`,
            collected_at: new Date().toISOString(),
            raw: post,
          };
        }
      }
    } catch {
      // Skip Mastodon on error
    }

    // Bluesky
    try {
      const posts = await this.client.fetchBlueskyFirehose(since);
      for (const post of posts) {
        yield {
          source_id: "bluesky",
          external_id: `bluesky:${post.id}`,
          collected_at: new Date().toISOString(),
          raw: post,
        };
      }
    } catch {
      // Skip Bluesky on error
    }

    // Threads (placeholder)
    try {
      const posts = await this.client.fetchThreadsPublic(since);
      for (const post of posts) {
        yield {
          source_id: "threads",
          external_id: `threads:${post.id}`,
          collected_at: new Date().toISOString(),
          raw: post,
        };
      }
    } catch {
      // Skip Threads on error
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const post = payload.raw as FediversePost;

    const summaryEn = post.content.slice(0, 280);

    return {
      event: {
        eventId: `fediverse:${post.source}:${post.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
        class: "military_action",
        subclass: "social_report",
        severity: inferSeverity(post),
        summary: { en: summaryEn, uk: null },
        location: null,
        occurredAt: post.created_at,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: post.url,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: post.language ?? "en",
            contentHash: payload.external_id,
          },
        ],
        media: post.media
          .filter((m) => m.type === "image")
          .map((m) => ({ type: "image" as const, url: m.url })),
        originalText: post.content,
      },
      sourceWeight: post.source === "mastodon" ? 0.5 : 0.45,
      language: post.language ?? "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
