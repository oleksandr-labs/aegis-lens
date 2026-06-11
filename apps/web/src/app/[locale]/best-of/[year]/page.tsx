import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventYears, eventsInYear, parseYearSlug } from "@/lib/news-archive";
import { ALL_CLASSES } from "@/lib/filter-config";
import { listInvestigations } from "@/lib/investigations-seed";
import { listReports } from "@/lib/reports-seed";
import { listTrends } from "@/lib/trends-seed";
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
  if (eventsInYear(y).length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${y} in review — Aegis Lens`,
    description: `The Aegis Lens ${y} year-in-review: top incidents, dominant threat classes, headline investigations, reports, and the trends that defined the year.`,
    pathFor: (lc) => localePath(lc, `/best-of/${y}`),
  });
}

export default async function BestOfYearPage({
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

  const pageUrl = `${SITE.url}${localePath(locale, `/best-of/${y}`)}`;

  // Top 5 incidents by danger
  const topIncidents = events.slice().sort((a, b) => b.dangerScore - a.dangerScore).slice(0, 5);

  // Class mix
  const byClass = new Map<string, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);
  const topClasses = [...byClass.entries()].sort((a, b) => b[1] - a[1]);

  // Stats
  const avgDanger = Math.round(
    events.reduce((s, e) => s + e.dangerScore, 0) / events.length,
  );
  const avgConfidence = (
    events.reduce((s, e) => s + e.confidence, 0) / events.length
  ).toFixed(2);

  // Investigations + reports + trends in this year
  const yearInvestigations = listInvestigations().filter(
    (inv) => new Date(inv.date).getUTCFullYear() === y,
  );
  const yearReports = listReports().filter(
    (r) => new Date(r.publishedAt).getUTCFullYear() === y,
  );
  const yearTrends = listTrends().filter(
    (t) =>
      new Date(t.publishedAt).getUTCFullYear() === y ||
      new Date(t.updatedAt).getUTCFullYear() === y,
  );

  const otherYears = eventYears().filter((x) => x !== y);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${y} in review — Aegis Lens`,
        description: `Year-in-review for ${y}: events, top incidents, investigations, reports, trends.`,
        datePublished: `${y}-12-31`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "News archive",
            item: `${SITE.url}${urls.newsArchive(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: `${y} in review` },
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
          <Link href={urls.newsArchive(locale)} className="hover:text-text-primary">
            Archive
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{y} in review</span>
        </nav>

        <PageHeader
          eyebrow="Year in review"
          title={`${y} in review`}
          description={`${events.length} events catalogued, ${yearInvestigations.length} investigations published, ${yearReports.length} reports released.`}
        />

        {(() => {
          // Year-roll banner: when viewing a past year, point readers at the
          // most recent year-in-review while keeping this page canonical to
          // itself (each year is genuinely per-year content, not evergreen).
          const latestYear = Math.max(...eventYears());
          if (y >= latestYear) return null;
          return (
            <section className="mt-4 flex items-center gap-3 rounded border border-accent/40 bg-accent/5 px-4 py-3 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Archived
              </div>
              <span className="text-text-secondary">
                {y} is a historical year-in-review.
              </span>
              <Link
                href={urls.bestOfYear(locale, latestYear)}
                className="ml-auto font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
              >
                See {latestYear} in review →
              </Link>
            </section>
          );
        })()}

        {/* KPI strip */}
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
              Classes
            </div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{byClass.size}</div>
          </div>
        </section>

        {topClasses.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Class mix</h2>
            <ul className="mt-3 space-y-1.5">
              {topClasses.map(([cls, n]) => {
                const pct = Math.round((n / events.length) * 100);
                return (
                  <li
                    key={cls}
                    className="flex items-center gap-3 rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
                  >
                    <Link
                      href={urls.topic(locale, cls)}
                      className="min-w-[140px] text-text-primary hover:text-accent"
                    >
                      {CLASS_LABEL[cls] ?? cls}
                    </Link>
                    <div className="flex-1 h-2 rounded bg-bg-elevated overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {n} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">Top incidents</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Highest-danger events of {y}
          </p>
          <ol className="mt-3 space-y-2">
            {topIncidents.map((e, idx) => (
              <li
                key={e.eventId}
                className="flex gap-3 rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm"
              >
                <span className="font-mono text-lg font-semibold text-accent">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="text-text-primary hover:text-accent"
                  >
                    {e.summary[locale] ?? e.summary.en}
                  </Link>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {e.class}
                    {e.subclass ? ` · ${e.subclass}` : ""} ·{" "}
                    {e.occurredAt.slice(0, 10)} · danger {e.dangerScore} · conf{" "}
                    {Math.round(e.confidence * 100)}%
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {yearInvestigations.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Investigations of {y}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {yearInvestigations.map((inv) => (
                <li key={inv.slug}>
                  <Link
                    href={urls.investigation(locale, inv.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{inv.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {inv.date} · lead: {inv.analyst}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {yearReports.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">Reports of {y}</h2>
            <ul className="mt-3 space-y-2">
              {yearReports.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={urls.report(locale, r.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">
                      {r.title[locale] ?? r.title.en}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {r.kind} · {r.publishedAt.slice(0, 10)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {yearTrends.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Trends that defined {y}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {yearTrends.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={urls.trend(locale, t.slug)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{t.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {t.horizon}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherYears.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other years</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otherYears.map((oy) => (
                <li key={oy}>
                  <Link
                    href={urls.bestOfYear(locale, oy)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {oy} in review
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Per-month archive at{" "}
          <Link
            href={urls.newsArchiveYear(locale, y)}
            className="text-accent hover:underline"
          >
            /news/archive/{y}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
