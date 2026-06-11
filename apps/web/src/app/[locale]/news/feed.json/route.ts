import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { listEvents } from "@/lib/events-seed";
import { absoluteUrl, urls } from "@aegis/url-builder";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

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
    locale === "en" ? `/news/feed.json` : `/${locale}/news/feed.json`;
  const feedUrl = `${SITE.url}${selfPath}`;

  const body = {
    version: "https://jsonfeed.org/version/1.1",
    title: locale === "uk" ? `${SITE.name} — події` : `${SITE.name} — events`,
    description: SITE.description,
    home_page_url: absoluteUrl(SITE.url, urls.news(locale)),
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

  return NextResponse.json(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
