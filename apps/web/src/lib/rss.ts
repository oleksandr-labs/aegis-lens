import type { Locale } from "@aegis/i18n-config";
import type { AegisEvent } from "@aegis/types";
import { listEvents } from "./events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "./site";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssFeed(locale: Locale, selfPath: string): string {
  const events = listEvents()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.news(locale));

  const items = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const title = escapeXml(e.summary[locale] ?? e.summary.en);
      const desc = escapeXml(
        `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
          e.confidence * 100,
        )}% · ${e.verificationState}`,
      );
      const pubDate = new Date(e.occurredAt).toUTCString();
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <category>${escapeXml(e.class)}</category>
    </item>`;
    })
    .join("\n");

  const channelTitle = locale === "uk" ? `${SITE.name} — події` : `${SITE.name} — events`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

/**
 * Enhanced RSS feed with Google News-compatible fields:
 * - `<ttl>` (60-minute cache hint)
 * - `<pubDate>` in RFC 2822 format
 * - `<category>` tags per event class
 * - `<georss:point>` for geolocation
 */
export function buildGoogleNewsRssFeed(locale: Locale, selfPath: string): string {
  const events = listEvents()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.news(locale));

  const items = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const title = escapeXml(e.summary[locale] ?? e.summary.en);
      const desc = escapeXml(
        `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
          e.confidence * 100,
        )}% · ${e.verificationState}`,
      );
      const pubDate = new Date(e.occurredAt).toUTCString();
      const georss = `<georss:point>${e.location.lat} ${e.location.lon}</georss:point>`;
      const categories = [e.class, e.subclass]
        .filter(Boolean)
        .map((c) => `      <category>${escapeXml(c!)}</category>`)
        .join("\n");
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
${categories}
      ${georss}
    </item>`;
    })
    .join("\n");

  const channelTitle = locale === "uk" ? `${SITE.name} — події` : `${SITE.name} — events`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:georss="http://www.georss.org/georss">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildRssFeedFiltered(
  locale: Locale,
  selfPath: string,
  channelTitleOverride: string,
  filter: (e: AegisEvent) => boolean,
): string {
  const events = listEvents()
    .filter(filter)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.news(locale));

  const items = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const title = escapeXml(e.summary[locale] ?? e.summary.en);
      const desc = escapeXml(
        `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
          e.confidence * 100,
        )}% · ${e.verificationState}`,
      );
      const pubDate = new Date(e.occurredAt).toUTCString();
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <category>${escapeXml(e.class)}</category>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitleOverride)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
