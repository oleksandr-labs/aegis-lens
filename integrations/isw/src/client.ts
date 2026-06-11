/**
 * Client for the ISW (Institute for the Study of War) daily ROCA blog / RSS feed.
 *
 * ISW publishes the "Russia Offensive Campaign Assessment" daily at:
 *   https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-...
 * and syndicates posts via an RSS feed:
 *   https://www.understandingwar.org/rss.xml
 *
 * CRAWLER DISCIPLINE (see COMPLIANCE.md):
 *   - ISW is a non-profit; their content is © ISW. We fetch the public RSS only.
 *   - Polite cadence: at most ONE fetch per `minIntervalMs` (default 6h) — the
 *     assessment is published roughly once per day, so polling more is wasteful.
 *   - Identifying User-Agent with contact URL.
 *   - We store/republish only short attributed snippets, never the full body.
 *
 * No secrets required (public feed). A DEMO fixture is bundled so the integration
 * is usable offline / in CI without live network access.
 */

import type { IswAssessment, RssItem } from "./types";

export interface IswClientConfig {
  /** Override the RSS feed URL (testing / mirrors). */
  rssUrl?: string;
  /** Minimum interval between live fetches (ms). Default 6h. */
  minIntervalMs?: number;
  /** Request timeout (ms). Default 15s. */
  timeoutMs?: number;
  /** User-Agent string (must identify the crawler + contact). */
  userAgent?: string;
  /** Force demo mode (never hit the network). */
  demo?: boolean;
}

const DEFAULT_RSS_URL = "https://www.understandingwar.org/rss.xml";
const DEFAULT_USER_AGENT =
  "AegisLens-ISW-Integration/1.0 (+https://aegislens.example/contact; OSINT aggregation, fair-use snippets only)";

/** Bundled demo assessment so the package works without network / secrets. */
export const DEMO_ASSESSMENT: IswAssessment = {
  assessmentId: "isw-roca-demo",
  assessmentDate: "2026-06-05",
  title: {
    en: "Russian Offensive Campaign Assessment, June 5, 2026",
    uk: "Оцінка російської наступальної кампанії, 5 червня 2026 (AI-переклад)",
  },
  url: "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-june-5-2026",
  publishedAt: "2026-06-05T23:30:00Z",
  bodyText:
    "Russian forces continued offensive operations near Pokrovsk and made marginal " +
    "advances southwest of Avdiivka on June 5. Ukrainian forces conducted localized " +
    "counterattacks near Kupiansk in Kharkiv Oblast. Russian milbloggers claimed that " +
    "elements of the Russian 3rd Combined Arms Army advanced near Chasiv Yar, though " +
    "ISW has not observed confirmation of these claims. Ukrainian forces reportedly " +
    "struck a Russian ammunition depot in occupied Donetsk Oblast using HIMARS.",
  keyTakeaways: [
    "Russian forces made marginal confirmed advances southwest of Avdiivka.",
    "Ukrainian forces conducted localized counterattacks near Kupiansk, Kharkiv Oblast.",
    "Russian claims of advances near Chasiv Yar remain unconfirmed by ISW.",
    "Ukrainian HIMARS reportedly struck a Russian ammunition depot in Donetsk Oblast.",
  ],
  byline: "Institute for the Study of War",
  isDemo: true,
};

export class IswClient {
  private readonly rssUrl: string;
  private readonly minIntervalMs: number;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private readonly demo: boolean;
  private lastFetchMs = 0;
  private cachedRaw: string | null = null;

  constructor(config: IswClientConfig = {}) {
    this.rssUrl = config.rssUrl ?? DEFAULT_RSS_URL;
    this.minIntervalMs = config.minIntervalMs ?? 6 * 60 * 60 * 1000;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.userAgent = config.userAgent ?? DEFAULT_USER_AGENT;
    // Demo if explicitly requested OR if env opts out of live fetches.
    this.demo = config.demo ?? process.env.ISW_DISABLE_FETCH === "1";
  }

