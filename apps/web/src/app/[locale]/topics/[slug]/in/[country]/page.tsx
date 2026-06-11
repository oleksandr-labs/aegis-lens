import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import type { EventClass } from "@aegis/types";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { eventsInCountry } from "@/lib/events-seed";
import { listRegions, getRegion } from "@/lib/regions-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; country: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of ALL_CLASSES) {
    for (const r of listRegions()) {
      // Only emit pages where the intersection actually has events.
      const events = eventsInCountry(r.iso2).filter((e) => e.class === c.id);
      if (events.length === 0) continue;
      for (const lc of ACTIVE_LOCALES) {
        out.push({ locale: lc, slug: c.id, country: r.iso2 });
      }
    }
  }
  return out;
}

function classByIdSafe(slug: string): { id: EventClass; label: string } | null {
  const c = ALL_CLASSES.find((x) => x.id === slug);
  return c ? { id: c.id as EventClass, label: c.label } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  const region = getRegion(country);
  if (!cls || !region) return { robots: { index: false } };
  const events = eventsInCountry(country).filter((e) => e.class === cls.id);
  if (events.length === 0) return { robots: { index: false } };
  const countryLabel = region.name[locale] ?? region.name.en;
  return buildMetadata({
    locale,
    title: `${cls.label} events in ${countryLabel}`,
    description: `${events.length} verified ${cls.label.toLowerCase()} events in ${countryLabel}, catalogued by Aegis Lens.`,
    pathFor: (lc) => localePath(lc, `/topics/${slug}/in/${country}`),
  });
}

export default async function TopicCountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, country } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  const region = getRegion(country);
  if (!cls || !region) notFound();
  const events = eventsInCountry(country)
    .filter((e) => e.class === cls.id)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  if (events.length === 0) notFound();

  const countryLabel = region.name[locale] ?? region.name.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/topics/${slug}/in/${country}`)}`;

  // Stats
  const avgDanger = Math.round(
    events.reduce((s, e) => s + e.dangerScore, 0) / events.length,
  );
  const avgConfidence = (
    events.reduce((s, e) => s + e.confidence, 0) / events.length
  ).toFixed(2);

  // Sibling links: same topic other countries, same country other topics.
  const sameTopicOtherCountries = listRegions()
    .filter((r) => r.iso2 !== country)
    .map((r) => ({
      iso2: r.iso2,
      label: r.name[locale] ?? r.name.en,
      count: eventsInCountry(r.iso2).filter((e) => e.class === cls.id).length,
    }))
    .filter((x) => x.count > 0);

  const sameCountryOtherTopics = ALL_CLASSES.filter((c) => c.id !== cls.id)
    .map((c) => ({
      id: c.id,
      label: c.label,
      count: eventsInCountry(country).filter((e) => e.class === c.id).length,
    }))
    .filter((x) => x.count > 0);

  // Parametric FAQ — same shape per (class × country)
  const faqs: { q: string; a: string }[] = [
    {
      q: `How many ${cls.label.toLowerCase()} events has Aegis Lens catalogued in ${countryLabel}?`,
      a: `${events.length} verified ${cls.label.toLowerCase()} ${events.length === 1 ? "event" : "events"} as of the last build. The count refreshes on every event ingest; the live total may differ slightly. Average danger across this set is ${Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)}/100.`,
    },
    {
      q: `Are these events independently verified?`,
      a: `Every event has a confidence score derived from the seven-check verification workflow. See /methodology/verification for the discipline. The "All events" list above shows confidence and danger inline.`,
    },
    {
      q: `Can I subscribe to this slice as a feed?`,
      a: `Yes. The /topics/${cls.id}/feed.xml RSS feed carries the same class globally; combine with country bbox filtering at your end, or use GET /api/events?country=${country}&class=${cls.id} for a direct programmatic pull.`,
    },
    {
      q: `Why might the count here differ from /incidents?`,
      a: `Incidents are filtered to danger ≥ 70 and confidence ≥ 0.7 in the past 90 days. This page lists every event in the (class, country) intersection regardless of severity. /incidents is a subset.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${cls.label} events in ${countryLabel}`,
        description: `${events.length} verified ${cls.label.toLowerCase()} events in ${countryLabel}.`,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
        about: {
          "@type": "Place",
          name: countryLabel,
          address: { "@type": "PostalAddress", addressCountry: country.toUpperCase() },
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: events.length,
          itemListElement: events.slice(0, 20).map((e, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${SITE.url}${urls.event(locale, e.eventId)}`,
            name: e.summary[locale] ?? e.summary.en,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Topics",
            item: `${SITE.url}${urls.topics(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: cls.label,
            item: `${SITE.url}${urls.topic(locale, cls.id)}`,
          },
          { "@type": "ListItem", position: 3, name: countryLabel },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.topics(locale)} className="hover:text-text-primary">
            Topics
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.topic(locale, cls.id)} className="hover:text-text-primary">
            {cls.label}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{countryLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${cls.label} × ${countryLabel}`}
          title={`${cls.label} events in ${countryLabel}`}
          description={`${events.length} verified events in this topic × country intersection.`}
        />

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Events
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{events.length}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Avg danger
            </div>
            <div className="mt-1 text-2xl font-semibold text-accent">{avgDanger}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Avg confidence
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{avgConfidence}</div>
          </div>
          <div className="rounded border border-border-subtle bg-bg-surface p-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Class
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: CLASS_COLOR[cls.id] }}
              />
              <span className="text-sm font-semibold text-text-primary">{cls.label}</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">All events</h2>
          <ul className="mt-3 space-y-2">
            {events.map((e) => (
              <li key={e.eventId}>
                <Link
                  href={urls.event(locale, e.eventId)}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {e.class}{e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
                    {e.occurredAt.slice(0, 10)} · danger {e.dangerScore}
                  </div>
                  <div className="mt-1 text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {sameTopicOtherCountries.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              {cls.label} in other countries
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameTopicOtherCountries.map((c) => (
                <li key={c.iso2}>
                  <Link
                    href={urls.topicCountry(locale, cls.id, c.iso2)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sameCountryOtherTopics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Other topics in {countryLabel}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameCountryOtherTopics.map((c) => (
                <li key={c.id}>
                  <Link
                    href={urls.topicCountry(locale, c.id, country)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded border border-border-subtle bg-bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-text-muted">
          See also{" "}
          <Link href={urls.topic(locale, cls.id)} className="text-accent hover:underline">
            all {cls.label.toLowerCase()} events
          </Link>{" "}
          ·{" "}
          <Link href={urls.country(locale, country)} className="text-accent hover:underline">
            {countryLabel} country brief
          </Link>{" "}
          ·{" "}
          <Link
            href={urls.topicFeed(locale, cls.id)}
            className="text-accent hover:underline"
          >
            {cls.label} RSS feed
          </Link>
        </p>
      </article>
    </>
  );
}
