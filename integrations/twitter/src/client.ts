/**
 * X / Twitter API v2 client.
 * Docs: https://developer.twitter.com/en/docs/twitter-api
 *
 * Supports: Bearer Token auth (App-only, read-only).
 * Rate limits enforced per endpoint with back-off.
 */

import type { XTweet, XMedia } from "./types";

const BASE_URL = "https://api.twitter.com/2";

const TWEET_FIELDS = [
  "created_at",
  "author_id",
  "lang",
  "geo",
  "entities",
  "referenced_tweets",
  "public_metrics",
  "attachments",
].join(",");

const EXPANSIONS = [
  "author_id",
  "attachments.media_keys",
  "referenced_tweets.id",
].join(",");

const USER_FIELDS = ["name", "username", "description", "location"].join(",");
const MEDIA_FIELDS = ["url", "preview_image_url", "alt_text", "width", "height"].join(",");

interface TwitterApiResponse<T> {
  data?: T;
  includes?: {
    users?: { id: string; name: string; username: string }[];
    media?: {
      media_key: string;
      type: string;
      url?: string;
      preview_image_url?: string;
      alt_text?: string;
      width?: number;
      height?: number;
    }[];
    tweets?: { id: string; text: string }[];
  };
  meta?: {
    newest_id?: string;
    oldest_id?: string;
    result_count?: number;
    next_token?: string;
  };
  errors?: { title: string; detail: string }[];
}

export interface SearchOptions {
  query: string;
  sinceId?: string;
  maxResults?: number;
  nextToken?: string;
}

export interface UserTimelineOptions {
  userId: string;
  sinceId?: string;
  maxResults?: number;
  nextToken?: string;
}

export class XApiClient {
  constructor(private readonly bearerToken: string) {}

  private async fetch<T>(path: string, params: Record<string, string> = {}): Promise<TwitterApiResponse<T>> {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        "User-Agent": "AegisLens/1.0",
      },
    });

    if (res.status === 429) {
      const reset = res.headers.get("x-rate-limit-reset");
      const waitMs = reset ? (Number(reset) * 1000 - Date.now()) : 15_000;
      throw Object.assign(new Error("X rate limited"), { retryAfterMs: Math.max(waitMs, 0) });
    }

    if (!res.ok) {
      throw new Error(`X API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<TwitterApiResponse<T>>;
  }

  /** Recent search (last 7 days) — available on Basic+ tier */
  async searchRecent(opts: SearchOptions): Promise<{
    tweets: XTweet[];
    nextToken?: string;
    newestId?: string;
  }> {
    const params: Record<string, string> = {
      query: `${opts.query} -is:retweet lang:uk OR lang:ru OR lang:en`,
      tweet_fields: TWEET_FIELDS,
      expansions: EXPANSIONS,
      user_fields: USER_FIELDS,
      media_fields: MEDIA_FIELDS,
      max_results: String(Math.min(opts.maxResults ?? 10, 100)),
    };
    if (opts.sinceId) params.since_id = opts.sinceId;
    if (opts.nextToken) params.next_token = opts.nextToken;

    const resp = await this.fetch<{ id: string; text: string; created_at: string; author_id: string; lang?: string; public_metrics?: Record<string, number> }[]>(
      "/tweets/search/recent",
      params,
    );

    const userMap = new Map(
      (resp.includes?.users ?? []).map((u) => [u.id, u]),
    );
    const mediaMap = new Map(
      (resp.includes?.media ?? []).map((m) => [m.media_key, m]),
    );

    const tweets: XTweet[] = (resp.data ?? []).map((t) => {
      const author = userMap.get(t.author_id);
      return {
        id: t.id,
        text: t.text,
        author_id: t.author_id,
        author_username: author?.username ?? "",
        author_name: author?.name ?? "",
        created_at: t.created_at,
        lang: t.lang,
        metrics: t.public_metrics
          ? {
              like_count: t.public_metrics["like_count"] ?? 0,
              retweet_count: t.public_metrics["retweet_count"] ?? 0,
              reply_count: t.public_metrics["reply_count"] ?? 0,
              quote_count: t.public_metrics["quote_count"] ?? 0,
            }
          : undefined,
      };
    });

    return {
      tweets,
      nextToken: resp.meta?.next_token,
      newestId: resp.meta?.newest_id,
    };
  }

  /** User timeline — fetch recent tweets from a tracked account */
  async getUserTimeline(opts: UserTimelineOptions): Promise<{
    tweets: XTweet[];
    nextToken?: string;
    newestId?: string;
  }> {
    const params: Record<string, string> = {
      tweet_fields: TWEET_FIELDS,
      expansions: EXPANSIONS,
      user_fields: USER_FIELDS,
      media_fields: MEDIA_FIELDS,
      max_results: String(Math.min(opts.maxResults ?? 5, 100)),
      exclude: "retweets",
    };
    if (opts.sinceId) params.since_id = opts.sinceId;
    if (opts.nextToken) params.pagination_token = opts.nextToken;

    const resp = await this.fetch<{ id: string; text: string; created_at: string; author_id: string; lang?: string }[]>(
      `/users/${opts.userId}/tweets`,
      params,
    );

    const userMap = new Map(
      (resp.includes?.users ?? []).map((u) => [u.id, u]),
    );

    const tweets: XTweet[] = (resp.data ?? []).map((t) => {
      const author = userMap.get(t.author_id);
      return {
        id: t.id,
        text: t.text,
        author_id: t.author_id,
        author_username: author?.username ?? "",
        author_name: author?.name ?? "",
        created_at: t.created_at,
        lang: t.lang,
      };
    });

    return {
      tweets,
      nextToken: resp.meta?.next_token,
      newestId: resp.meta?.newest_id,
    };
  }

  /** Look up user ID by username */
  async getUserByUsername(username: string): Promise<{ id: string; name: string; username: string } | null> {
    const resp = await this.fetch<{ id: string; name: string; username: string }>(
      `/users/by/username/${username}`,
      { user_fields: USER_FIELDS },
    );
    return resp.data ?? null;
  }
}
