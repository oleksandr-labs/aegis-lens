/**
 * Ukrainian government press release fetcher.
 *
 * Primary: RSS feed pull (president.gov.ua, mil.gov.ua, kmu.gov.ua)
 * Fallback: HTML page scraping with configurable CSS selectors
 *
 * Poll interval: 5 minutes (300,000ms) as recommended.
 * No authentication required — all sources are public domain.
 */

import type {
  PressRelease,
  PressReleaseSource,
  PressReleaseSourceConfig,
  PressReleaseFetcher,
} from "./types";

const POLL_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

/** Registry of Ukrainian government press release sources */
export const SOURCE_REGISTRY: PressReleaseSourceConfig[] = [
  {
    id: "president",
    label: "Office of the President of Ukraine",
    rss_url: "https://www.president.gov.ua/news/rss",
    page_url: "https://www.president.gov.ua/news",
    scrape: {
      item_selector: "article.news-item",
      title_selector: "h3.news-item__title",
      link_selector: "a.news-item__link",
      date_selector: "time.news-item__date",
      summary_selector: "p.news-item__text",
    },
    poll_interval_ms: POLL_INTERVAL_MS,
    language: "uk",
  },
  {
    id: "mod",
    label: "Ministry of Defence of Ukraine",
    rss_url: "https://www.mil.gov.ua/rss",
    page_url: "https://www.mil.gov.ua/news",
    scrape: {
      item_selector: ".news-list__item",
      title_selector: ".news-list__title",
      link_selector: "a.news-list__link",
      date_selector: ".news-list__date",
      summary_selector: ".news-list__text",
    },
    poll_interval_ms: POLL_INTERVAL_MS,
    language: "uk",
  },
  {
    id: "cabinet",
    label: "Cabinet of Ministers of Ukraine",
    rss_url: "https://www.kmu.gov.ua/rss",
    page_url: "https://www.kmu.gov.ua/news",
    scrape: {
      item_selector: ".article-list__item",
      title_selector: ".article-list__title",
      link_selector: "a",
      date_selector: ".article-list__date",
      summary_selector: ".article-list__lead",
    },
    poll_interval_ms: POLL_INTERVAL_MS,
    language: "uk",
  },
];

/** Minimal RSS/Atom feed item shape */
interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  guid?: string;
}

/** Very lightweight RSS XML parser — no external deps */
function parseRssItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string): string => {
      const m = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i").exec(block);
      return m ? m[1].trim() : "";
    };

    items.push({
      title: get("title"),
      link: get("link") || get("guid"),
      pubDate: get("pubDate") || get("dc:date"),
      description: get("description"),
      guid: get("guid"),
    });
  }

  return items;
}

function buildId(source: PressReleaseSource, item: FeedItem): string {
  const slug = (item.guid || item.link).replace(/[^a-zA-Z0-9]/g, "_").slice(-64);
  return `${source}:${slug}`;
}

export class PressReleaseFetcherImpl implements PressReleaseFetcher {
  private readonly lastFetch = new Map<PressReleaseSource, number>();

  async fetchSince(
    sourceConfig: PressReleaseSourceConfig,
    since: Date,
  ): Promise<PressRelease[]> {
    // Enforce poll interval per source
    const last = this.lastFetch.get(sourceConfig.id) ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < sourceConfig.poll_interval_ms) {
      return [];
    }

    this.lastFetch.set(sourceConfig.id, Date.now());

    // Try RSS first
    if (sourceConfig.rss_url) {
      try {
        return await this.fetchRss(sourceConfig, since);
      } catch {
        // Fall through to HTML scrape
      }
    }

    // HTML scrape fallback
    if (sourceConfig.scrape) {
      try {
        return await this.scrapeHtml(sourceConfig, since);
      } catch {
        return [];
      }
    }

    return [];
  }

  private async fetchRss(
    config: PressReleaseSourceConfig,
    since: Date,
  ): Promise<PressRelease[]> {
    const res = await fetch(config.rss_url!, {
      headers: {
        "User-Agent": "AegisLens/1.0",
        Accept: "application/rss+xml, application/atom+xml, text/xml",
      },
    });

    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status}`);
    }

    const xml = await res.text();
    const items = parseRssItems(xml);
    const sinceMs = since.getTime();

    return items
      .filter((item) => {
        if (!item.pubDate) return true;
        const d = new Date(item.pubDate);
        return !isNaN(d.getTime()) && d.getTime() > sinceMs;
      })
      .map((item): PressRelease => ({
        id: buildId(config.id, item),
        source: config.id,
        title: item.title,
        url: item.link,
        summary: item.description
          ? item.description.replace(/<[^>]+>/g, "").slice(0, 500)
          : undefined,
        published_at: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        language: config.language,
        categories: [],
      }));
  }

  private async scrapeHtml(
    config: PressReleaseSourceConfig,
    since: Date,
  ): Promise<PressRelease[]> {
    const res = await fetch(config.page_url, {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    if (!res.ok) {
      throw new Error(`HTML scrape failed: ${res.status}`);
    }

    // Basic structural extraction — no DOM parser available in Node
    // Extracts <a href> links and adjacent text from the page
    const html = await res.text();
    const releases: PressRelease[] = [];

    // Extract article links matching typical news URL patterns
    const linkRegex = /href="((?:https?:\/\/[^"]+)?\/news[^"]*?)"[^>]*>([^<]{10,200})</g;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1].startsWith("http")
        ? match[1]
        : new URL(match[1], config.page_url).toString();

      if (seen.has(href)) continue;
      seen.add(href);

      const title = match[2].trim();
      if (title.length < 10) continue;

      releases.push({
        id: buildId(config.id, { title, link: href }),
        source: config.id,
        title,
        url: href,
        published_at: new Date().toISOString(), // Date unknown from scrape
        language: config.language,
        categories: [],
      });
    }

    return releases.slice(0, 20);
  }

  async fetchAll(since: Date): Promise<PressRelease[]> {
    const results: PressRelease[] = [];
    for (const source of SOURCE_REGISTRY) {
      try {
        const items = await this.fetchSince(source, since);
        results.push(...items);
      } catch {
        // Fail-soft per source
      }
    }
    return results;
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const res = await fetch(SOURCE_REGISTRY[0].page_url, {
        headers: { "User-Agent": "AegisLens/1.0" },
      });
      if (res.ok) return { healthy: true };
      return { healthy: false, message: `Health check returned ${res.status}` };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
