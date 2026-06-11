import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

/**
 * JSON Feed 1.1 (`application/feed+json`) alongside the existing
 * RSS 2.0 and Atom 1.0 feeds. Spec: https://www.jsonfeed.org/version/1.1/
 *
 * Lots of modern feed clients (NetNewsWire, Inoreader, FeedLand) prefer
 * JSON Feed because it avoids XML namespacing headaches.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const events = listEvents()
    .slice()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const feedUrl = `${SITE.url}/news/feed.json`;

  const body = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${SITE.name} — events`,
    description: SITE.description,
    home_page_url: absoluteUrl(SITE.url, urls.news("en")),
    feed_url: feedUrl,
    language: "en",
    authors: [{ name: SITE.name, url: SITE.url }],
    items: events.map((e) => {
      const link = absoluteUrl(SITE.url, urls.event("en", e.eventId));
      const summary = `${e.class}/${e.subclass ?? "—"} · danger ${e.dangerScore}/100 · confidence ${Math.round(
        e.confidence * 100,
      )}% · ${e.verificationState}`;
      return {
        id: link,
        url: link,
        title: e.summary.en,
        content_text: summary,
        summary,
        date_published: new Date(e.occurredAt).toISOString(),
        tags: [e.class, ...(e.subclass ? [e.subclass] : [])],
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

  return NextResponse.json(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
