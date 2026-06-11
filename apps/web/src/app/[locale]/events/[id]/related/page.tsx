import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventById, listEvents } from "@/lib/events-seed";
import { findOblast } from "@/lib/region-lookup";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

type Params = { locale: string; id: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const e of listEvents()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, id: e.eventId });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Related — ${ev.summary[locale] ?? ev.summary.en}`,
    description: `Related events to ${ev.eventId} — same class, same region, same time window.`,
    pathFor: (lc) => localePath(lc, `/events/${id}/related`),
  });
}

export default async function EventRelatedPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) notFound();

  const summary = ev.summary[locale] ?? ev.summary.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/events/${id}/related`)}`;

  const allOthers = listEvents().filter((e) => e.eventId !== ev.eventId);

  // Same class — last 30
  const sameClass = allOthers.filter((e) => e.class === ev.class).slice(0, 8);

  // Same oblast (if event's coords are inside one)
  const ob = findOblast(ev.location.lon, ev.location.lat);
  const sameRegion = ob
    ? allOthers.filter((e) => {
        const o2 = findOblast(e.location.lon, e.location.lat);
        return o2?.slug === ob.slug && o2.iso2 === ob.iso2;
      })
    : [];

  // Same 48-hour window
  const ms = Date.parse(ev.occurredAt);
  const window = 48 * 3600 * 1000;
  const sameWindow = allOthers
    .filter((e) => Math.abs(Date.parse(e.occurredAt) - ms) <= window)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Related — ${ev.eventId}`,
        description: `Related events to ${ev.eventId}.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        inLanguage: locale,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Events",
            item: `${SITE.url}${urls.news(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ev.eventId,
            item: `${SITE.url}${urls.event(locale, id)}`,
          },
          { "@type": "ListItem", position: 3, name: "Related" },
        ],
      },
    ],
  };

  const renderList = (events: typeof allOthers) => (
    <ul className="mt-3 space-y-2">
      {events.map((e) => (
        <li key={e.eventId}>
          <Link
            href={urls.event(locale, e.eventId)}
            className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {e.class}{e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
              {timeAgo(e.occurredAt, locale)} · danger {e.dangerScore}
            </div>
            <div className="mt-1 text-text-primary">
              {e.summary[locale] ?? e.summary.en}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.event(locale, id)} className="hover:text-text-primary">
            {ev.eventId}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Related</span>
        </nav>

        <PageHeader
          eyebrow="Cross-references"
          title={`Related — ${ev.eventId}`}
          description={summary}
        />

        {sameClass.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Same class — {ev.class}
            </h2>
            {renderList(sameClass)}
          </section>
        )}

        {ob && sameRegion.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Same region — {ob.name[locale] ?? ob.name.en}
            </h2>
            {renderList(sameRegion)}
          </section>
        )}

        {sameWindow.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Within 48 hours of this event
            </h2>
            {renderList(sameWindow)}
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Lifecycle:{" "}
          <Link
            href={urls.eventTimeline(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/timeline
          </Link>{" "}
          · provenance:{" "}
          <Link
            href={urls.eventSources(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/sources
          </Link>{" "}
          · media:{" "}
          <Link
            href={urls.eventMedia(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/media
          </Link>
        </p>
      </article>
    </>
  );
}
