import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { listEvents } from "@/lib/events-seed";
import { SITE } from "@/lib/site";
import { urls } from "@aegis/url-builder";
import { TimelineClient } from "./TimelineClient";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Timeline — Aegis Lens",
    description:
      "Chronological feed of conflict events with vertical timeline and calendar views. Filter by class, time range, and replay events sequentially.",
    pathFor: (lc) => localePath(lc, "/timeline"),
  });
}

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // All events, sorted newest-first. Client component applies time/class filters.
  const allEvents = listEvents().sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );

  // JSON-LD for top-20 events
  const topEvents = allEvents.slice(0, 20);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aegis Lens — Timeline",
    url: `${SITE.url}${localePath(locale, "/timeline")}`,
    numberOfItems: topEvents.length,
    itemListElement: topEvents.map((e, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE.url}${urls.event(locale, e.eventId)}`,
      name: e.summary[locale] ?? e.summary.en,
      identifier: e.eventId,
      datePublished: e.occurredAt,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Chronology"
        title="Timeline"
        description={`${allEvents.length} events in feed · vertical & calendar views`}
      />
      <TimelineClient allEvents={allEvents} locale={locale} />
    </>
  );
}
