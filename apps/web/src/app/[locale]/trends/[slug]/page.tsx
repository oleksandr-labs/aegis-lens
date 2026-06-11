import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
// Seed-based trends (existing analyst write-ups)
import { TRENDS as SEED_TRENDS, getTrend as getSeedTrend, listTrends as listSeedTrends, type Trend as SeedTrendType } from "@/lib/trends-seed";
import { getThreat } from "@/lib/threats-seed";
import { getInvestigation } from "@/lib/investigations-seed";
import { eventById, listEvents } from "@/lib/events-seed";
// Data trends (direction / pattern signals)
import {
  TRENDS as DATA_TRENDS,
  getTrend as getDataTrend,
  type Trend as DataTrendType,
  type TrendDirection,
} from "@/lib/trends-data";

type Params = { locale: string; slug: string };

// ─── Static params: both seed and data trends × all locales ──────────────────

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const allSlugs = [
    ...SEED_TRENDS.map((t) => t.slug),
    ...DATA_TRENDS.map((t) => t.slug),
  ];
  for (const slug of allSlugs) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, slug });
  }
  return out;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const seed = getSeedTrend(slug);
  const data = getDataTrend(slug);
  const t = seed ?? data;
  if (!t) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: t.title,
    description: t.description,
    pathFor: (lc) => localePath(lc, `/trends/${t.slug}`),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function directionIcon(d: TrendDirection): string {
  return d === "rising" ? "↑" : d === "falling" ? "↓" : d === "stable" ? "→" : "★";
}
function directionLabel(d: TrendDirection): string {
  return d === "rising" ? "Rising" : d === "falling" ? "Falling" : d === "stable" ? "Stable" : "New";
}
function directionBg(d: TrendDirection): string {
  return d === "rising"
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : d === "falling"
    ? "bg-green-500/10 border-green-500/30 text-green-400"
    : d === "stable"
    ? "bg-bg-elevated border-border-subtle text-text-muted"
    : "bg-accent/10 border-accent/30 text-accent";
}
function formatChange(pct: number): string {
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

// ─── Sparkline (seed trends) ──────────────────────────────────────────────────

function Sparkline({ data, height = 60 }: { data: number[]; height?: number }) {
  const width = 600;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (width - pad * 2) / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (height - pad * 2) * (1 - (v - min) / range);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend time-series"
      className="text-accent"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

// ─── Seed trend detail page ───────────────────────────────────────────────────

async function SeedTrendPage({ t, locale }: { t: SeedTrendType; locale: Locale }) {
  const threats = (t.relatedThreatSlugs ?? [])
    .map((s) => getThreat(s))
    .filter((x): x is NonNullable<ReturnType<typeof getThreat>> => x !== null);
  const investigations = (t.relatedInvestigationSlugs ?? [])
    .map((s) => getInvestigation(s))
    .filter((x): x is NonNullable<ReturnType<typeof getInvestigation>> => x !== null);
  const events = (t.citedEventIds ?? [])
    .map((id) => eventById(id))
    .filter((x): x is NonNullable<ReturnType<typeof eventById>> => x !== null);
  const others = listSeedTrends().filter((x) => x.slug !== t.slug).slice(0, 4);
  const pageUrl = `${SITE.url}${localePath(locale, `/trends/${t.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t.title,
        description: t.description,
        datePublished: t.publishedAt,
        dateModified: t.updatedAt,
        keywords: t.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "Dataset",
        name: `${t.title} — time series`,
        description: `Underlying event counts powering the ${t.title} trend.`,
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@type": "Organization", name: SITE.name, url: SITE.url },
        distribution: {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${SITE.url}/data/events.json`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trends", item: `${SITE.url}${urls.trends(locale)}` },
          { "@type": "ListItem", position: 2, name: t.title },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.trends(locale)} className="hover:text-text-primary">Trends</Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{t.title}</span>
        </nav>

        <PageHeader eyebrow={t.horizon} title={t.title} description={t.description} />

        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <span>Affected: {t.affectedCountries.map((c) => c.toUpperCase()).join(", ")}</span>
          <span>·</span>
          <span>Updated {t.updatedAt}</span>
          {t.topicClass && (
            <>
              <span>·</span>
              <Link href={urls.topic(locale, t.topicClass)} className="hover:text-accent">
                topic: {t.topicClass}
              </Link>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <Link
              key={tag}
              href={urls.tag(locale, tag)}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Time series ({t.series.length} bins · max {Math.max(...t.series)} · min {Math.min(...t.series)})
          </div>
          <Sparkline data={t.series} />
        </section>

        {t.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.body}</p>
          </section>
        ))}

        {events.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Key incidents</h2>
            <ul className="mt-3 space-y-2">
              {events.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.class}{e.subclass ? ` · ${e.subclass}` : ""} · {e.occurredAt.slice(0, 10)}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {t.analystCommentary && (
          <section className="mt-10 rounded border-l-4 border-accent bg-bg-surface p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">Analyst commentary</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {t.analystCommentary.analyst} · {t.analystCommentary.writtenAt}
            </div>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
              {t.analystCommentary.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Bracketed references point at event IDs and investigation slugs. See{" "}
              <Link href={urls.methodology(locale)} className="text-accent hover:underline">methodology</Link>{" "}
              for citation discipline.
            </p>
          </section>
        )}

        {threats.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Related threats</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {threats.map((th) => (
                <li key={th.slug}>
                  <Link href={urls.threat(locale, th.slug)} className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated">
                    <div className="text-text-primary">{th.name[locale] ?? th.name.en}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {investigations.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Related investigations</h2>
            <ul className="mt-3 space-y-2">
              {investigations.map((inv) => (
                <li key={inv.slug}>
                  <Link href={urls.investigation(locale, inv.slug)} className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated">
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

        <section className="mt-10">
          <h2 className="text-base font-semibold text-text-primary">FAQ</h2>
          <div className="mt-3 space-y-3">
            {t.faqs.map((f, i) => (
              <details key={i} className="group rounded border border-border-subtle bg-bg-surface p-4">
                <summary className="cursor-pointer text-sm font-medium text-text-primary">{f.q}</summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {others.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Other trends</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={urls.trend(locale, o.slug)} className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary">
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Trend bins are recomputed daily. Underlying events at{" "}
          <a href="/data/events.json" className="text-accent hover:underline">/data/events.json</a>{" "}
          · methodology at{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">/methodology</Link>.
        </p>
      </article>
    </>
  );
}

// ─── Data trend detail page ───────────────────────────────────────────────────

function DataTrendPage({ t, locale }: { t: DataTrendType; locale: Locale }) {
  // Related events: match by event class
  const relatedEvents = listEvents()
    .filter((e) => e.class === t.relatedEventClass)
    .slice(0, 6);

  // Related trends
  const relatedTrends = t.relatedTrendSlugs
    .map((s) => getDataTrend(s) ?? listSeedTrends().find((x) => x.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  const pageUrl = `${SITE.url}${localePath(locale, `/trends/${t.slug}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t.title,
        description: t.description,
        keywords: t.tags.join(", "),
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        inLanguage: locale,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trends", item: `${SITE.url}${urls.trends(locale)}` },
          { "@type": "ListItem", position: 2, name: t.title },
        ],
      },
    ],
  };

  const icon = directionIcon(t.direction);
  const badgeCls = directionBg(t.direction);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.trends(locale)} className="hover:text-text-primary">Trends</Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">{t.title}</span>
        </nav>

        {/* Hero */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-sm font-semibold ${badgeCls}`}>
            {icon} {directionLabel(t.direction)}
          </span>
          <span className={`rounded border px-2.5 py-1 font-mono text-sm font-semibold ${badgeCls}`}>
            {formatChange(t.changePercent)}
          </span>
          <span className="rounded border border-border-subtle bg-bg-elevated px-2.5 py-1 font-mono text-[11px] text-text-muted">
            {t.timeframe}
          </span>
        </div>

        <PageHeader eyebrow="Pattern Signal" title={t.title} description={t.description} />

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
            >
              {tag}
            </span>
          ))}
          <Link
            href={urls.topic(locale, t.relatedEventClass)}
            className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
          >
            {t.relatedEventClass}
          </Link>
        </div>

        {/* Key statistics */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">Key statistics</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {t.stats.map((s) => (
              <div key={s.label} className="rounded border border-border-subtle bg-bg-surface p-3">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{s.label}</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-text-primary">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* What's driving this trend */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary">What&apos;s driving this trend</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{t.drivingFactors}</p>
        </section>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <section className="mt-8">
            <h2 className="text-base font-semibold text-text-primary">Recent related events</h2>
            <ul className="mt-3 space-y-2">
              {relatedEvents.map((e) => (
                <li key={e.eventId}>
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {e.class}{e.subclass ? ` · ${e.subclass}` : ""} · {e.occurredAt.slice(0, 10)}
                    </div>
                    <div className="mt-1 text-text-primary">
                      {e.summary[locale] ?? e.summary.en}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Link
                href={`${urls.map(locale)}?class=${t.relatedEventClass}`}
                className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
              >
                View all on map →
              </Link>
            </div>
          </section>
        )}

        {/* Related trends */}
        {relatedTrends.length > 0 && (
          <section className="mt-10 border-t border-border-subtle pt-6">
            <h2 className="text-base font-semibold text-text-primary">Related trends</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {relatedTrends.map((o) => {
                if (!o) return null;
                return (
                  <li key={o.slug}>
                    <Link
                      href={urls.trend(locale, o.slug)}
                      className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    >
                      {o.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Pattern signals are updated continuously from the verified-events corpus. See{" "}
          <Link href={urls.methodology(locale)} className="text-accent hover:underline">methodology</Link>{" "}
          for detection detail.
        </p>
      </article>
    </>
  );
}

// ─── Route handler ────────────────────────────────────────────────────────────

export default async function TrendDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const seedTrend = getSeedTrend(slug);
  if (seedTrend) {
    return <SeedTrendPage t={seedTrend} locale={locale} />;
  }

  const dataTrend = getDataTrend(slug);
  if (dataTrend) {
    return <DataTrendPage t={dataTrend} locale={locale} />;
  }

  notFound();
}
