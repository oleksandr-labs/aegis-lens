import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  eventYearMonths,
  eventsInMonth,
  monthName,
  monthSlug,
  parseMonthSlug,
  parseYearSlug,
} from "@/lib/news-archive";
import { listOblasts, getOblast } from "@/lib/oblasts-seed";
import { eventsInBbox } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string; month: string; region: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

const MIN_EVENTS = 3;

function regionEventsInMonth(regionSlug: string, year: number, month: number) {
  const o = getOblast("ua", regionSlug);
  if (!o) return null;
  const events = eventsInBbox(o.bbox).filter((e) => {
    const d = new Date(e.occurredAt);
    return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
  });
  return { oblast: o, events };
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const oblasts = listOblasts("ua");
  for (const ym of eventYearMonths()) {
    for (const o of oblasts) {
      const result = regionEventsInMonth(o.slug, ym.year, ym.month);
      if (!result || result.events.length < MIN_EVENTS) continue;
      for (const lc of ACTIVE_LOCALES) {
        out.push({
          locale: lc,
          year: String(ym.year),
          month: monthSlug(ym.month),
          region: o.slug,
        });
      }
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, year, month, region } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  if (!y || !m) return { robots: { index: false } };
  const result = regionEventsInMonth(region, y, m);
  if (!result || result.events.length < MIN_EVENTS) return { robots: { index: false } };
  const regionName = result.oblast.name[locale] ?? result.oblast.name.en;
  return buildMetadata({
    locale,
    title: `${regionName} — ${monthName(m)} ${y}`,
    description: `${result.events.length} verified events in ${regionName} during ${monthName(m)} ${y}.`,
    pathFor: (lc) => localePath(lc, `/archive/${y}/${monthSlug(m)}/${region}`),
  });
}

export default async function ArchiveRegionMonthPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, year, month, region } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  if (!y || !m) notFound();
  const result = regionEventsInMonth(region, y, m);
  if (!result || result.events.length < MIN_EVENTS) notFound();

  const { oblast, events } = result;
  const regionName = oblast.name[locale] ?? oblast.name.en;

  // Sort by danger desc then date desc
  const sorted = [...events].sort((a, b) => {
    const ds = b.dangerScore - a.dangerScore;
    return ds !== 0 ? ds : Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
  });

  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);

  // Sibling regions active in this month
  const siblingOblasts = listOblasts("ua")
    .filter((o) => {
      if (o.slug === region) return false;
      const r = regionEventsInMonth(o.slug, y, m);
      return r !== null && r.events.length >= MIN_EVENTS;
    })
    .slice(0, 8);

  // Global count for comparison
  const globalCount = eventsInMonth(y, m).length;

  const pageUrl = `${SITE.url}${localePath(locale, `/archive/${y}/${monthSlug(m)}/${region}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${regionName} — ${monthName(m)} ${y}`,
        description: `${events.length} verified events in ${regionName} during ${monthName(m)} ${y}.`,
        url: pageUrl,
        dateCreated: `${y}-${monthSlug(m)}-01`,
        temporalCoverage: `${y}-${monthSlug(m)}-01/${y}-${monthSlug(m)}-28`,
        about: {
          "@type": "Place",
          name: regionName,
          addressCountry: oblast.iso2.toUpperCase(),
          geo: {
            "@type": "GeoCoordinates",
            latitude: oblast.center[1],
            longitude: oblast.center[0],
          },
        },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Archive", item: `${SITE.url}${localePath(locale, "/archive")}` },
          {
            "@type": "ListItem",
            position: 2,
            name: `${monthName(m)} ${y}`,
            item: `${SITE.url}${localePath(locale, `/archive/${y}/${monthSlug(m)}`)}`,
          },
          { "@type": "ListItem", position: 3, name: regionName },
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

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={localePath(locale, "/archive")} className="hover:text-text-primary">
            Archive
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link
            href={localePath(locale, `/archive/${y}/${monthSlug(m)}`)}
            className="hover:text-text-primary"
          >
            {monthName(m)} {y}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{regionName}</span>
        </nav>

        <PageHeader
          eyebrow={`${oblast.kindLabel} · Regional archive`}
          title={`${regionName} — ${monthName(m)} ${y}`}
          description={`${events.length} verified events in ${regionName} during ${monthName(m)} ${y}.`}
        />

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Events this region" value={String(events.length)} />
          <Stat label="All Ukraine this month" value={String(globalCount)} />
          <Stat
            label="Share of total"
            value={`${Math.round((events.length / Math.max(globalCount, 1)) * 100)}%`}
          />
        </div>

        {/* By class */}
        {byClass.size > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
              By class
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {[...byClass.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([cls, n]) => (
                  <li key={cls} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: CLASS_COLOR[cls as keyof typeof CLASS_COLOR] }}
                    />
                    <Link
                      href={urls.topic(locale, cls)}
                      className="text-text-secondary hover:text-accent"
                    >
                      {CLASS_LABEL[cls] ?? cls}
                    </Link>
                    <span className="font-mono text-[10px] text-text-muted">{n}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Event list — sorted by danger desc */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">
            Events (highest danger first)
          </h2>
          <ul className="mt-3 space-y-2">
            {sorted.map((e) => (
              <li key={e.eventId}>
                <Link
                  href={urls.event(locale, e.eventId)}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    <span>{e.class}{e.subclass ? ` · ${e.subclass}` : ""} · {e.occurredAt.slice(0, 10)}</span>
                    <span className="text-accent">danger {e.dangerScore}</span>
                  </div>
                  <div className="mt-1 text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Sibling regions */}
        {siblingOblasts.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other regions in {monthName(m)} {y}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblingOblasts.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={localePath(locale, `/archive/${y}/${monthSlug(m)}/${o.slug}`)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent"
                  >
                    {o.name[locale] ?? o.name.en}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8">
          <Link
            href={urls.region(locale, oblast.iso2, oblast.slug)}
            className="font-mono text-xs text-accent hover:underline"
          >
            View {regionName} full region page →
          </Link>
        </div>
      </article>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-text-primary">{value}</div>
    </div>
  );
}
