/**
 * VK / OK (Odnoklassniki) — type definitions.
 * Scope: public wall posts from public groups only.
 * No personal data stored beyond post ID + text.
 *
 * WARNING: Russian platforms. All content requires_verification = true.
 */

export interface VkPost {
  /** VK post ID (wall post) */
  id: number;
  /** VK owner ID (negative = group/community) */
  owner_id: number;
  /** Owner screen name (public group name) */
  owner_screen_name: string;
  /** Post text */
  text: string;
  /** Unix timestamp */
  date: number;
  /** Like count */
  likes_count: number;
  /** Repost count */
  reposts_count: number;
  /** Comment count */
  comments_count: number;
  /** View count */
  views_count: number;
  /** Post URL */
  post_url: string;
  /** Attached photos (public URLs only) */
  photo_urls: string[];
  /** Post type (post, copy, reply) */
  post_type: string;
  /** Marked for verification — always true for VK content */
  requires_verification: true;
}

export interface OkPost {
  /** OK post ID */
  id: string;
  /** Group ID */
  group_id: string;
  /** Group name (public) */
  group_name: string;
  /** Post text */
  text: string;
  /** Creation date ISO-8601 */
  created_at: string;
  /** Like count */
  like_count: number;
  /** Comment count */
  comment_count: number;
  /** Repost count */
  reshare_count: number;
  /** Post URL */
  post_url: string;
  /** Marked for verification — always true for OK content */
  requires_verification: true;
}

export interface VkGroupConfig {
  /** Screen name (e.g. "warspotting") or numeric ID */
  id: string | number;
  /** Human label */
  label: string;
  /** Reliability score 1–5 */
  reliability: 1 | 2 | 3 | 4 | 5;
}

export interface OkGroupConfig {
  /** OK group ID */
  id: string;
  /** Human label */
  label: string;
  /** Reliability score 1–5 */
  reliability: 1 | 2 | 3 | 4 | 5;
}

export interface VkOkClient {
  fetchVkGroupPosts(groupId: string | number, opts?: { count?: number; offset?: number }): Promise<VkPost[]>;
  fetchOkGroupPosts(groupId: string, opts?: { count?: number; anchor?: string }): Promise<OkPost[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
