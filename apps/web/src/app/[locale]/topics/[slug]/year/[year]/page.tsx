import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import type { EventClass } from "@aegis/types";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { listEvents } from "@/lib/events-seed";
import { eventYears, parseYearSlug, monthName } from "@/lib/news-archive";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; year: string };

export const dynamicParams = false;

function classByIdSafe(slug: string): { id: EventClass; label: string } | null {
  const c = ALL_CLASSES.find((x) => x.id === slug);
  return c ? { id: c.id as EventClass, label: c.label } : null;
}

function eventsInClassYear(classId: string, year: number) {
  return listEvents()
    .filter(
      (e) =>
        e.class === classId &&
        new Date(e.occurredAt).getUTCFullYear() === year,
    )
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const c of ALL_CLASSES) {
    for (const y of eventYears()) {
      if (eventsInClassYear(c.id, y).length === 0) continue;
      for (const lc of ACTIVE_LOCALES) {
        out.push({ locale: lc, slug: c.id, year: String(y) });
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
  const { locale: raw, slug, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  const y = parseYearSlug(year);
  if (!cls || !y) return { robots: { index: false } };
  const events = eventsInClassYear(cls.id, y);
  if (events.length === 0) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${cls.label} events in ${y}`,
    description: `${events.length} verified ${cls.label.toLowerCase()} events catalogued by Aegis Lens in ${y}.`,
    pathFor: (lc) => localePath(lc, `/topics/${slug}/year/${y}`),
  });
}

export default async function TopicYearPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, year } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const cls = classByIdSafe(slug);
  const y = parseYearSlug(year);
  if (!cls || !y) notFound();
  const events = eventsInClassYear(cls.id, y);
  if (events.length === 0) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/topics/${slug}/year/${y}`)}`;
  const avgDanger = Math.round(
    events.reduce((s, e) => s + e.dangerScore, 0) / events.length,
  );

  // Group by month for skimmability.
  const byMonth = new Map<number, typeof events>();
  for (const e of events) {
    const m = new Date(e.occurredAt).getUTCMonth() + 1;
    const arr = byMonth.get(m) ?? [];
    arr.push(e);
    byMonth.set(m, arr);
  }

  // Sibling links: same topic other years, same year other topics.
  const sameTopicOtherYears = eventYears()
    .filter((yy) => yy !== y && eventsInClassYear(cls.id, yy).length > 0);
  const sameYearOtherTopics = ALL_CLASSES.filter((c) => c.id !== cls.id)
    .map((c) => ({
      id: c.id,
      label: c.label,
      count: eventsInClassYear(c.id, y).length,
    }))
    .filter((x) => x.count > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${cls.label} events in ${y}`,
        description: `${events.length} verified ${cls.label.toLowerCase()} events in ${y}.`,
        url: pageUrl,
        inLanguage: locale,
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
          { "@type": "ListItem", position: 3, name: String(y) },
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
          <Link href={urls.topics(locale)} className="hover:text-text-primary">
            Topics
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link href={urls.topic(locale, cls.id)} className="hover:text-text-primary">
            {cls.label}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{y}</span>
        </nav>

        <PageHeader
          eyebrow={`${cls.label} × ${y}`}
          title={`${cls.label} events in ${y}`}
          description={`${events.length} verified events catalogued across ${byMonth.size} months.`}
        />

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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

        <section className="mt-8 space-y-8">
          {[...byMonth.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([m, arr]) => (
              <div key={m}>
                <div className="mb-3 flex items-baseline gap-3 border-b border-border-subtle pb-2">
                  <h2 className="text-base font-semibold text-text-primary">
                    {monthName(m)} {y}
                  </h2>
                  <span className="font-mono text-[10px] text-text-muted">
                    {arr.length} {arr.length === 1 ? "event" : "events"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {arr.map((e) => (
                    <li key={e.eventId}>
                      <Link
                        href={urls.event(locale, e.eventId)}
                        className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                      >
                        <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          {e.subclass ?? "—"} · {e.occurredAt.slice(0, 10)} · danger{" "}
                          {e.dangerScore}
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

        {sameTopicOtherYears.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              {cls.label} in other years
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameTopicOtherYears.map((yy) => (
                <li key={yy}>
                  <Link
                    href={urls.topicYear(locale, cls.id, yy)}
                    className="inline-flex items-center rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {yy}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sameYearOtherTopics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">
              Other topics in {y}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sameYearOtherTopics.map((t) => (
                <li key={t.id}>
                  <Link
                    href={urls.topicYear(locale, t.id, y)}
                    className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <span>{t.label}</span>
                    <span className="font-mono text-[10px] text-text-muted">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          See{" "}
          <Link href={urls.topic(locale, cls.id)} className="text-accent hover:underline">
            all {cls.label.toLowerCase()} events
          </Link>{" "}
          ·{" "}
          <Link href={urls.bestOfYear(locale, y)} className="text-accent hover:underline">
            {y} year in review
          </Link>{" "}
          ·{" "}
          <Link
            href={urls.newsArchiveYear(locale, y)}
            className="text-accent hover:underline"
          >
            {y} news archive
          </Link>
        </p>
      </article>
    </>
  );
}
