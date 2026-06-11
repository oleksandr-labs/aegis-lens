/**
 * Curated YouTube channel registry for conflict OSINT.
 *
 * Inclusion criteria:
 *   - Publicly verifiable identity (official, journalist, analyst, NGO)
 *   - Consistent conflict-related posting
 *   - ToS-compliant public channel
 */

import type { YTChannel } from "./types";

export const CHANNEL_REGISTRY: YTChannel[] = [
  // ── Ukrainian official ────────────────────────────────────────────────────
  {
    id: "UCpFNG1ZFMfQGIJfRsHHNEGQ",
    name: "President of Ukraine",
    description: "Official channel of the President of Ukraine",
    country: "UA",
    reliability: 5,
    topics: ["politics", "military", "humanitarian"],
    language: "uk",
    verified_at: "2023-01-01",
  },
  {
    id: "UCVMDtSJRqzRjDkG7MVWMZNQ",
    name: "General Staff of the Armed Forces of Ukraine",
    country: "UA",
    reliability: 5,
    topics: ["military"],
    language: "uk",
    verified_at: "2023-01-01",
  },
  // ── OSINT / investigative ─────────────────────────────────────────────────
  {
    id: "UCnUYZLuoy1rq1aVMwx4aTzw",
    name: "Bellingcat",
    description: "Open source investigative journalism",
    reliability: 5,
    topics: ["osint", "military", "analysis"],
    language: "en",
    verified_at: "2023-01-01",
  },
  {
    id: "UCKq3_HEHCq5lKJuGZbf4XGQ",
    name: "Conflict Intelligence Team",
    description: "CIT — open source conflict monitoring",
    reliability: 4,
    topics: ["osint", "military"],
    language: "ru",
    verified_at: "2023-01-01",
  },
  // ── International news ────────────────────────────────────────────────────
  {
    id: "UCBi2mrWuNuyYy4gbM6fU18Q",
    name: "Reuters",
    country: "INT",
    reliability: 5,
    topics: ["general", "conflict"],
    language: "en",
    verified_at: "2023-01-01",
  },
  {
    id: "UCeY0bbntWzzVIaj2z3QigXg",
    name: "NBC News",
    country: "US",
    reliability: 4,
    topics: ["general", "conflict"],
    language: "en",
    verified_at: "2023-01-01",
  },
  // ── Ukrainian news ────────────────────────────────────────────────────────
  {
    id: "UCJJBxL6gGxGLCX2e4bNxzGQ",
    name: "Ukrainska Pravda",
    country: "UA",
    reliability: 4,
    topics: ["news", "politics", "military"],
    language: "uk",
    verified_at: "2023-01-01",
  },
];

export const PLAYLIST_REGISTRY: { channelId: string; playlistId: string; name: string }[] = [
  // Specific conflict-coverage playlists
  {
    channelId: "UCnUYZLuoy1rq1aVMwx4aTzw",
    playlistId: "PLGnWnikOf-gni3lJlOrJSGqjVwSLvJJm4",
    name: "Bellingcat Ukraine Investigations",
  },
];

export class YouTubeChannelRegistryService {
  private readonly channels = new Map<string, YTChannel>(
    CHANNEL_REGISTRY.map((c) => [c.id, c]),
  );

  getById(channelId: string): YTChannel | undefined {
    return this.channels.get(channelId);
  }

  byLanguage(lang: string): YTChannel[] {
    return CHANNEL_REGISTRY.filter((c) => c.language === lang);
  }

  byTopic(topic: string): YTChannel[] {
    return CHANNEL_REGISTRY.filter((c) => c.topics.includes(topic));
  }

  getSourceWeight(channelId: string): number {
    const channel = this.getById(channelId);
    if (!channel) return 0.3;
    return channel.reliability / 5;
  }

  all(): YTChannel[] {
    return CHANNEL_REGISTRY;
  }
}
