/**
 * YouTube ingest adapter.
 *
 * Polls curated channels for new conflict-relevant videos.
 * Uses per-channel publishedAfter cursors for incremental fetching.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { redactPII } from "../../ingest/src/pii";
import { YouTubeApiClient } from "./client";
import { CHANNEL_REGISTRY, YouTubeChannelRegistryService } from "./registry";
import type { YTVideo } from "./types";

const CONFLICT_KEYWORDS = [
  "ukraine", "russia", "missile", "drone", "explosion", "strike", "attack",
  "war", "combat", "military", "frontline", "offensive",
  "україна", "росія", "ракета", "безпілотник", "вибух", "удар", "атака",
  "фронт", "бойові", "ппо", "тривога", "обстріл",
];

function isConflictRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => text.includes(kw));
}

function inferSeverityFromMetrics(video: YTVideo): 0 | 1 | 2 | 3 {
  const views = video.viewCount ?? 0;
  const likes = video.likeCount ?? 0;
  const engagement = views + likes * 10;
  if (engagement > 1_000_000) return 3;
  if (engagement > 100_000) return 2;
  return 1;
}

export class YouTubeAdapter implements SourceAdapter {
  private readonly registry = new YouTubeChannelRegistryService();
  /** channelId → ISO timestamp of last fetched video */
  private readonly cursors = new Map<string, string>();

  constructor(private readonly client: YouTubeApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    for (const channel of CHANNEL_REGISTRY) {
      const publishedAfter = this.cursors.get(channel.id) ?? since.toISOString();

      try {
        const { items } = await this.client.getChannelVideos(channel.id, { maxResults: 10 });
        const newItems = items.filter((it) => it.publishedAt > publishedAfter);

        if (newItems.length === 0) continue;

        const videoIds = newItems.map((it) => it.videoId);
        const details = await this.client.getVideoDetails(videoIds);

        for (const video of details) {
          if (!isConflictRelevant(video.title, video.description)) continue;

          yield {
            source_id: "youtube",
            external_id: video.id,
            collected_at: new Date().toISOString(),
            raw: video,
          };
        }

        const latestPublished = newItems.reduce(
          (max, it) => (it.publishedAt > max ? it.publishedAt : max),
          publishedAfter,
        );
        this.cursors.set(channel.id, latestPublished);
      } catch {
        // Skip this channel on error
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const video = payload.raw as YTVideo;
    const sourceWeight = this.registry.getSourceWeight(video.channelId);
    const cleanTitle = redactPII(video.title);
    const cleanDesc = redactPII(video.description.slice(0, 500));

    return {
      event: {
        eventId: `youtube:${video.id}`,
        class: "military_action",
        subclass: "media_report",
        severity: inferSeverityFromMetrics(video),
        summary: { en: cleanTitle, uk: null },
        location: null,
        occurredAt: video.publishedAt,
        reportedAt: video.publishedAt,
        sources: [
          {
            url: `https://www.youtube.com/watch?v=${video.id}`,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: video.lang ?? "und",
            contentHash: payload.external_id,
          },
        ],
        media: video.thumbnailUrl
          ? [{ type: "image", url: video.thumbnailUrl }]
          : [],
        originalText: `${cleanTitle}\n\n${cleanDesc}`,
      },
      sourceWeight,
      language: video.lang ?? "und",
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
