import { listEvents } from "@/lib/events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/**
 * Atom 1.0 feed alongside the RSS feed at /news/feed.xml. Some readers
 * (especially research / academic stacks) prefer Atom for entry IDs and
 * `<updated>` semantics.
 */
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const events = listEvents()
    .slice()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const selfUrl = `${SITE.url}/news/atom.xml`;
  const updated =
    events[0]?.occurredAt
      ? new Date(events[0].occurredAt).toISOString()
      : new Date().toISOString();

  const entries = events
    .map((e) => {
      const link = absoluteUrl(SITE.url, urls.event("en", e.eventId));
      const title = e.summary.en;
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
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${selfUrl}</id>
  <title>${esc(`${SITE.name} — events`)}</title>
  <subtitle>${esc(SITE.description)}</subtitle>
  <link href="${selfUrl}" rel="self" type="application/atom+xml"/>
  <link href="${SITE.url}${urls.news("en")}" rel="alternate" type="text/html"/>
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
