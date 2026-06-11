import type { Locale } from "@aegis/i18n-config";
import { getEntity } from "./entities-seed";
import { eventById } from "./events-seed";
import { getInvestigation } from "./investigations-seed";
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
  pubDate: string;
  iso: string;
  description: string;
  category: string;
  /** Extension fields surfaced under `_aegis` in JSON Feed. */
  ext?: {
    eventClass?: string;
    subclass?: string | null;
    dangerScore?: number;
    confidence?: number;
    verificationState?: string;
    analyst?: string;
    investigationSlug?: string;
  };
};

function collectEntries(slug: string, locale: Locale) {
  const entity = getEntity(slug);
  if (!entity) return null;

  const entries: FeedEntry[] = [];

  for (const eid of entity.relatedEventIds ?? []) {
    const e = eventById(eid);
    if (!e) continue;
    const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
    const d = new Date(e.occurredAt);
    entries.push({
      id: link,
      title: e.summary[locale] ?? e.summary.en,
      link,
      pubDate: d.toUTCString(),
      iso: d.toISOString(),
      description: `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`,
      category: "event",
      ext: {
        eventClass: e.class,
        subclass: e.subclass ?? null,
        dangerScore: e.dangerScore,
        confidence: e.confidence,
        verificationState: e.verificationState,
      },
    });
  }

  for (const islug of entity.relatedInvestigationSlugs ?? []) {
    const inv = getInvestigation(islug);
    if (!inv) continue;
    const link = absoluteUrl(SITE.url, urls.investigation(locale, inv.slug));
    const d = new Date(inv.date);
    entries.push({
      id: link,
      title: inv.title,
      link,
      pubDate: d.toUTCString(),
      iso: d.toISOString(),
      description: inv.summary,
      category: "investigation",
      ext: {
        analyst: inv.analyst,
        investigationSlug: inv.slug,
      },
    });
  }

  entries.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));
  return { entity, entries };
}

export function buildEntityRssFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collectEntries(slug, locale);
  if (!data) return null;
  const { entity, entries } = data;

  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${e.link}</link>
      <guid isPermaLink="true">${e.link}</guid>
      <pubDate>${e.pubDate}</pubDate>
      <description>${esc(e.description)}</description>
      <category>${esc(e.category)}</category>
    </item>`,
    )
    .join("\n");

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.entity(locale, slug));
  const name = entity.name[locale] ?? entity.name.en;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE.name} — ${name}`)}</title>
    <link>${channelLink}</link>
    <description>${esc(`Events and investigations referencing ${name}.`)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export function buildEntityJsonFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collectEntries(slug, locale);
  if (!data) return null;
  const { entity, entries } = data;

  const feedUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.entity(locale, slug));
  const name = entity.name[locale] ?? entity.name.en;

  const body = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${SITE.name} — ${name}`,
    description: `Events and investigations referencing ${name}.`,
    home_page_url: channelLink,
    feed_url: feedUrl,
    language: locale,
    authors: [{ name: SITE.name, url: SITE.url }],
    items: entries.map((e) => ({
      id: e.id,
      url: e.link,
      title: e.title,
      content_text: e.description,
      summary: e.description,
      date_published: e.iso,
      tags: [e.category],
      language: locale,
      ...(e.ext ? { _aegis: e.ext } : {}),
    })),
  };

  return JSON.stringify(body);
}

export function buildEntityAtomFeed(slug: string, locale: Locale, selfPath: string): string | null {
  const data = collectEntries(slug, locale);
  if (!data) return null;
  const { entity, entries } = data;

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const channelLink = absoluteUrl(SITE.url, urls.entity(locale, slug));
  const name = entity.name[locale] ?? entity.name.en;
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
  <title>${esc(`${SITE.name} — ${name}`)}</title>
  <subtitle>${esc(`Events and investigations referencing ${name}.`)}</subtitle>
  <link href="${selfUrl}" rel="self" type="application/atom+xml"/>
  <link href="${channelLink}" rel="alternate" type="text/html"/>
  <updated>${updated}</updated>
  <author><name>${esc(SITE.name)}</name></author>
${items}
</feed>
`;
}
