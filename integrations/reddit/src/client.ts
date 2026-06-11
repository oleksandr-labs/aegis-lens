/**
 * Reddit API client using OAuth2 client_credentials (script/app).
 * Docs: https://www.reddit.com/dev/api/
 *
 * Rate limit: 100 requests/minute per OAuth token.
 */

import type { RedditPost, RedditComment } from "./types";

const BASE_URL = "https://oauth.reddit.com";
const AUTH_URL = "https://www.reddit.com/api/v1/access_token";

interface RedditListingChild<T> {
  kind: string;
  data: T;
}

interface RedditListing<T> {
  kind: "Listing";
  data: {
    after?: string;
    before?: string;
    children: RedditListingChild<T>[];
  };
}

export class RedditApiClient {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly userAgent = "AegisLens/1.0",
  ) {}

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 30_000) {
      return this.accessToken;
    }

    const creds = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": this.userAgent,
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      throw new Error(`Reddit OAuth failed: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = json.access_token;
    this.tokenExpiresAt = Date.now() + json.expires_in * 1000;
    return this.accessToken;
  }

  private async fetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const token = await this.ensureToken();
    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": this.userAgent,
      },
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("x-ratelimit-reset") ?? "60") * 1000;
      throw Object.assign(new Error("Reddit rate limited"), { retryAfterMs: retryAfter });
    }

    if (!res.ok) {
      throw new Error(`Reddit API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
  }

  /** Get new posts from a subreddit, sorted by new */
  async getSubredditPosts(subreddit: string, opts?: {
    limit?: number;
    after?: string;
    before?: string;
  }): Promise<{ posts: RedditPost[]; after?: string }> {
    const resp = await this.fetch<RedditListing<RedditPost>>(`/r/${subreddit}/new`, {
      limit: String(Math.min(opts?.limit ?? 25, 100)),
      ...(opts?.after ? { after: opts.after } : {}),
      ...(opts?.before ? { before: opts.before } : {}),
    });

    return {
      posts: resp.data.children.map((c) => c.data),
      after: resp.data.after,
    };
  }

  /** Search within a subreddit or globally */
  async search(opts: {
    query: string;
    subreddit?: string;
    sort?: "new" | "relevance" | "hot";
    timeFilter?: "hour" | "day" | "week" | "month";
    limit?: number;
    after?: string;
  }): Promise<{ posts: RedditPost[]; after?: string }> {
    const path = opts.subreddit ? `/r/${opts.subreddit}/search` : "/search";
    const resp = await this.fetch<RedditListing<RedditPost>>(path, {
      q: opts.query,
      sort: opts.sort ?? "new",
      t: opts.timeFilter ?? "day",
      limit: String(Math.min(opts.limit ?? 25, 100)),
      restrict_sr: opts.subreddit ? "1" : "0",
      type: "link",
      ...(opts.after ? { after: opts.after } : {}),
    });

    return {
      posts: resp.data.children.map((c) => c.data),
      after: resp.data.after,
    };
  }

  /** Get top-level comments for a post */
  async getPostComments(subreddit: string, postId: string, opts?: {
    limit?: number;
    depth?: number;
    sort?: "top" | "new" | "confidence";
  }): Promise<RedditComment[]> {
    const resp = await this.fetch<[RedditListing<RedditPost>, RedditListing<RedditComment>]>(
      `/r/${subreddit}/comments/${postId}`,
      {
        limit: String(Math.min(opts?.limit ?? 50, 100)),
        depth: String(opts?.depth ?? 2),
        sort: opts?.sort ?? "top",
      },
    );

    const flatten = (
      children: RedditListingChild<RedditComment & { replies?: RedditListing<RedditComment> }>[],
      depth = 0,
    ): RedditComment[] => {
      const results: RedditComment[] = [];
      for (const child of children) {
        if (child.kind !== "t1") continue;
        results.push({ ...child.data, depth, postId });
        if (child.data.replies?.data?.children) {
          results.push(...flatten(child.data.replies.data.children, depth + 1));
        }
      }
      return results;
    };

    return flatten(resp[1].data.children as RedditListingChild<RedditComment & { replies?: RedditListing<RedditComment> }>[]);
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.getSubredditPosts("ukraine", { limit: 1 });
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
