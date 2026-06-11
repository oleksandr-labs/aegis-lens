/**
 * Press release ingest adapter.
 * Normalizes Ukrainian government press releases to AegisEvent stream.
 */

import type { SourceAdapter, RawPayload, NormaliseResult } from "../../ingest/src/adapter";
import { PressReleaseFetcherImpl, SOURCE_REGISTRY } from "./client";
import type { PressRelease, PressReleaseSource } from "./types";

const SOURCE_WEIGHTS: Record<PressReleaseSource, number> = {
  president: 0.95,
  mod: 0.92,
  cabinet: 0.90,
  general_staff: 0.93,
};

export class PressReleaseAdapter implements SourceAdapter {
  constructor(private readonly fetcher: PressReleaseFetcherImpl) {}

  async *fetchSince(since: Date): AsyncGenerator<RawPayload> {
    for (const sourceConfig of SOURCE_REGISTRY) {
      try {
        const releases = await this.fetcher.fetchSince(sourceConfig, since);
        for (const release of releases) {
          yield {
            source_id: `press-release:${release.source}`,
            external_id: release.id,
            collected_at: new Date().toISOString(),
            raw: release,
          };
        }
      } catch {
        // Fail-soft per source
      }
    }
  }

  normalise(payload: RawPayload): NormaliseResult {
    const release = payload.raw as PressRelease;

    const summaryEn = release.language === "en"
      ? release.title
      : release.summary ?? release.title;

    const summaryUk = release.language === "uk"
      ? release.title
      : null;

    return {
      event: {
        eventId: `press-release:${release.id}`,
        class: "military_action",
        subclass: "official_statement",
        severity: 1,
        summary: { en: summaryEn, uk: summaryUk },
        location: null,
        occurredAt: release.published_at,
        reportedAt: new Date().toISOString(),
        sources: [
          {
            url: release.url,
            archiveUrl: null,
            fetchedAt: new Date().toISOString(),
            language: release.language,
            contentHash: release.id,
          },
        ],
        media: release.image_url
          ? [{ type: "image" as const, url: release.image_url }]
          : [],
        originalText: release.body ?? release.summary ?? release.title,
      },
      sourceWeight: SOURCE_WEIGHTS[release.source] ?? 0.85,
      language: release.language,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return this.fetcher.healthCheck();
  }
}
