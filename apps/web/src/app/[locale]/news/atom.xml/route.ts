import { isLocale, type Locale } from "@aegis/i18n-config";
import { listEvents } from "@/lib/events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/** Locale-prefixed Atom 1.0 — `/uk/news/atom.xml` etc. */
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const events = listEvents()
    .slice()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const selfPath =
    locale === "en" ? `/news/atom.xml` : `/${locale}/news/atom.xml`;
  const selfUrl = `${SITE.url}${selfPath}`;
  const updated =
    events[0]?.occurredAt
      ? new Date(events[0].occurredAt).toISOString()
      : new Date().toISOString();

  const entries = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event(locale, e.eventId));
      const title = e.summary[locale] ?? e.summary.en;
      const summary = `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`;
      const updatedAt = new Date(e.occurredAt).toISOString();
      return `  <entry>
    <id>${link}</id>
    <title>${esc(title)}</title>
    <link href="${link}" rel="alternate" type="text/html"/>
    <updated>${updatedAt}</updated>
    <published>${updatedAt}</published>
    <summary>${esc(summary)}</summary>
    <category term="${esc(e.class)}"/>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">
  <id>${selfUrl}</id>
  <title>${esc(`${SITE.name} — events`)}</title>
  <subtitle>${esc(SITE.description)}</subtitle>
  <link href="${selfUrl}" rel="self" type="application/atom+xml"/>
  <link href="${SITE.url}${urls.news(locale)}" rel="alternate" type="text/html"/>
  <updated>${updated}</updated>
  <author><name>${esc(SITE.name)}</name></author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