  /**
   * Fetch the latest ISW assessments from the RSS feed.
   * Returns the bundled demo fixture in demo mode or on any fetch failure
   * (fail-soft: the product should still render with the last-known demo data).
   */
  async getLatestAssessments(limit = 5): Promise<IswAssessment[]> {
    if (this.demo) return [DEMO_ASSESSMENT];

    let raw: string;
    try {
      raw = await this.fetchRss();
    } catch {
      // Fail-soft to demo fixture.
      return [DEMO_ASSESSMENT];
    }

    const items = parseRss(raw)
      .filter((it) => /offensive campaign assessment/i.test(it.title))
      .slice(0, limit);

    if (items.length === 0) return [DEMO_ASSESSMENT];
    return items.map(rssItemToAssessment);
  }

  /** Fetch only the single most-recent ROCA. */
  async getTodayAssessment(): Promise<IswAssessment> {
    const list = await this.getLatestAssessments(1);
    return list[0] ?? DEMO_ASSESSMENT;
  }

  /** True if a live fetch is permitted under the polite-cadence policy. */
  canFetchNow(now = Date.now()): boolean {
    return now - this.lastFetchMs >= this.minIntervalMs;
  }

  private async fetchRss(): Promise<string> {
    const now = Date.now();
    // Respect polite cadence: reuse cached body if fetched recently.
    if (this.cachedRaw && !this.canFetchNow(now)) return this.cachedRaw;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.rssUrl, {
        headers: { "User-Agent": this.userAgent, Accept: "application/rss+xml, application/xml, text/xml" },
        signal: controller.signal,
      });
      if (!res.ok) throw new IswFetchError(res.status, `RSS fetch failed: ${res.status}`);
      const text = await res.text();
      this.cachedRaw = text;
      this.lastFetchMs = now;
      return text;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class IswFetchError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "IswFetchError";
  }
}

// ── RSS parsing (dependency-free, tolerant) ─────────────────────────────────────

/**
 * Minimal RSS 2.0 parser. Avoids adding an XML dependency; tolerant of the
 * Drupal-generated feed ISW serves. Not a general-purpose XML parser.
 */
export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  for (const block of itemBlocks) {
    const title = unescapeXml(pickTag(block, "title") ?? "").trim();
    const link = unescapeXml(pickTag(block, "link") ?? "").trim();
    if (!title || !link) continue;
    items.push({
      title,
      link,
      pubDate: pickTag(block, "pubDate")?.trim(),
      description: unescapeXml(pickTag(block, "description") ?? "").trim() || undefined,
      content: unescapeXml(pickTag(block, "content:encoded") ?? "").trim() || undefined,
      guid: pickTag(block, "guid")?.trim(),
    });
  }
  return items;
}

function pickTag(block: string, tag: string): string | undefined {
  const escaped = tag.replace(/[:]/g, "\\:");
  const re = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return stripCdata(m[1]);
}

function stripCdata(s: string): string {
  const m = s.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return m ? m[1] : s;
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Strip HTML tags to recover plain text from an RSS content body. */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>(?=)/gi, "\n")
    .replace(/<\/(p|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function rssItemToAssessment(item: RssItem): IswAssessment {
  const body = htmlToText(item.content ?? item.description ?? "");
  const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
  const assessmentDate = publishedAt.slice(0, 10);
  const keyTakeaways = extractKeyTakeaways(body);

  return {
    assessmentId: `isw-roca-${assessmentDate}`,
    assessmentDate,
    title: { en: item.title },
    url: item.link,
    publishedAt,
    bodyText: body,
    keyTakeaways,
    byline: "Institute for the Study of War",
    isDemo: false,
  };
}

/** Heuristically pull ISW "Key Takeaways" bullets out of the body text. */
export function extractKeyTakeaways(body: string): string[] {
  const idx = body.search(/key takeaways/i);
  const region = idx >= 0 ? body.slice(idx) : body;
  const lines = region
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•\-–*]+/, "").trim())
    .filter((l) => l.length > 20 && l.length < 400);
  return lines.slice(0, 10);
}
