/**
 * VK / OK adapter.
 * Normalizes public Russian-platform posts to AegisEvent stream.
 *
 * IMPORTANT: All events carry requires_verification = true.
 * Events are not surfaced directly — they feed corroboration pipeline only.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { VkOkApiClient } from "./client";
import type { VkPost, OkPost, VkGroupConfig, OkGroupConfig } from "./types";

/** Public Telegram-mirrored / VK groups relevant to Ukraine conflict */
export const VK_GROUP_REGISTRY: VkGroupConfig[] = [
  { id: "warspotting", label: "Warspotting (equipment losses)", reliability: 3 },
  { id: "rybar", label: "Rybar (pro-RU milblog)", reliability: 2 },
  { id: "dva_majors", label: "Two Majors", reliability: 2 },
];

export const OK_GROUP_REGISTRY: OkGroupConfig[] = [];

function inferSeverity(engagement: number): 0 | 1 | 2 | 3 {
  if (engagement > 5_000) return 3;
  if (engagement > 500) return 2;
  return 1;
}

export class VkOkAdapter implements SourceAdapter {
  private readonly vkCursors = new Map<string, number>();

  constructor(private readonly client: VkOkApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    const sinceTs = Math.floor(since.getTime() / 1000);

    // VK groups
    for (const group of VK_GROUP_REGISTRY) {
      try {
        const posts = await this.client.fetchVkGroupPosts(group.id, { count: 20 });
        for (const post of posts) {
          if (post.date < sinceTs) continue;
          yield {
            source_id: "vk",
            external_id: `vk:${post.owner_id}_${post.id}`,
            collected_at: new Date().toISOString(),
            raw: { post, groupConfig: group, platform: "vk" },
          };
        }
      } catch {
        // Skip on error
      }
    }

    // OK groups
    for (const group of OK_GROUP_REGISTRY) {
      try {
        const posts = await this.client.fetchOkGroupPosts(group.id, { count: 20 });
        const sinceDateStr = since.toISOString();
        for (const post of posts) {
          if (post.created_at < sinceDateStr) continue;
          yield {
            source_id: "ok",
            external_id: `ok:${group.id}_${post.id}`,
            collected_at: new Date().toISOString(),
            raw: { post, groupConfig: group, platform: "ok" },
          };
        }
      } catch {
        // Skip on error
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const { platform, post, groupConfig } = payload.raw as {
      platform: "vk" | "ok";
      post: VkPost | OkPost;
      groupConfig: VkGroupConfig | OkGroupConfig;
    };

    const isVk = platform === "vk";
    const vkPost = post as VkPost;
    const okPost = post as OkPost;

    const text = isVk ? vkPost.text : okPost.text;
    const url = isVk ? vkPost.post_url : okPost.post_url;
    const occurredAt = isVk
      ? new Date(vkPost.date * 1000).toISOString()
      : okPost.created_at;

    const engagement = isVk
      ? vkPost.likes_count + vkPost.reposts_count * 3 + vkPost.comments_count * 2
      : okPost.like_count + okPost.reshare_count * 3 + okPost.comment_count * 2;

    return {
      event: {
        eventId: `${platform}:${payload.external_id}`,
        class: "military_action",
        subclass: "social_report",
        severity: inferSeverity(engagement),
        summary: { en: text.slice(0, 280), uk: null },
        location: null,
        occurredAt,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: "ru",
            contentHash: payload.external_id,
          },
        ],
        media: isVk
          ? vkPost.photo_urls.map((u) => ({ type: "image" as const, url: u }))
          : [],
        originalText: text,
      },
      // Low weight: Russian platform, always requires_verification
      sourceWeight: 0.25,
      language: "ru",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
