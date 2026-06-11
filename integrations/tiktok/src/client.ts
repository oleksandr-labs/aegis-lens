/**
 * TikTok Research API client.
 * Docs: https://developers.tiktok.com/products/research-api/
 *
 * ToS constraints:
 * - Research API only (requires approved application)
 * - Public posts only; no private user data
 * - No face capture from video frames
 * - Geo: region-level only
 *
 * Rate limit: 1,000 requests/day per application (Research API tier).
 * Availability: controlled by TIKTOK_RESEARCH_ENABLED env flag.
 */

import type {
  TikTokPost,
  TikTokSearchParams,
  TikTokSearchResponse,
  TikTokResearchClient,
} from "./types";

/** Feature flag — disabled until Research API application is approved */
export const TIKTOK_RESEARCH_ENABLED =
  process.env.TIKTOK_RESEARCH_ENABLED === "true";

const BASE_URL = "https://open.tiktokapis.com/v2";
const AUTH_URL = "https://open.tiktokapis.com/v2/oauth/token/";

/** Requests per day limit for Research API */
const DAILY_LIMIT = 1_000;
const REQUEST_INTERVAL_MS = Math.ceil((24 * 60 * 60 * 1000) / DAILY_LIMIT); // ~86 400ms

export class TikTokApiClient implements TikTokResearchClient {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;
  private lastRequestAt = 0;

  constructor(
    private readonly clientKey: string,
    private readonly clientSecret: string,
  ) {}

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestAt;
    if (elapsed < REQUEST_INTERVAL_MS) {
      await new Promise<void>((r) =>
        setTimeout(r, REQUEST_INTERVAL_MS - elapsed),
      );
    }
    this.lastRequestAt = Date.now();
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const body = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    });

    const res = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new Error(`TikTok OAuth failed: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = json.access_token;
    this.tokenExpiresAt = Date.now() + json.expires_in * 1000;
    return this.accessToken;
  }

  async search(params: TikTokSearchParams): Promise<TikTokSearchResponse> {
    if (!TIKTOK_RESEARCH_ENABLED) {
      throw new Error(
        "TikTok Research API is disabled. Set TIKTOK_RESEARCH_ENABLED=true after obtaining approved application.",
      );
    }

    await this.throttle();
    const token = await this.ensureToken();

    const body = {
      query: {
        and: [{ operation: "IN", field_name: "keyword", field_values: [params.query] }],
      },
      start_date: new Date(params.start_date * 1000)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, ""),
      end_date: new Date(params.end_date * 1000)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, ""),
      max_count: Math.min(params.max_count ?? 20, 100),
      cursor: params.cursor ?? 0,
    };

    const url = new URL(`${BASE_URL}/research/video/query/`);
    url.searchParams.set(
      "fields",
      "id,author_name,author_unique_id,desc,create_time,region_code,play_count,digg_count,comment_count,share_count,hashtag_names,duration,cover_image_url,embed_link",
    );

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      throw Object.assign(new Error("TikTok rate limited"), {
        retryAfterMs: 3_600_000,
      });
    }

    if (!res.ok) {
      throw new Error(`TikTok Research API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<TikTokSearchResponse>;
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    if (!TIKTOK_RESEARCH_ENABLED) {
      return {
        healthy: false,
        message: "TikTok Research API disabled (TIKTOK_RESEARCH_ENABLED=false)",
      };
    }
    try {
      await this.ensureToken();
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
