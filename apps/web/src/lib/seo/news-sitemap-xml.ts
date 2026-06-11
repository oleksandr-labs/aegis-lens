import type { AegisEvent } from "@aegis/types";
import { SITE } from "@/lib/site";

/**
 * Google News sitemap XML builder (`<news:news>`).
 *
 * Focused purely on the XML rendering: callers pass the event slice (the crawl
 * cluster owns selection/scheduling). Per Google's spec a News sitemap should
 * only contain articles published in the last 48 hours, so `filterRecent`
 * applies that window; the builder enforces it again defensively.
 *
 * Named `news-sitemap-xml.ts` to avoid colliding with the crawl cluster's
 * `news-sitemap.ts` selection module.
 */

const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;
/** Google rejects News sitemaps with more than 1,000 URLs. */
export const MAX_NEWS_URLS = 1000;

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Keep only events published within the last 48h relative to `now`. */
export function filterRecent(
  events: AegisEvent[],
  now: number = Date.now(),
): AegisEvent[] {
  return events
    .filter((e) => {
      const t = Date.parse(e.occurredAt);
      return Number.isFinite(t) && now - t <= NEWS_WINDOW_MS && t <= now;
    })
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, MAX_NEWS_URLS);
}

export type NewsSitemapOptions = {
  /** Publication name in the <news:publication> block. */
  publicationName?: string;
  /** Publication language (Google News expects ISO 639). */
  language?: string;
  /** Override "now" for deterministic tests. */
  now?: number;
  /** Pre-filtered: skip the 48h window (caller already applied it). */
  preFiltered?: boolean;
};

/** Render the `<urlset>` News sitemap for a list of events. */
export function buildNewsSitemapXml(
  events: AegisEvent[],
  opts: NewsSitemapOptions = {},
): string {
  const {
    publicationName = `${SITE.name} Intelligence`,
    language = "en",
    now = Date.now(),
    preFiltered = false,
  } = opts;
  const selected = preFiltered ? events.slice(0, MAX_NEWS_URLS) : filterRecent(events, now);

  const items = selected
    .map((ev) => {
      const keywords = [ev.class, ev.subclass ?? "", "osint", "ukraine"]
        .filter(Boolean)
        .join(", ");
      return `  <url>
    <loc>${escXml(`${SITE.url}/events/${ev.eventId}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escXml(publicationName)}</news:name>
        <news:language>${escXml(language)}</news:language>
      </news:publication>
      <news:publication_date>${escXml(ev.occurredAt)}</news:publication_date>
      <news:title>${escXml(ev.summary.en)}</news:title>
      <news:keywords>${escXml(keywords)}</news:keywords>
    </news:news>
    <lastmod>${escXml(ev.occurredAt)}</lastmod>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;
}
