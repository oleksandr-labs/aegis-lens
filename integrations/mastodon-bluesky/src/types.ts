/**
 * Fediverse integration types — Mastodon, Bluesky (AT Protocol), Threads.
 */

export type FediverseSource = "mastodon" | "bluesky" | "threads";

export interface FediversePost {
  /** Unique ID within the source platform */
  id: string;
  /** Source platform */
  source: FediverseSource;
  /** Post URL */
  url: string;
  /** Plain-text content (HTML stripped) */
  content: string;
  /** Author handle (public) */
  author_handle: string;
  /** Author display name (public) */
  author_display_name: string;
  /** Creation timestamp ISO-8601 */
  created_at: string;
  /** Language code (BCP-47) */
  language?: string;
  /** Hashtags in post */
  tags: string[];
  /** Media attachments (images only, no video download) */
  media: Array<{
    type: "image" | "gifv" | "video" | "audio";
    url: string;
    description?: string;
  }>;
  /** Reply count */
  replies_count: number;
  /** Boost/retweet/repost count */
  reposts_count: number;
  /** Favourite/like count */
  favourites_count: number;
  /** Server/instance (Mastodon) or DID (Bluesky) */
  instance?: string;
  /** True if from a verified/known account */
  is_verified?: boolean;
}

export interface FediverseClientConfig {
  /** Mastodon instance base URL, e.g. https://mastodon.social */
  mastodonInstanceUrl?: string;
  /** Bluesky PDS URL, default https://bsky.social */
  blueskyPdsUrl?: string;
  /** Threads API access token (optional, limited API) */
  threadsAccessToken?: string;
  /** Hashtag allowlist — only posts with these tags are ingested */
  hashtagAllowlist: string[];
  /** Maximum posts per poll */
  maxPostsPerPoll?: number;
}

export interface FediverseClient {
  fetchMastodonPublicTimeline(sinceId?: string): Promise<FediversePost[]>;
  fetchBlueskyFirehose(since: Date): Promise<FediversePost[]>;
  fetchThreadsPublic(since: Date): Promise<FediversePost[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
