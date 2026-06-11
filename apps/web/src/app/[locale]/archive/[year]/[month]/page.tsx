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
import { listOblasts } from "@/lib/oblasts-seed";
import { eventsInBbox } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string; month: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

const MIN_EVENTS_TO_INDEX = 3;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const ym of eventYearMonths()) {
    const events = eventsInMonth(ym.year, ym.month);
    if (events.length < MIN_EVENTS_TO_INDEX) continue;
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, year: String(ym.year), month: monthSlug(ym.month) });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, year, month } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  if (!y || !m) return { robots: { index: false } };
  const events = eventsInMonth(y, m);
  if (events.length < MIN_EVENTS_TO_INDEX) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${monthName(m)} ${y} — event archive`,
    description: `${events.length} verified Aegis Lens events from ${monthName(m)} ${y}. Browse by region or event class.`,
    pathFor: (lc) => localePath(lc, `/archive/${y}/${monthSlug(m)}`),
  });
}

export default async function ArchiveMonthPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, year, month } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  if (!y || !m) notFound();
  const events = eventsInMonth(y, m);
  if (events.length < MIN_EVENTS_TO_INDEX) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/archive/${y}/${monthSlug(m)}`)}`;
  const prevMonth = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
  const nextMonth = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  const hasPrev = eventsInMonth(prevMonth.y, prevMonth.m).length >= MIN_EVENTS_TO_INDEX;
  const hasNext = eventsInMonth(nextMonth.y, nextMonth.m).length >= MIN_EVENTS_TO_INDEX;

  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);

  // Oblasts with enough events in this month for a regional archive page
  const activeOblasts = listOblasts("ua").filter((o) => {
    const regionEvents = eventsInBbox(o.bbox).filter((e) => {
      const d = new Date(e.occurredAt);
      return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
    });
    return regionEvents.length >= MIN_EVENTS_TO_INDEX;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${monthName(m)} ${y} — event archive`,
        description: `${events.length} verified events from ${monthName(m)} ${y}.`,
        url: pageUrl,
        dateCreated: `${y}-${monthSlug(m)}-01`,
        temporalCoverage: `${y}-${monthSlug(m)}-01/${y}-${monthSlug(m)}-28`,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
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
          { "@type": "ListItem", position: 1, name: "Archive", item: `${SITE.url}${localePath(locale, "/archive")}` },
          { "@type": "ListItem", position: 2, name: String(y), item: `${SITE.url}${localePath(locale, `/archive/${y}`)}` },
          { "@type": "ListItem", position: 3, name: monthName(m) },
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
          <span className="text-text-secondary">{monthName(m)} {y}</span>
        </nav>

        <PageHeader
          eyebrow="Monthly archive"
          title={`${monthName(m)} ${y}`}
          description={`${events.length} verified events across ${byClass.size} event classes.`}
        />

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
                    <Link href={urls.topic(locale, cls)} className="text-text-secondary hover:text-accent">
                      {CLASS_LABEL[cls] ?? cls}
                    </Link>
                    <span className="font-mono text-[10px] text-text-muted">{n}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* Regional breakdowns */}
        {activeOblasts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-semibold text-text-primary">Regional breakdowns</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {activeOblasts.map((o) => (
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

        {/* Event list */}
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
                    {e.class}{e.subclass ? ` · ${e.subclass}` : ""} · {e.occurredAt.slice(0, 10)} · danger {e.dangerScore}
                  </div>
                  <div className="mt-1 text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Prev / next navigation */}
        <nav className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6" aria-label="Month navigation">
          {hasPrev ? (
            <Link
              href={localePath(locale, `/archive/${prevMonth.y}/${monthSlug(prevMonth.m)}`)}
              className="font-mono text-xs text-accent hover:underline"
            >
              ← {monthName(prevMonth.m)} {prevMonth.y}
            </Link>
          ) : <span />}
          {hasNext ? (
            <Link
              href={localePath(locale, `/archive/${nextMonth.y}/${monthSlug(nextMonth.m)}`)}
              className="font-mono text-xs text-accent hover:underline"
            >
              {monthName(nextMonth.m)} {nextMonth.y} →
            </Link>
          ) : <span />}
        </nav>
      </article>
    </>
  );
}
