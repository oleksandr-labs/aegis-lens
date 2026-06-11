/**
 * VK / OK API client — public group wall posts.
 *
 * VK API: https://dev.vk.com/reference/objects/post
 * - Public group walls do not require access_token for basic read
 * - Service token recommended for higher rate limits
 *
 * OK API: https://apiok.ru/
 * - Requires application_key + access_token for group feed
 *
 * Rate limits:
 * - VK: 3 req/sec per IP without token; 5 req/sec with service token
 * - OK: 3 req/sec
 *
 * IMPORTANT: All content from these platforms has requires_verification = true.
 * Russian state-affiliated or pro-Kremlin sources require additional corroboration
 * before any claim is surfaced in the platform.
 */

import type {
  VkPost,
  OkPost,
  VkOkClient,
} from "./types";

const VK_API_BASE = "https://api.vk.com/method";
const VK_API_VERSION = "5.199";
const OK_API_BASE = "https://api.ok.ru/fb.do";

const REQUEST_INTERVAL_MS = 350; // ~3 req/sec

async function delay(ms: number): Promise<void> {
  return new Promise<void>((r) => setTimeout(r, ms));
}

interface VkWallResponse {
  response?: {
    items: Array<{
      id: number;
      owner_id: number;
      text: string;
      date: number;
      likes: { count: number };
      reposts: { count: number };
      comments: { count: number };
      views: { count: number };
      post_type: string;
      attachments?: Array<{
        type: string;
        photo?: { orig_photo?: { url: string }; sizes?: Array<{ type: string; url: string }> };
      }>;
    }>;
  };
  error?: { error_code: number; error_msg: string };
}

export class VkOkApiClient implements VkOkClient {
  private lastVkRequest = 0;
  private lastOkRequest = 0;

  constructor(
    private readonly vkServiceToken?: string,
    private readonly okApplicationKey?: string,
    private readonly okAccessToken?: string,
  ) {}

  private async vkThrottle(): Promise<void> {
    const elapsed = Date.now() - this.lastVkRequest;
    if (elapsed < REQUEST_INTERVAL_MS) {
      await delay(REQUEST_INTERVAL_MS - elapsed);
    }
    this.lastVkRequest = Date.now();
  }

  private async okThrottle(): Promise<void> {
    const elapsed = Date.now() - this.lastOkRequest;
    if (elapsed < REQUEST_INTERVAL_MS) {
      await delay(REQUEST_INTERVAL_MS - elapsed);
    }
    this.lastOkRequest = Date.now();
  }

  private extractVkPhotoUrls(
    attachments?: VkWallResponse["response"]["items"][0]["attachments"],
  ): string[] {
    if (!attachments) return [];
    const urls: string[] = [];
    for (const att of attachments) {
      if (att.type === "photo" && att.photo) {
        const orig = att.photo.orig_photo?.url;
        if (orig) {
          urls.push(orig);
        } else {
          const largest = att.photo.sizes
            ?.sort((a, b) => (b.type > a.type ? 1 : -1))
            ?.at(0)?.url;
          if (largest) urls.push(largest);
        }
      }
    }
    return urls;
  }

  async fetchVkGroupPosts(
    groupId: string | number,
    opts: { count?: number; offset?: number } = {},
  ): Promise<VkPost[]> {
    await this.vkThrottle();

    const params = new URLSearchParams({
      owner_id: `-${String(groupId).replace(/^-/, "")}`,
      count: String(Math.min(opts.count ?? 20, 100)),
      offset: String(opts.offset ?? 0),
      v: VK_API_VERSION,
      filter: "owner",
      extended: "0",
    });

    if (this.vkServiceToken) {
      params.set("access_token", this.vkServiceToken);
    }

    const res = await fetch(`${VK_API_BASE}/wall.get?${params}`, {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    if (!res.ok) {
      throw new Error(`VK API HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as VkWallResponse;

    if (json.error) {
      throw new Error(`VK API error ${json.error.error_code}: ${json.error.error_msg}`);
    }

    const ownerId = Number(String(groupId).replace(/^-/, ""));

    return (json.response?.items ?? []).map((item): VkPost => ({
      id: item.id,
      owner_id: item.owner_id,
      owner_screen_name: String(groupId),
      text: item.text,
      date: item.date,
      likes_count: item.likes?.count ?? 0,
      reposts_count: item.reposts?.count ?? 0,
      comments_count: item.comments?.count ?? 0,
      views_count: item.views?.count ?? 0,
      post_url: `https://vk.com/wall${item.owner_id}_${item.id}`,
      photo_urls: this.extractVkPhotoUrls(item.attachments),
      post_type: item.post_type ?? "post",
      requires_verification: true,
    }));
  }

  async fetchOkGroupPosts(
    groupId: string,
    opts: { count?: number; anchor?: string } = {},
  ): Promise<OkPost[]> {
    if (!this.okApplicationKey || !this.okAccessToken) {
      throw new Error("OK API requires okApplicationKey and okAccessToken");
    }

    await this.okThrottle();

    const params = new URLSearchParams({
      method: "group.getDiscussions",
      group_id: groupId,
      count: String(Math.min(opts.count ?? 20, 50)),
      application_key: this.okApplicationKey,
      access_token: this.okAccessToken,
      format: "json",
    });

    if (opts.anchor) {
      params.set("anchor", opts.anchor);
    }

    const res = await fetch(`${OK_API_BASE}?${params}`, {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    if (!res.ok) {
      throw new Error(`OK API HTTP ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      discussions?: Array<{
        id: string;
        text: string;
        created_at: string;
        like_count?: number;
        comment_count?: number;
        reshare_count?: number;
        url?: string;
      }>;
      error_code?: number;
      error_msg?: string;
    };

    if (json.error_code) {
      throw new Error(`OK API error ${json.error_code}: ${json.error_msg}`);
    }

    return (json.discussions ?? []).map((item): OkPost => ({
      id: item.id,
      group_id: groupId,
      group_name: groupId,
      text: item.text ?? "",
      created_at: item.created_at,
      like_count: item.like_count ?? 0,
      comment_count: item.comment_count ?? 0,
      reshare_count: item.reshare_count ?? 0,
      post_url: item.url ?? `https://ok.ru/group/${groupId}/topic/${item.id}`,
      requires_verification: true,
    }));
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const params = new URLSearchParams({
        owner_id: "-1",
        count: "1",
        v: VK_API_VERSION,
        ...(this.vkServiceToken ? { access_token: this.vkServiceToken } : {}),
      });
      const res = await fetch(`${VK_API_BASE}/wall.get?${params}`, {
        headers: { "User-Agent": "AegisLens/1.0" },
      });
      if (res.ok) return { healthy: true };
      return { healthy: false, message: `VK health check returned ${res.status}` };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
