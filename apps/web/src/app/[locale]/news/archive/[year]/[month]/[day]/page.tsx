import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  eventYearMonthDays,
  eventsInDay,
  monthName,
  parseDaySlug,
  parseMonthSlug,
  parseYearSlug,
  daySlug,
} from "@/lib/news-archive";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string; month: string; day: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const ymd of eventYearMonthDays()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({
        locale: lc,
        year: String(ymd.year),
        month: String(ymd.month).padStart(2, "0"),
        day: daySlug(ymd.day),
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
  const { locale: raw, year, month, day } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  const d = parseDaySlug(day);
  if (!y || !m || !d) return { robots: { index: false } };
  const events = eventsInDay(y, m, d);
  if (events.length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `News archive · ${monthName(m)} ${d}, ${y}`,
    description: `${events.length} verified Aegis Lens events catalogued on ${monthName(m)} ${d}, ${y}.`,
    pathFor: (lc) =>
      localePath(
        lc,
        `/news/archive/${y}/${String(m).padStart(2, "0")}/${daySlug(d)}`,
      ),
  });
}

export default async function NewsDayArchivePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, year, month, day } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const m = parseMonthSlug(month);
  const d = parseDaySlug(day);
  if (!y || !m || !d) notFound();
  const events = eventsInDay(y, m, d);
  if (events.length === 0) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/news/archive/${y}/${String(m).padStart(2, "0")}/${daySlug(d)}`)}`;
  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);

  // Sibling days in the same month
  const siblingDays = eventYearMonthDays().filter(
    (ymd) => ymd.year === y && ymd.month === m && ymd.day !== d,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `News archive · ${monthName(m)} ${d}, ${y}`,
    description: `${events.length} events from ${monthName(m)} ${d}, ${y}.`,
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
          <Link
            href={urls.newsArchiveMonth(locale, y, m)}
            className="hover:text-text-primary"
          >
            {monthName(m)}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{d}</span>
        </nav>

        <PageHeader
          eyebrow="Daily archive"
          title={`${monthName(m)} ${d}, ${y}`}
          description={`${events.length} verified events on this day, across ${byClass.size} event classes.`}
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
                    {e.occurredAt.slice(11, 16)}Z · danger {e.dangerScore}
                  </div>
                  <div className="mt-1 text-text-primary">
                    {e.summary[locale] ?? e.summary.en}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {siblingDays.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">
              Other active days in {monthName(m)} {y}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblingDays.map((ymd) => (
                <li key={`${ymd.year}-${ymd.month}-${ymd.day}`}>
                  <Link
                    href={urls.newsArchiveDay(locale, ymd.year, ymd.month, ymd.day)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {monthName(ymd.month)} {ymd.day}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Month archive:{" "}
          <Link
            href={urls.newsArchiveMonth(locale, y, m)}
            className="text-accent hover:underline"
          >
            {monthName(m)} {y}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
