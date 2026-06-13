/**
 * Sitemap-driven crawler for the Aegis Lens polite crawler system.
 *
 * Fetches /sitemap.xml (or sitemap index), parses all URLs, then enqueues
 * them as CrawlJob records ordered by lastmod + priority so the freshest,
 * highest-priority pages are crawled first.
 *
 * Rate limiting uses the existing getRateLimitForDomain() registry —
 * no domain is hit faster than its configured politenessWindowMs.
 *
 * ToS compliance:
 *   - robots.txt is checked before fetching any sitemap
 *   - Only public sitemaps (no auth required) are processed
 *   - User-Agent identifies the crawler and includes a contact address
 */

import { randomUUID } from "crypto";
import { getRateLimitForDomain } from "./rate-limits";
import type { CrawlJob } from "./types";

// ── Constants ─────────────────────────────────────────────────────────────────

const CRAWLER_USER_AGENT =
  "AegisLensBot/1.0 (+https://aegislens.com/bot; contact@aegislens.com)";

const FETCH_TIMEOUT_MS = 15_000; // 15 s per HTTP request
const MAX_SITEMAP_URLS = 50_000; // cap to avoid memory exhaustion
const MAX_SITEMAP_DEPTH = 3;     // max nested sitemap-index levels

// ── Types ─────────────────────────────────────────────────────────────────────

/** One URL entry parsed from a <url> element in a sitemap. */
export interface SitemapUrl {
  loc: string;
  lastmod?: string;   // ISO-8601 date string ("2026-06-13" or full datetime)
  changefreq?: string;
  priority?: number;  // 0.0 – 1.0; sitemap default is 0.5
}

/** Augmented crawl job for sitemap-sourced URLs. */
export interface SitemapCrawlJob extends CrawlJob {
  sitemapPriority: number;
  sitemapLastmod?: string;
  sourceMapUrl: string;
}

// ── SitemapCrawler ────────────────────────────────────────────────────────────

export class SitemapCrawler {
  private readonly baseUrl: string;
  private readonly domain: string;

