import type { Locale } from "@aegis/i18n-config";
import { listEvents } from "./events-seed";
import { getOblast } from "./oblasts-seed";
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

function regionEvents(bbox: [number, number, number, number]) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return listEvents()
    .filter(
      (e) =>
        e.location.lon >= minLon &&
        e.location.lon <= maxLon &&
        e.location.lat >= minLat &&
        e.location.lat <= maxLat,
    )
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);
}

export function buildRegionAtomFeed(
  country: string,
  oblastSlug: string,
  locale: Locale,
  selfPath: string,
): string | null {
  const o = getOblast(country, oblastSlug);
  if (!o) return null;
  const events = regionEvents(o.bbox);

  const selfUrl = absoluteUrl(SITE.url, selfPath);
  const home = absoluteUrl(SITE.url, `/regions/${country}/${oblastSlug}`);
  const updated = events[0]?.occurredAt
    ? new Date(events[0].occurredAt).toISOString()
    : new Date().toISOString();
  const regionName = (o.name as Record<string, string>)[locale] ?? o.name.en;

  const entries = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const iso = new Date(e.occurredAt).toISOString();
      const summary = `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`;
      return `  <entry>
    <id>${link}</id>
    <title>${esc(e.summary[locale] ?? e.summary.en)}</title>
    <link href="${link}" rel="alternate" type="text/html"/>
    <updated>${iso}</updated>
    <published>${iso}</published>
    <summary>${esc(summary)}</summary>
    <category term="${esc(e.class)}"/>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <id>${selfUrl}</id>
  <title>${esc(`${SITE.name} — ${regionName} (${country.toUpperCase()}) events`)}</title>
  <subtitle>${esc(`Bbox-filtered events within ${regionName}.`)}</subtitle>
  <link href="${selfUrl}" rel="self" type="application/atom+xml"/>
  <link href="${home}" rel="alternate" type="text/html"/>
  <updated>${updated}</updated>
  <author><name>${esc(SITE.name)}</name></author>
${entries}
</feed>
`;
}

export function buildRegionJsonFeed(
  country: string,
  oblastSlug: string,
  locale: Locale,
  selfPath: string,
): string | null {
  const o = getOblast(country, oblastSlug);
  if (!o) return null;
  const events = regionEvents(o.bbox);

  const feedUrl = absoluteUrl(SITE.url, selfPath);
  const home = absoluteUrl(SITE.url, `/regions/${country}/${oblastSlug}`);
  const regionName = (o.name as Record<string, string>)[locale] ?? o.name.en;

  const body = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${SITE.name} — ${regionName} (${country.toUpperCase()}) events`,
    description: `Bbox-filtered events within ${regionName}.`,
    home_page_url: home,
    feed_url: feedUrl,
    language: locale,
    authors: [{ name: SITE.name, url: SITE.url }],
    items: events.map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const summary = `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`;
      return {
        id: link,
        url: link,
        title: e.summary[locale] ?? e.summary.en,
        content_text: summary,
        summary,
        date_published: new Date(e.occurredAt).toISOString(),
        tags: [e.class, ...(e.subclass ? [e.subclass] : [])],
        language: locale,
        _aegis: {
          eventId: e.eventId,
          eventClass: e.class,
          subclass: e.subclass ?? null,
          dangerScore: e.dangerScore,
          confidence: e.confidence,
          verificationState: e.verificationState,
          location: e.location,
        },
      };
    }),
  };

  return JSON.stringify(body);
}
