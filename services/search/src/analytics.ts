/**
 * Search analytics: track zero-result queries, popular searches, relevance signals.
 */

import type { SearchAnalytics } from "./types";

export interface SearchAnalyticsStore {
  record(event: SearchAnalytics): Promise<void>;
  getZeroResultQueries(limit?: number): Promise<{ query: string; count: number; locale?: string }[]>;
  getPopularQueries(limit?: number): Promise<{ query: string; count: number }[]>;
  getQueryCount(since?: Date): Promise<number>;
}

export class InMemorySearchAnalyticsStore implements SearchAnalyticsStore {
  private readonly events: SearchAnalytics[] = [];

  async record(event: SearchAnalytics): Promise<void> {
    this.events.push(event);
  }

  async getZeroResultQueries(limit = 50): Promise<{ query: string; count: number; locale?: string }[]> {
    const counts = new Map<string, { count: number; locale?: string }>();
    for (const e of this.events) {
      if (!e.isZeroResult) continue;
      const key = e.query.toLowerCase().trim();
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { count: 1, locale: e.locale });
    }
    return [...counts.entries()]
      .map(([query, { count, locale }]) => ({ query, count, locale }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getPopularQueries(limit = 50): Promise<{ query: string; count: number }[]> {
    const counts = new Map<string, number>();
    for (const e of this.events) {
      const key = e.query.toLowerCase().trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getQueryCount(since?: Date): Promise<number> {
    if (!since) return this.events.length;
    const sinceTs = since.toISOString();
    return this.events.filter((e) => e.timestamp >= sinceTs).length;
  }
}
