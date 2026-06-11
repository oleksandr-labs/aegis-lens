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
  parseMonthSlug,
  parseYearSlug,
} from "@/lib/news-archive";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string; month: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const ym of eventYearMonths()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({
        locale: lc,
        year: String(ym.year),
        month: String(ym.month).padStart(2, "0"),
      });
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
  if (events.length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `News archive · ${monthName(m)} ${y}`,
    description: `${events.length} verified Aegis Lens events catalogued in ${monthName(m)} ${y}.`,
    pathFor: (lc) =>
      localePath(lc, `/news/archive/${y}/${String(m).padStart(2, "0")}`),
  });
}

export default async function NewsMonthArchivePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, year, month } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  if (!y || !m) notFound();
  const events = eventsInMonth(y, m);
  if (events.length === 0) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/news/archive/${y}/${String(m).padStart(2, "0")}`)}`;
  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);

  // Siblings: same year other months
  const sameYear = eventYearMonths().filter((ym) => ym.year === y && ym.month !== m);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `News archive · ${monthName(m)} ${y}`,
    description: `${events.length} events from ${monthName(m)} ${y}.`,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: events.length,
      itemListElement: events.map((e, idx) => ({
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
          <Link
            href={urls.newsArchiveYear(locale, y)}
            className="hover:text-text-primary"
          >
            {y}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{monthName(m)}</span>
        </nav>

        <PageHeader
          eyebrow="Monthly archive"
          title={`${monthName(m)} ${y}`}
          description={`${events.length} verified events from ${monthName(m)} ${y}, across ${byClass.size} event classes.`}
        />

        {byClass.size > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              By class
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-primary">
              {[...byClass.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([cls, n]) => (
                  <li key={cls} className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: CLASS_COLOR[cls as keyof typeof CLASS_COLOR] }}
                    />
                    <Link href={urls.topic(locale, cls)} className="hover:text-accent">
                      {CLASS_LABEL[cls] ?? cls}
                    </Link>
                    <span className="font-mono text-[10px] text-text-muted">{n}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.eventId}>
                <Link
                  href={urls.event(locale, e.eventId)}
                  className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {e.class}
                    {e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
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

        {sameYear.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other months in {y}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameYear.map((ym) => (
                <li key={`${ym.year}-${ym.month}`}>
                  <Link
                    href={urls.newsArchiveMonth(locale, ym.year, ym.month)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {monthName(ym.month)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
