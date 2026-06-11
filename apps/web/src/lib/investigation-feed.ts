import type { Locale } from "@aegis/i18n-config";
import { getInvestigation } from "./investigations-seed";
import { eventById } from "./events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "./site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type FeedEntry = {
  id: string;
  title: string;
  link: string;
  iso: string;
  description: string;
  category: string;
  ext: Record<string, unknown>;
};

function collect(slug: string, locale: Locale) {
  const inv = getInvestigation(slug);
  if (!inv) return null;

  const entries: FeedEntry[] = [];
  for (const eid of inv.citedEventIds ?? []) {
    const e = eventById(eid);
    if (!e) continue;
    const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
    const d = new Date(e.occurredAt);
    entries.push({
      id: link,
      title: e.summary[locale] ?? e.summary.en,
      link,
      iso: d.toISOString(),
      description: `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`,
      category: "event",
      ext: {
        eventId: e.eventId,
        eventClass: e.class,
        subclass: e.subclass ?? null,
        dangerScore: e.dangerScore,
        confidence: e.confidence,
        verificationState: e.verificationState,
        location: e.location,
      },
    });
  }

  entries.sort((a, b) => Date.parse(b.iso) - Date.parse(a.iso));
  return { inv, entries };
}

export function buildInvestigationRssFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collect(slug, locale);
  if (!data) return null;
  const { inv, entries } = data;
  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const home = absoluteUrl(SITE.url, urls.investigation(locale, slug));

  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${e.link}</link>
      <guid isPermaLink="true">${e.link}</guid>
      <pubDate>${new Date(e.iso).toUTCString()}</pubDate>
      <description>${esc(e.description)}</description>
      <category>${esc(e.category)}</category>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — ${inv.title}`)}</title>
    <link>${home}</link>
    <description>${esc(`Events cited by ${inv.title}.`)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildInvestigationAtomFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collect(slug, locale);
  if (!data) return null;
  const { inv, entries } = data;
  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const home = absoluteUrl(SITE.url, urls.investigation(locale, slug));
  const updated = entries[0]?.iso ?? new Date().toISOString();

  const items = entries
    .map(
      (e) => `  <entry>
    <id>${e.id}</id>
    <title>${esc(e.title)}</title>
    <link href="${e.link}" rel="alternate" type="text/html"/>
    <updated>${e.iso}</updated>
    <published>${e.iso}</published>
    <summary>${esc(e.description)}</summary>
    <category term="${esc(e.category)}"/>
  </entry>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <id>${selfUrl}</id>
  <title>${esc(`${SITE.name} — ${inv.title}`)}</title>
  <subtitle>${esc(`Events cited by ${inv.title}.`)}</subtitle>
  <link href="${selfUrl}" rel="self" type="application/atom+xml"/>
  <link href="${home}" rel="alternate" type="text/html"/>
  <updated>${updated}</updated>
  <author><name>${esc(inv.analyst)}</name></author>
${items}
</feed>
`;
}

export function buildInvestigationJsonFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collect(slug, locale);
  if (!data) return null;
  const { inv, entries } = data;
  const feedUrl = absoluteUrl(SITE.url, selfPath);
  const home = absoluteUrl(SITE.url, urls.investigation(locale, slug));

  return JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: `${SITE.name} — ${inv.title}`,
    description: `Events cited by ${inv.title}.`,
    home_page_url: home,
    feed_url: feedUrl,
    language: locale,
    authors: [{ name: inv.analyst }],
    items: entries.map((e) => ({
      id: e.id,
      url: e.link,
      title: e.title,
      content_text: e.description,
      summary: e.description,
      date_published: e.iso,
      tags: [e.category],
      language: locale,
      _aegis: e.ext,
    })),
  });
}
