/**
 * TikTok Research API — type definitions.
 * Scope: public posts only via TikTok Research API.
 * Docs: https://developers.tiktok.com/products/research-api/
 *
 * IMPORTANT: availability controlled by TIKTOK_RESEARCH_ENABLED env flag.
 * Requires approved academic/research application from TikTok.
 */

export interface TikTokPost {
  /** Unique video ID */
  id: string;
  /** Display name of author — no private PII */
  author_name: string;
  /** Author's unique name (handle) */
  author_unique_id: string;
  /** Video description / caption */
  desc: string;
  /** Creation timestamp (Unix seconds) */
  create_time: number;
  /** Region code where video was created (region-level only, no precise geo) */
  region_code: string;
  /** View count at time of collection */
  play_count: number;
  /** Like count */
  digg_count: number;
  /** Comment count */
  comment_count: number;
  /** Share count */
  share_count: number;
  /** List of hashtags */
  hashtag_names: string[];
  /** Video duration in seconds */
  duration: number;
  /** Whether the video has been marked as containing music */
  music_id?: string;
  /** Video cover image URL (public) */
  cover_image_url?: string;
  /** Embed link (if available) */
  embed_link?: string;
}

export interface TikTokSearchParams {
  /** Keywords to search */
  query: string;
  /** Start date (inclusive), Unix timestamp */
  start_date: number;
  /** End date (inclusive), Unix timestamp */
  end_date: number;
  /** Max results per page (1–100) */
  max_count?: number;
  /** Cursor for pagination */
  cursor?: number;
  /** Region filter (optional) */
  region_code?: string;
  /** Hashtag filter list */
  hashtag_names?: string[];
}

export interface TikTokSearchResponse {
  data: {
    videos: TikTokPost[];
    cursor: number;
    has_more: boolean;
    search_id: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokResearchClient {
  search(params: TikTokSearchParams): Promise<TikTokSearchResponse>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
