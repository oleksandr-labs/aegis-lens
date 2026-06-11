/**
 * Fediverse client — Mastodon, Bluesky (AT Protocol), Threads.
 *
 * Mastodon: public timeline API (ActivityPub, no auth required for public posts).
 * Bluesky: AT Protocol public Firehose (com.atproto.sync.subscribeRepos) polled via XRPC.
 * Threads: Meta Content Publishing API (limited, auth required).
 *
 * Rate limits:
 * - Mastodon: instance-specific, typically 300 req/5min; no auth = lower limits.
 * - Bluesky: public XRPC endpoints, ~3,000 req/5min.
 * - Threads: 200 req/hour per user token.
 */

import type {
  FediverseClientConfig,
  FediverseClient,
  FediversePost,
  FediverseSource,
} from "./types";

const DEFAULT_BLUESKY_PDS = "https://bsky.social";
const MASTODON_POLL_INTERVAL_MS = 30_000;
const BLUESKY_POLL_INTERVAL_MS = 10_000;

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

interface MastodonStatus {
  id: string;
  url: string;
  content: string;
  created_at: string;
  language: string | null;
  account: { acct: string; display_name: string };
  tags: Array<{ name: string }>;
  media_attachments: Array<{ type: string; url: string; description: string | null }>;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  visibility: string;
}

interface BlueskyPost {
  uri: string;
  cid: string;
  author: { did: string; handle: string; displayName?: string };
  record: {
    text: string;
    createdAt: string;
    langs?: string[];
    facets?: Array<{ features: Array<{ tag?: string }> }>;
  };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
}

export class FediverseApiClient implements FediverseClient {
  private lastMastodonRequest = 0;
  private lastBlueskyRequest = 0;

  constructor(private readonly config: FediverseClientConfig) {}

  private matchesAllowlist(tags: string[]): boolean {
    if (this.config.hashtagAllowlist.length === 0) return true;
    const lower = tags.map((t) => t.toLowerCase());
    return this.config.hashtagAllowlist.some((allowed) =>
      lower.includes(allowed.toLowerCase()),
    );
  }

  async fetchMastodonPublicTimeline(sinceId?: string): Promise<FediversePost[]> {
    const now = Date.now();
    const elapsed = now - this.lastMastodonRequest;
    if (elapsed < MASTODON_POLL_INTERVAL_MS) {
      await new Promise<void>((r) =>
        setTimeout(r, MASTODON_POLL_INTERVAL_MS - elapsed),
      );
    }

    const instanceUrl =
      this.config.mastodonInstanceUrl ?? "https://mastodon.social";
    const url = new URL(`${instanceUrl}/api/v1/timelines/public`);
    url.searchParams.set("local", "false");
    url.searchParams.set("limit", String(this.config.maxPostsPerPoll ?? 40));
    if (sinceId) url.searchParams.set("since_id", sinceId);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    this.lastMastodonRequest = Date.now();

    if (!res.ok) {
      throw new Error(`Mastodon API ${res.status}: ${await res.text()}`);
    }

    const statuses = (await res.json()) as MastodonStatus[];

    return statuses
      .filter(
        (s) =>
          s.visibility === "public" &&
          this.matchesAllowlist(s.tags.map((t) => t.name)),
      )
      .map(
        (s): FediversePost => ({
          id: s.id,
          source: "mastodon",
          url: s.url,
          content: stripHtml(s.content),
          author_handle: s.account.acct,
          author_display_name: s.account.display_name,
          created_at: s.created_at,
          language: s.language ?? undefined,
          tags: s.tags.map((t) => t.name),
          media: s.media_attachments.map((m) => ({
            type: m.type as FediversePost["media"][0]["type"],
            url: m.url,
            description: m.description ?? undefined,
          })),
          replies_count: s.replies_count,
          reposts_count: s.reblogs_count,
          favourites_count: s.favourites_count,
          instance: new URL(instanceUrl).hostname,
        }),
      );
  }

  async fetchBlueskyFirehose(since: Date): Promise<FediversePost[]> {
    const now = Date.now();
    const elapsed = now - this.lastBlueskyRequest;
    if (elapsed < BLUESKY_POLL_INTERVAL_MS) {
      await new Promise<void>((r) =>
        setTimeout(r, BLUESKY_POLL_INTERVAL_MS - elapsed),
      );
    }

    const pdsUrl = this.config.blueskyPdsUrl ?? DEFAULT_BLUESKY_PDS;

    // Use search XRPC endpoint for hashtag-scoped queries
    const posts: FediversePost[] = [];

    for (const hashtag of this.config.hashtagAllowlist.slice(0, 5)) {
      try {
        const url = new URL(`${pdsUrl}/xrpc/app.bsky.feed.searchPosts`);
        url.searchParams.set("q", `#${hashtag}`);
        url.searchParams.set("limit", "25");
        url.searchParams.set("since", since.toISOString());

        const res = await fetch(url.toString(), {
          headers: { "User-Agent": "AegisLens/1.0" },
        });

        if (!res.ok) continue;

        const data = (await res.json()) as { posts: BlueskyPost[] };

        for (const post of data.posts ?? []) {
          const tags = (post.record.facets ?? [])
            .flatMap((f) => f.features)
            .map((f) => f.tag)
            .filter((t): t is string => Boolean(t));

          posts.push({
            id: post.uri,
            source: "bluesky",
            url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`,
            content: post.record.text,
            author_handle: post.author.handle,
            author_display_name: post.author.displayName ?? post.author.handle,
            created_at: post.record.createdAt,
            language: post.record.langs?.[0],
            tags,
            media: [],
            replies_count: post.replyCount ?? 0,
            reposts_count: post.repostCount ?? 0,
            favourites_count: post.likeCount ?? 0,
            instance: post.author.did,
          });
        }
      } catch {
        // Fail-soft per hashtag
      }
    }

    this.lastBlueskyRequest = Date.now();
    return posts;
  }

  async fetchThreadsPublic(since: Date): Promise<FediversePost[]> {
    if (!this.config.threadsAccessToken) {
      return [];
    }

    // Threads API is limited — public search not yet available
    // Placeholder: return empty until Meta expands public search API
    return [];
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const instanceUrl =
        this.config.mastodonInstanceUrl ?? "https://mastodon.social";
      const res = await fetch(`${instanceUrl}/api/v1/instance`, {
        headers: { "User-Agent": "AegisLens/1.0" },
      });
      if (res.ok) return { healthy: true };
      return { healthy: false, message: `Mastodon instance returned ${res.status}` };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
