import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { parseYearSlug } from "@/lib/news-archive";
import {
  eventIsoWeeks,
  eventsInIsoWeek,
  isoWeekStart,
  isoWeekEnd,
  isoWeeksInYear,
  weekSlug,
  parseWeekSlug,
} from "@/lib/news-archive-week";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { buildArchiveSummary } from "@/lib/seo/archive-summary";
import { SITE } from "@/lib/site";

type Params = { locale: string; year: string; week: string };

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

const MIN_EVENTS_TO_INDEX = 3;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function periodLabel(year: number, week: number): string {
  const start = isoWeekStart(year, week);
  const end = isoWeekEnd(year, week);
  return `week ${weekSlug(week)} of ${year} (${isoDate(start)} – ${isoDate(end)})`;
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const w of eventIsoWeeks()) {
    if (eventsInIsoWeek(w.year, w.week).length < MIN_EVENTS_TO_INDEX) continue;
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, year: String(w.year), week: weekSlug(w.week) });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, year, week } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const w = parseWeekSlug(week);
  if (!y || !w || w > isoWeeksInYear(y)) return { robots: { index: false } };
  const events = eventsInIsoWeek(y, w);
  if (events.length < MIN_EVENTS_TO_INDEX) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Week ${weekSlug(w)} ${y} — weekly recap`,
    description: `${events.length} verified Aegis Lens events from ${periodLabel(y, w)}.`,
    pathFor: (lc) => localePath(lc, `/archive/${y}/week/${weekSlug(w)}`),
  });
}

export default async function ArchiveWeekPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, year, week } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const y = parseYearSlug(year);
  const w = parseWeekSlug(week);
  if (!y || !w || w > isoWeeksInYear(y)) notFound();
  const events = eventsInIsoWeek(y, w);
  if (events.length < MIN_EVENTS_TO_INDEX) notFound();

  const start = isoWeekStart(y, w);
  const end = isoWeekEnd(y, w);
  const pageUrl = `${SITE.url}${localePath(locale, `/archive/${y}/week/${weekSlug(w)}`)}`;

  // Prev / next ISO week (handle year rollover via week count).
  const prev = w > 1 ? { y, w: w - 1 } : { y: y - 1, w: isoWeeksInYear(y - 1) };
  const next =
    w < isoWeeksInYear(y) ? { y, w: w + 1 } : { y: y + 1, w: 1 };
  const hasPrev = eventsInIsoWeek(prev.y, prev.w).length >= MIN_EVENTS_TO_INDEX;
  const hasNext = eventsInIsoWeek(next.y, next.w).length >= MIN_EVENTS_TO_INDEX;

  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);

  // Grounded auto-summary (fail-soft; no summarizer wired here yet).
  const summary = await buildArchiveSummary({
    events,
    periodLabel: periodLabel(y, w),
    locale,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Week ${weekSlug(w)} ${y} — weekly recap`,
        description: summary.text,
        url: pageUrl,
        dateCreated: isoDate(start),
        temporalCoverage: `${isoDate(start)}/${isoDate(end)}`,
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
          { "@type": "ListItem", position: 3, name: `Week ${weekSlug(w)}` },
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
          <Link href={localePath(locale, `/archive/${y}`)} className="hover:text-text-primary">
            {y}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">
            {locale === "uk" ? `Тиждень ${weekSlug(w)}` : `Week ${weekSlug(w)}`}
          </span>
        </nav>

        <PageHeader
          eyebrow={locale === "uk" ? "Тижневий огляд" : "Weekly recap"}
          title={locale === "uk" ? `Тиждень ${weekSlug(w)}, ${y}` : `Week ${weekSlug(w)}, ${y}`}
          description={`${isoDate(start)} – ${isoDate(end)} · ${events.length} ${
            locale === "uk" ? "перевірених подій" : "verified events"
          }`}
        />

        {/* Auto-generated grounded summary */}
        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
            {locale === "uk" ? "Стислий огляд" : "Summary"}
          </div>
          <p className="text-sm text-text-primary">{summary.text}</p>
          {summary.citations.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {summary.citations.map((c) => (
                <li key={c.eventId}>
                  <Link
                    href={urls.event(locale, c.eventId)}
                    className="inline-flex rounded border border-border-subtle px-2 py-0.5 text-[11px] text-text-secondary hover:border-accent hover:text-accent"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-text-muted">{summary.caveat}</p>
        </section>

        {/* By class */}
        {byClass.size > 0 && (
          <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
              {locale === "uk" ? "За категоріями" : "By class"}
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

        {/* Event list */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">
            {locale === "uk" ? "Усі події" : "All events"}
          </h2>
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
        <nav className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6" aria-label="Week navigation">
          {hasPrev ? (
            <Link
              href={localePath(locale, `/archive/${prev.y}/week/${weekSlug(prev.w)}`)}
              className="font-mono text-xs text-accent hover:underline"
            >
              ← {locale === "uk" ? "Тиждень" : "Week"} {weekSlug(prev.w)} {prev.y}
            </Link>
          ) : <span />}
          {hasNext ? (
            <Link
              href={localePath(locale, `/archive/${next.y}/week/${weekSlug(next.w)}`)}
              className="font-mono text-xs text-accent hover:underline"
            >
              {locale === "uk" ? "Тиждень" : "Week"} {weekSlug(next.w)} {next.y} →
            </Link>
          ) : <span />}
        </nav>
      </article>
    </>
  );
}
