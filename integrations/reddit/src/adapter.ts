/**
 * Reddit ingest adapter.
 *
 * Polls curated subreddits for new conflict-relevant posts.
 * Uses per-subreddit "after" cursors for incremental fetching.
 * Filters noise: deleted posts, low-score, recycled crossposts.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { redactPII } from "../../ingest/src/pii";
import { RedditApiClient } from "./client";
import { SUBREDDIT_REGISTRY, RedditSubredditRegistryService } from "./registry";
import type { RedditPost } from "./types";

const CONFLICT_KEYWORDS = [
  "ukraine", "russia", "missile", "drone", "explosion", "strike", "attack",
  "military", "frontline", "offensive", "kharkiv", "kherson", "zaporizhzhia",
  "mariupol", "bakhmut", "avdiivka", "donbas", "crimea",
  "україна", "росія", "ракета", "безпілотник", "вибух",
];

const NOISE_DOMAINS = new Set(["self", "i.redd.it", "v.redd.it", "reddit.com"]);

function isConflictRelevant(post: RedditPost): boolean {
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => text.includes(kw));
}

function inferSeverityFromScore(score: number, comments: number): 0 | 1 | 2 | 3 {
  const engagement = score + comments * 2;
  if (engagement > 5_000) return 3;
  if (engagement > 500) return 2;
  return 1;
}

export class RedditAdapter implements SourceAdapter {
  private readonly registry = new RedditSubredditRegistryService();
  /** subreddit → fullname of last seen post (t3_xxxx) */
  private readonly cursors = new Map<string, string>();

  constructor(private readonly client: RedditApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    const sinceUtc = Math.floor(since.getTime() / 1000);

    for (const subreddit of SUBREDDIT_REGISTRY) {
      try {
        const { posts } = await this.client.getSubredditPosts(subreddit.name, { limit: 25 });

        // Reddit /new is already sorted newest-first; stop when we hit posts older than since
        const newPosts = posts.filter(
          (p) =>
            p.created_utc > sinceUtc &&
            p.author !== "[deleted]" &&
            p.score > 0 &&
            !p.crosspost_parent,
        );

        for (const post of newPosts) {
          // Skip posts that need verified OP but author has no flair signal
          if (subreddit.requiresVerifiedOp && !post.link_flair_text) continue;
          if (!isConflictRelevant(post)) continue;

          yield {
            source_id: "reddit",
            external_id: post.id,
            collected_at: new Date().toISOString(),
            raw: post,
          };
        }

        if (newPosts.length > 0) {
          this.cursors.set(subreddit.name, `t3_${newPosts[0].id}`);
        }
      } catch {
        // Skip this subreddit on error
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const post = payload.raw as RedditPost;
    const sourceWeight = this.registry.getSourceWeight(post.subreddit);
    const cleanTitle = redactPII(post.title);
    const cleanBody = redactPII(post.selftext.slice(0, 1000));
    const text = cleanBody ? `${cleanTitle}\n\n${cleanBody}` : cleanTitle;

    return {
      event: {
        eventId: `reddit:${post.id}`,
        class: "military_action",
        subclass: "social_report",
        severity: inferSeverityFromScore(post.score, post.num_comments),
        summary: { en: cleanTitle, uk: null },
        location: null,
        occurredAt: new Date(post.created_utc * 1000).toISOString(),
        reportedAt: new Date(post.created_utc * 1000).toISOString(),
        sources: [
          {
            url: `https://reddit.com${post.permalink}`,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "en",
            contentHash: payload.external_id,
          },
        ],
        media: post.media?.oembed?.thumbnail_url
          ? [{ type: "image", url: post.media.oembed.thumbnail_url }]
          : [],
        originalText: text,
      },
      sourceWeight,
      language: "en",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
