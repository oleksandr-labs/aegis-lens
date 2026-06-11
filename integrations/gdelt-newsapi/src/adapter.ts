/**
 * News aggregator adapter.
 * Normalizes GDELT, NewsAPI, MediaCloud records to AegisEvent stream.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { NewsAggregatorApiClient } from "./client";
import type {
  GdeltGkgRecord,
  NewsApiArticle,
  MediaCloudStory,
  NewsAggregatorSource,
} from "./types";

function inferSeverityFromTone(tone: GdeltGkgRecord["tone"]): 0 | 1 | 2 | 3 {
  const magnitude = Math.abs(tone.negative) + Math.abs(tone.polarity);
  if (magnitude > 5) return 3;
  if (magnitude > 2) return 2;
  return 1;
}

export class NewsAggregatorAdapter implements SourceAdapter {
  constructor(private readonly client: NewsAggregatorApiClient) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    // GDELT (no key required)
    try {
      const records = await this.client.fetchGdelt(since);
      for (const rec of records) {
        yield {
          source_id: "gdelt",
          external_id: rec.gkg_record_id,
          collected_at: new Date().toISOString(),
          raw: { source: "gdelt", record: rec },
        };
      }
    } catch {
      // Fail-soft
    }

    // NewsAPI (requires key)
    try {
      const articles = await this.client.fetchNewsApi(since);
      for (const article of articles) {
        yield {
          source_id: "newsapi",
          external_id: encodeURIComponent(article.url),
          collected_at: new Date().toISOString(),
          raw: { source: "newsapi", record: article },
        };
      }
    } catch {
      // Fail-soft (key may not be set)
    }

    // MediaCloud (requires key)
    try {
      const stories = await this.client.fetchMediaCloud(since);
      for (const story of stories) {
        yield {
          source_id: "mediacloud",
          external_id: String(story.stories_id),
          collected_at: new Date().toISOString(),
          raw: { source: "mediacloud", record: story },
        };
      }
    } catch {
      // Fail-soft (key may not be set)
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const { source, record } = payload.raw as {
      source: NewsAggregatorSource;
      record: GdeltGkgRecord | NewsApiArticle | MediaCloudStory;
    };

    if (source === "gdelt") {
      const rec = record as GdeltGkgRecord;
      const primaryLoc = rec.locations.find((l) => l.lat && l.lon);
      return {
        event: {
          eventId: `gdelt:${rec.gkg_record_id}`,
          class: "military_action",
          subclass: "news_report",
          severity: inferSeverityFromTone(rec.tone),
          summary: { en: rec.title ?? rec.document_identifier.slice(0, 200), uk: null },
          location: primaryLoc
            ? { lat: primaryLoc.lat!, lon: primaryLoc.lon!, precisionM: 10_000 }
            : null,
          occurredAt: rec.date,
          reportedAt: new Date().toISOString(),
          sources: [
            {
              url: rec.document_identifier,
              archiveUrl: null,
              fetchedAt: new Date().toISOString(),
              language: rec.language ?? "en",
              contentHash: rec.gkg_record_id,
            },
          ],
          media: [],
          originalText: rec.themes.join("; "),
        },
        sourceWeight: 0.7,
        language: rec.language ?? "en",
      };
    }

    if (source === "newsapi") {
      const art = record as NewsApiArticle;
      return {
        event: {
          eventId: `newsapi:${encodeURIComponent(art.url)}`,
          class: "military_action",
          subclass: "news_report",
          severity: 1,
          summary: { en: art.title, uk: null },
          location: null,
          occurredAt: art.published_at,
          reportedAt: new Date().toISOString(),
          sources: [
            {
              url: art.url,
              archiveUrl: null,
              fetchedAt: new Date().toISOString(),
              language: art.language ?? "en",
              contentHash: encodeURIComponent(art.url),
            },
          ],
          media: art.url_to_image ? [{ type: "image" as const, url: art.url_to_image }] : [],
          originalText: art.description ?? art.title,
        },
        sourceWeight: 0.75,
        language: art.language ?? "en",
      };
    }

    // mediacloud
    const story = record as MediaCloudStory;
    return {
      event: {
        eventId: `mediacloud:${story.stories_id}`,
        class: "military_action",
        subclass: "news_report",
        severity: 1,
        summary: { en: story.title, uk: null },
        location: null,
        occurredAt: story.publish_date,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: story.url,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: story.language,
            contentHash: String(story.stories_id),
          },
        ],
        media: [],
        originalText: story.title,
      },
      sourceWeight: 0.8,
      language: story.language,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.client.healthCheck();
  }
}
