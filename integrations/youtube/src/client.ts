/**
 * YouTube Data API v3 client.
 * Docs: https://developers.google.com/youtube/v3
 *
 * Quota: 10,000 units/day. search.list=100, videos.list=1, captions.list=50.
 */

import type { YTVideo, YTPlaylistItem } from "./types";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

export class YouTubeApiClient {
  constructor(private readonly apiKey: string) {}

  private async fetch<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("key", this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    if (res.status === 403) {
      const body = await res.text();
      if (body.includes("quotaExceeded")) {
        throw Object.assign(new Error("YouTube quota exceeded"), { retryAfterMs: 86_400_000 });
      }
      throw new Error(`YouTube API 403: ${body}`);
    }

    if (!res.ok) {
      throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
  }

  /** Search for recent conflict-relevant videos */
  async searchVideos(opts: {
    query: string;
    publishedAfter?: string;
    maxResults?: number;
    pageToken?: string;
    regionCode?: string;
  }): Promise<{ videos: { videoId: string; title: string; channelId: string; publishedAt: string }[]; nextPageToken?: string }> {
    const resp = await this.fetch<{
      items?: { id: { videoId: string }; snippet: { title: string; channelId: string; publishedAt: string } }[];
      nextPageToken?: string;
    }>("/search", {
      part: "id,snippet",
      type: "video",
      q: opts.query,
      maxResults: String(Math.min(opts.maxResults ?? 10, 50)),
      order: "date",
      safeSearch: "none",
      ...(opts.publishedAfter ? { publishedAfter: opts.publishedAfter } : {}),
      ...(opts.pageToken ? { pageToken: opts.pageToken } : {}),
      ...(opts.regionCode ? { regionCode: opts.regionCode } : {}),
    });

    return {
      videos: (resp.items ?? []).map((it) => ({
        videoId: it.id.videoId,
        title: it.snippet.title,
        channelId: it.snippet.channelId,
        publishedAt: it.snippet.publishedAt,
      })),
      nextPageToken: resp.nextPageToken,
    };
  }

  /** Fetch full video metadata for up to 50 IDs */
  async getVideoDetails(videoIds: string[]): Promise<YTVideo[]> {
    if (videoIds.length === 0) return [];

    const resp = await this.fetch<{
      items?: {
        id: string;
        snippet: {
          channelId: string;
          channelTitle: string;
          title: string;
          description: string;
          publishedAt: string;
          defaultAudioLanguage?: string;
          thumbnails?: { medium?: { url: string } };
        };
        contentDetails?: { duration: string };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }[];
    }>("/videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds.join(","),
      maxResults: "50",
    });

    return (resp.items ?? []).map((it) => ({
      id: it.id,
      channelId: it.snippet.channelId,
      channelTitle: it.snippet.channelTitle,
      title: it.snippet.title,
      description: it.snippet.description,
      publishedAt: it.snippet.publishedAt,
      lang: it.snippet.defaultAudioLanguage,
      duration: it.contentDetails?.duration,
      viewCount: it.statistics?.viewCount ? Number(it.statistics.viewCount) : undefined,
      likeCount: it.statistics?.likeCount ? Number(it.statistics.likeCount) : undefined,
      commentCount: it.statistics?.commentCount ? Number(it.statistics.commentCount) : undefined,
      thumbnailUrl: it.snippet.thumbnails?.medium?.url,
    }));
  }

  /** List recent videos from a channel's uploads playlist */
  async getChannelVideos(channelId: string, opts?: {
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ items: YTPlaylistItem[]; nextPageToken?: string }> {
    // The uploads playlist ID is "UU" + channelId[2:]
    const uploadsPlaylistId = "UU" + channelId.slice(2);
    return this.getPlaylistItems(uploadsPlaylistId, opts);
  }

  /** List items from any playlist */
  async getPlaylistItems(playlistId: string, opts?: {
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ items: YTPlaylistItem[]; nextPageToken?: string }> {
    const resp = await this.fetch<{
      items?: {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          publishedAt: string;
          channelId: string;
        };
      }[];
      nextPageToken?: string;
    }>("/playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: String(Math.min(opts?.maxResults ?? 20, 50)),
      ...(opts?.pageToken ? { pageToken: opts.pageToken } : {}),
    });

    return {
      items: (resp.items ?? []).map((it) => ({
        videoId: it.snippet.resourceId.videoId,
        title: it.snippet.title,
        publishedAt: it.snippet.publishedAt,
        channelId: it.snippet.channelId,
      })),
      nextPageToken: resp.nextPageToken,
    };
  }

  /**
   * Fetch auto-generated or manual captions for a video.
   * Returns raw XML/SRV3 transcript text that callers must parse.
   * Falls back to empty array when captions are disabled/unavailable.
   */
  async getCaptionTrack(videoId: string, lang = "uk"): Promise<string> {
    // List caption tracks to find the right one
    const listResp = await this.fetch<{
      items?: { id: string; snippet: { language: string; trackKind: string } }[];
    }>("/captions", {
      part: "snippet",
      videoId,
    });

    const tracks = listResp.items ?? [];
    // Prefer manual > ASR; prefer requested lang > en
    const preferred =
      tracks.find((t) => t.snippet.language === lang && t.snippet.trackKind === "standard") ??
      tracks.find((t) => t.snippet.language === "en" && t.snippet.trackKind === "standard") ??
      tracks.find((t) => t.snippet.trackKind === "asr") ??
      tracks[0];

    if (!preferred) return "";

    // Caption download requires OAuth — return the track ID for downstream processing
    return preferred.id;
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.searchVideos({ query: "ukraine", maxResults: 1 });
      return { healthy: true };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
