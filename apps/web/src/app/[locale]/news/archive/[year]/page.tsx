import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  eventYears,
  eventsInYear,
  monthName,
  parseYearSlug,
} from "@/lib/news-archive";
import { ALL_CLASSES } from "@/lib/filter-config";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const y of eventYears()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, year: String(y) });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  if (!y) return { robots: { index: false } };
  const events = eventsInYear(y);
  if (events.length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `News archive ${y}`,
    description: `${events.length} verified Aegis Lens events catalogued in ${y}, by month and class.`,
    pathFor: (lc) => localePath(lc, `/news/archive/${y}`),
  });
}

export default async function NewsYearArchivePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  if (!y) notFound();
  const events = eventsInYear(y);
  if (events.length === 0) notFound();

  // Group by month
  const byMonth = new Map<number, typeof events>();
  for (const e of events) {
    const m = new Date(e.occurredAt).getUTCMonth() + 1;
    const arr = byMonth.get(m) ?? [];
    arr.push(e);
    byMonth.set(m, arr);
  }
  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);
  const topClasses = [...byClass.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pageUrl = `${SITE.url}${localePath(locale, `/news/archive/${y}`)}`;
  const otherYears = eventYears().filter((x) => x !== y);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `News archive ${y}`,
    description: `${events.length} verified events from ${y}.`,
    url: pageUrl,
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.news(locale)} className="hover:text-text-primary">
            News
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.newsArchive(locale)} className="hover:text-text-primary">
            Archive
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{y}</span>
        </nav>

        <PageHeader
          eyebrow="Archive"
          title={`News archive · ${y}`}
          description={`${events.length} verified events catalogued across ${byMonth.size} months and ${byClass.size} event classes.`}
        />

        {(() => {
          const latestYear = Math.max(...eventYears());
          if (y >= latestYear) return null;
          return (
            <section className="mt-4 flex items-center gap-3 rounded border border-accent/40 bg-accent/5 px-4 py-3 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Archived
              </div>
              <span className="text-text-secondary">
                {y} is an archived year. Current activity is in {latestYear}.
              </span>
              <Link
                href={urls.newsArchiveYear(locale, latestYear)}
                className="ml-auto font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
              >
                See {latestYear} archive →
              </Link>
            </section>
          );
        })()}

        {topClasses.length > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Top classes in {y}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-primary">
              {topClasses.map(([cls, n]) => (
                <li key={cls} className="inline-flex items-center gap-2">
                  <Link href={urls.topic(locale, cls)} className="hover:text-accent">
                    {CLASS_LABEL[cls] ?? cls}
                  </Link>
                  <span className="font-mono text-[10px] text-text-muted">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8 space-y-8">
          {[...byMonth.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([month, arr]) => (
              <div key={month}>
                <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
                  <h2 className="text-base font-semibold text-text-primary">
                    {monthName(month)} {y}
                  </h2>
                  <span className="font-mono text-[10px] text-text-muted">
                    {arr.length} {arr.length === 1 ? "event" : "events"}
                  </span>
                  <Link
                    href={urls.newsArchiveMonth(locale, y, month)}
                    className="ml-auto font-mono text-[10px] text-accent hover:underline"
                  >
                    month archive →
                  </Link>
                </div>
                <ul className="space-y-2">
                  {arr.slice(0, 6).map((e) => (
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
              </div>
            ))}
        </section>

        {otherYears.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other years</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherYears.map((oy) => (
                <li key={oy}>
                  <Link
                    href={urls.newsArchiveYear(locale, oy)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {oy}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={urls.bestOfYear(locale, y)}
                  className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-accent hover:bg-bg-elevated"
                >
                  {y} in review →
                </Link>
              </li>
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