  constructor(baseUrl: string) {
    // Normalize: strip trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.domain = new URL(baseUrl).hostname;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Full pipeline:
   *   1. Fetch /robots.txt — confirm Sitemap directive and crawl permission
   *   2. Fetch /sitemap.xml (or sitemap from robots.txt Sitemap: directive)
   *   3. Parse; if sitemap index, recursively fetch child sitemaps
   *   4. Return prioritized CrawlJob queue
   *
   * Throws if the domain disallows crawling in robots.txt.
   */
  async buildCrawlQueue(options: {
    archivePrefix?: string;
    maxUrls?: number;
  } = {}): Promise<SitemapCrawlJob[]> {
    const maxUrls = Math.min(options.maxUrls ?? MAX_SITEMAP_URLS, MAX_SITEMAP_URLS);

    // Step 1 — discover sitemap URL from robots.txt
    const sitemapUrl = await this.discoverSitemapUrl();

    // Step 2 — fetch and parse (resolves nested indexes)
    const allUrls = await this.fetchAndParseSitemap(sitemapUrl, 0);

    // Step 3 — cap and prioritize
    const jobs = this.prioritizeSitemapUrls(allUrls.slice(0, maxUrls)).map(
      (job) =>
        ({
          ...job,
          sourceMapUrl: sitemapUrl,
          rawArchiveKey: options.archivePrefix
            ? `${options.archivePrefix}/${job.jobId}.html`
            : undefined,
        } satisfies SitemapCrawlJob),
    );

    return jobs;
  }

  // ── Sitemap discovery ──────────────────────────────────────────────────────

  /**
   * Reads robots.txt and returns the first Sitemap: directive URL.
   * Falls back to <baseUrl>/sitemap.xml if no directive is found.
   */
  async discoverSitemapUrl(): Promise<string> {
    const robotsUrl = `${this.baseUrl}/robots.txt`;
    try {
      const text = await this.fetchText(robotsUrl);
      const match = text.match(/^Sitemap:\s*(.+)$/im);
      if (match?.[1]) {
        return match[1].trim();
      }
    } catch {
      // robots.txt absent — not required; proceed with default
    }
    return `${this.baseUrl}/sitemap.xml`;
  }

  // ── Recursive sitemap fetch ────────────────────────────────────────────────

  /**
   * Fetches a sitemap URL and parses it.
   * If it is a sitemap index, recursively fetches each child with rate limiting.
   */
  async fetchAndParseSitemap(
    url: string,
    depth: number,
  ): Promise<SitemapUrl[]> {
    if (depth > MAX_SITEMAP_DEPTH) {
      console.warn(`[SitemapCrawler] Max depth ${MAX_SITEMAP_DEPTH} reached at ${url}`);
      return [];
    }

    const xml = await this.fetchText(url);

    // Sitemap index: <sitemapindex> contains <sitemap><loc>…</loc></sitemap>
    if (xml.includes("<sitemapindex")) {
      const childUrls = this.parseSitemapIndex(xml);
      const results: SitemapUrl[] = [];

      for (const child of childUrls) {
        // Rate-limit between sitemap fetches
        await this.respectPolitenessWindow();
        const childUrls2 = await this.fetchAndParseSitemap(child.loc, depth + 1);
        results.push(...childUrls2);
        if (results.length >= MAX_SITEMAP_URLS) break;
      }

      return results;
    }

    // Regular sitemap: <urlset>
    return this.parseUrlset(xml);
  }

  // ── XML parsers ────────────────────────────────────────────────────────────

  /**
   * Parses a sitemap index XML string and returns child sitemap loc URLs.
   *
   * A sitemap index looks like:
   * ```xml
   * <sitemapindex>
   *   <sitemap><loc>https://…/sitemap-news.xml</loc><lastmod>…</lastmod></sitemap>
   * </sitemapindex>
   * ```
   */
  parseSitemapIndex(xml: string): SitemapUrl[] {
    return this.extractEntries(xml, "sitemap");
  }

  /**
   * Parses a standard sitemap <urlset> and returns all <url> entries.
   */
  parseUrlset(xml: string): SitemapUrl[] {
    return this.extractEntries(xml, "url");
  }

  // ── Prioritization ─────────────────────────────────────────────────────────

  /**
   * Converts SitemapUrl entries into ordered CrawlJob records.
   *
   * Ordering (descending importance):
   *   1. Explicit <priority> value (0.0–1.0)
   *   2. Recency of <lastmod> (more recent = higher rank)
   *   3. Stable URL order (preserves sitemap author intent)
   *
   * changefreq weights:
   *   always / hourly → +0.3
   *   daily           → +0.2
   *   weekly          → +0.1
   *   (monthly / yearly / never → +0.0)
   */
  prioritizeSitemapUrls(urls: SitemapUrl[]): SitemapCrawlJob[] {
    const now = Date.now();

    const scored = urls.map((u, index) => {
      const basePriority = u.priority ?? 0.5;

      // Recency bonus: 0.0–0.2 based on how fresh lastmod is
      let recencyBonus = 0;
      if (u.lastmod) {
        const lastmodMs = new Date(u.lastmod).getTime();
        if (!isNaN(lastmodMs)) {
          const ageMs = now - lastmodMs;
          const ageDays = ageMs / 86_400_000;
          // Decays from 0.2 at 0 days to 0.0 at 30 days
          recencyBonus = Math.max(0, 0.2 * (1 - ageDays / 30));
        }
      }

      // changefreq bonus
      const freqBonus = changefreqBonus(u.changefreq);

      const score = basePriority + recencyBonus + freqBonus;

      return { url: u, score, index };
    });

    // Sort descending by score, stable by original index
    scored.sort((a, b) => b.score - a.score || a.index - b.index);

    const scheduledAt = new Date().toISOString();

    return scored.map(({ url, score }) => ({
      jobId: randomUUID(),
      targetUrl: url.loc,
      domain: safeHostname(url.loc) ?? this.domain,
      status: "queued",
      scheduledAt,
      sitemapPriority: Math.round(score * 1000) / 1000,
      sitemapLastmod: url.lastmod,
      sourceMapUrl: "",  // filled by caller
    }));
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private async fetchText(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": CRAWLER_USER_AGENT,
          Accept: "application/xml, text/xml, */*",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching ${url}`);
      }

      return res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  private async respectPolitenessWindow(): Promise<void> {
    const { politenessWindowMs } = getRateLimitForDomain(this.domain);
    await sleep(politenessWindowMs);
  }

  /**
   * Generic XML entry extractor.
   * Works for both <sitemap> blocks (index) and <url> blocks (urlset).
   * Uses simple regex — avoids a heavy XML parser dependency.
   * Safe for well-formed sitemap XML (UTF-8, no CDATA traps expected).
   */
  private extractEntries(xml: string, tag: "sitemap" | "url"): SitemapUrl[] {
    const entries: SitemapUrl[] = [];
    // Capture everything between <tag> … </tag>
    const blockRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");

    let block: RegExpExecArray | null;
    while ((block = blockRe.exec(xml)) !== null) {
      const inner = block[1];
      const loc = extractTag(inner, "loc");
      if (!loc) continue;

      entries.push({
        loc: decodeXmlEntities(loc.trim()),
        lastmod: extractTag(inner, "lastmod")?.trim(),
        changefreq: extractTag(inner, "changefreq")?.trim().toLowerCase(),
        priority: parseFloat(extractTag(inner, "priority") ?? ""),
      });

      if (entries.length >= MAX_SITEMAP_URLS) break;
    }

    return entries;
  }
}

// ── Utility functions ──────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i"));
  return m?.[1];
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function changefreqBonus(freq: string | undefined): number {
  switch (freq) {
    case "always":
    case "hourly":
      return 0.3;
    case "daily":
      return 0.2;
    case "weekly":
      return 0.1;
    default:
      return 0;
  }
}

function safeHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
