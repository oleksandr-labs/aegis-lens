import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventById, listEvents } from "@/lib/events-seed";
import { formatDateTime } from "@/lib/format";
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
    title: `Timeline — ${ev.summary[locale] ?? ev.summary.en}`,
    description: `Lifecycle timeline of event ${ev.eventId}: occurred, reported, ingested, verification transitions.`,
    pathFor: (lc) => localePath(lc, `/events/${id}/timeline`),
  });
}

export default async function EventTimelinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) notFound();

  const summary = ev.summary[locale] ?? ev.summary.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/events/${id}/timeline`)}`;

  type TimelineEntry = { ts: string; label: string; detail?: string };
  const entries: TimelineEntry[] = [
    { ts: ev.occurredAt, label: "Occurred", detail: "Event time-of-occurrence." },
    {
      ts: ev.reportedAt,
      label: "Reported",
      detail: "First public reporting time captured by Aegis Lens.",
    },
    {
      ts: ev.ingestedAt,
      label: "Ingested",
      detail: "Aegis Lens corpus ingestion timestamp.",
    },
  ].sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Timeline — ${summary}`,
        description: `Lifecycle timeline of event ${ev.eventId}.`,
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
          { "@type": "ListItem", position: 3, name: "Timeline" },
        ],
      },
    ],
  };

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
          <span className="text-text-secondary">Timeline</span>
        </nav>

        <PageHeader eyebrow="Lifecycle" title={`Timeline — ${ev.eventId}`} description={summary} />

        <section className="mt-8">
          <ol className="space-y-3">
            {entries.map((entry, i) => (
              <li
                key={i}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    {entry.label}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    {formatDateTime(entry.ts, locale)}
                  </span>
                </div>
                {entry.detail && (
                  <p className="mt-2 text-sm text-text-secondary">{entry.detail}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Verification state
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Current state:{" "}
            <strong className="text-text-primary">{ev.verificationState}</strong>. Confidence{" "}
            <strong className="text-text-primary">{Math.round(ev.confidence * 100)}%</strong>,
            danger {ev.dangerScore}/100.
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Verification can transition forward (unverified → geolocated → primary-confirmed)
            or backward (retracted). See{" "}
            <Link
              href={urls.scoring(locale, "confidence")}
              className="text-accent hover:underline"
            >
              /scoring/confidence
            </Link>{" "}
            for how transitions affect the published confidence score.
          </p>
        </section>

        <p className="mt-10 text-xs text-text-muted">
          Event detail:{" "}
          <Link href={urls.event(locale, id)} className="text-accent hover:underline">
            full {ev.eventId}
          </Link>{" "}
          · sources:{" "}
          <Link
            href={urls.eventSources(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/sources
          </Link>{" "}
          · related:{" "}
          <Link
            href={urls.eventRelated(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/related
          </Link>
        </p>
      </article>
    </>
  );
}
