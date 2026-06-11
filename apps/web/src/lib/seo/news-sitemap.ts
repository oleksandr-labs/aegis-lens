/**
 * Google News sitemap builder (last 48h).
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - News sitemap (last 48h)
 *
 * Google News only indexes URLs in a News sitemap that were published within the
 * last 2 days, so this builder filters to a 48h window and renders the
 * `<news:news>` schema. Extracted into a pure, testable module; the existing
 * route at `apps/web/src/app/news/sitemap.xml/route.ts` can be re-wired to call
 * `renderNewsSitemap()` (see handoff for the proposed route change).
 *
 * No network — caller passes events + base URL.
 */

import { absoluteUrl } from "@aegis/url-builder";
import { ACTIVE_LOCALES, type Locale } from "@aegis/i18n-config";

export type NewsArticle = {
  /** Locale-prefixed canonical path, e.g. "/events/01H..". */
  path: string;
  /** ISO 8601 publication date. */
  publishedAt: string;
  /** Per-locale title; `en` required. */
  title: Partial<Record<Locale, string>> & { en: string };
  /** Comma-separated keywords (built by caller). */
  keywords?: string;
  /** Article language (defaults to "en"). */
  language?: Locale;
};

export const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

export const NEWS_PUBLICATION_NAME = "Aegis Lens Intelligence";

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Filter to the Google-News-eligible 48h window, newest first, capped at `limit`. */
export function newsWindow<T extends { publishedAt: string }>(
  articles: T[],
  now: Date = new Date(),
  windowMs: number = NEWS_WINDOW_MS,
  limit = 1000,
): T[] {
  const cutoff = now.getTime() - windowMs;
  return articles
    .filter((a) => {
      const t = Date.parse(a.publishedAt);
      return !Number.isNaN(t) && t >= cutoff && t <= now.getTime();
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}

export type NewsSitemapOptions = {
  siteUrl: string;
  now?: Date;
  publicationName?: string;
  windowMs?: number;
  limit?: number;
};

/** Render a Google News sitemap XML string from articles in the 48h window. */
export function renderNewsSitemap(
  articles: NewsArticle[],
  opts: NewsSitemapOptions,
): string {
  const { siteUrl, now = new Date(), publicationName = NEWS_PUBLICATION_NAME } = opts;
  const recent = newsWindow(articles, now, opts.windowMs, opts.limit);

  const items = recent
    .map((a) => {
      const lang = a.language ?? "en";
      const title = a.title[lang] ?? a.title.en;
      const loc = escXml(absoluteUrl(siteUrl, a.path));
      const kw = a.keywords ? `\n      <news:keywords>${escXml(a.keywords)}</news:keywords>` : "";
      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${escXml(publicationName)}</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${escXml(a.publishedAt)}</news:publication_date>
      <news:title>${escXml(title)}</news:title>${kw}
    </news:news>
    <lastmod>${escXml(a.publishedAt)}</lastmod>
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

/** Ensure a language is one we actually ship; otherwise fall back to en. */
export function newsLanguage(locale: Locale): Locale {
  return ACTIVE_LOCALES.includes(locale) ? locale : "en";
}
