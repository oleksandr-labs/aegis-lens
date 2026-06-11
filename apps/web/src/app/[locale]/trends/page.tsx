import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { TRENDS as SEED_TRENDS, listTrends, type Trend as SeedTrend } from "@/lib/trends-seed";
import {
  TRENDS as DATA_TRENDS,
  listTrends as listDataTrends,
  type Trend as DataTrend,
  type TrendDirection,
} from "@/lib/trends-data";

const TITLE = "Intelligence Trends";
const DESCRIPTION =
  "AI-detected patterns and anomalies in conflict intelligence. Updated continuously.";

const ALL_HORIZONS = Array.from(new Set(SEED_TRENDS.map((t) => t.horizon)));

const DIRECTIONS: { id: TrendDirection | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rising", label: "Rising" },
  { id: "falling", label: "Falling" },
  { id: "stable", label: "Stable" },
  { id: "new", label: "New" },
];

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/trends"),
    feeds: [
      {
        type: "application/rss+xml",
        href: "/trends/feed.xml",
        title: `${TITLE} — RSS`,
      },
    ],
  });
}

// ─── Sparkline (seed trends) ──────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const width = 120;
  const height = 32;
  const pad = 2;
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
  const last = points.split(" ").pop() ?? "";
  const [lx, ly] = last.split(",").map(Number);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="trend sparkline"
      className="text-accent"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <circle cx={lx} cy={ly} r="2" fill="currentColor" />
    </svg>
  );
}

// ─── Mini bar chart for data trends ──────────────────────────────────────────

function MiniBar({ direction }: { direction: TrendDirection }) {
  // Hardcoded bar heights per direction
  const bars: Record<TrendDirection, number[]> = {
    rising: [20, 35, 48, 62, 80],
    falling: [80, 65, 50, 35, 20],
    stable: [50, 48, 52, 49, 51],
    new: [10, 22, 38, 55, 75],
  };
  const heights = bars[direction];
  const maxH = 28;

  return (
    <div className="flex items-end gap-0.5" style={{ height: maxH }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={
            direction === "rising" || direction === "new"
              ? "bg-red-500/60"
              : direction === "falling"
              ? "bg-green-500/60"
              : "bg-text-muted/40"
          }
          style={{ width: 8, height: `${(h / 100) * maxH}px` }}
        />
      ))}
    </div>
  );
}

// ─── Direction helpers ────────────────────────────────────────────────────────

function directionIcon(d: TrendDirection): string {
  return d === "rising" ? "↑" : d === "falling" ? "↓" : d === "stable" ? "→" : "★";
}

function directionColorClass(d: TrendDirection): string {
  return d === "rising"
    ? "text-red-400"
    : d === "falling"
    ? "text-green-400"
    : d === "stable"
    ? "text-text-muted"
    : "text-accent";
}

function changeBadgeClass(d: TrendDirection): string {
  return d === "rising" || d === "new"
    ? "bg-red-500/10 text-red-400 border border-red-500/20"
    : d === "falling"
    ? "bg-green-500/10 text-green-400 border border-green-500/20"
    : "bg-bg-elevated text-text-muted border border-border-subtle";
}

function formatChange(pct: number): string {
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

// ─── Seed trend card ──────────────────────────────────────────────────────────

function SeedTrendCard({ t, locale }: { t: SeedTrend; locale: string }) {
  return (
    <Link
      href={urls.trend(locale, t.slug)}
      className="block h-full rounded border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-bg-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">{t.title}</h2>
        <Sparkline data={t.series} />
      </div>
      <p className="mt-2 text-sm text-text-secondary line-clamp-2">{t.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {t.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-text-muted">{t.horizon}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
          explore →
        </span>
      </div>
    </Link>
  );
}

// ─── Data trend card ──────────────────────────────────────────────────────────

function DataTrendCard({ t, locale }: { t: DataTrend; locale: string }) {
  const icon = directionIcon(t.direction);
  const iconClass = directionColorClass(t.direction);
  const badgeClass = changeBadgeClass(t.direction);

  return (
    <div className="flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-bg-elevated">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold leading-none ${iconClass}`} aria-hidden>
            {icon}
          </span>
          <h2 className="text-base font-semibold text-text-primary">{t.title}</h2>
        </div>
        <MiniBar direction={t.direction} />
      </div>

      {/* Change badge + timeframe */}
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${badgeClass}`}>
          {formatChange(t.changePercent)}
        </span>
        <span className="font-mono text-[10px] text-text-muted">{t.timeframe}</span>
      </div>

      {/* Description */}
      <p className="mt-2 flex-1 text-sm text-text-secondary line-clamp-2">{t.description}</p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {t.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
          >
            {tag}
          </span>
        ))}
        <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] text-text-muted border border-border-subtle bg-bg-elevated">
          {t.relatedEventClass}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        {t.peakDate && (
          <span className="font-mono text-[10px] text-text-muted">
            Peak: {t.peakDate}
          </span>
        )}
        <Link
          href={`/${locale}/trends/${t.slug}`}
          className="ml-auto font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
        >
          Explore →
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TrendsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ horizon?: string; direction?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = await searchParams;

  const activeHorizon = ALL_HORIZONS.includes(sp.horizon ?? "") ? sp.horizon : undefined;
  const activeDirection =
    DIRECTIONS.find((d) => d.id !== "all" && d.id === sp.direction)?.id ?? undefined;

  const allSeedTrends = listTrends();
  const filteredSeed = activeHorizon
    ? allSeedTrends.filter((t) => t.horizon === activeHorizon)
    : allSeedTrends;
  const featuredSeed = allSeedTrends.filter((t) => t.featured);

  const allDataTrends = listDataTrends();
  const filteredData = activeDirection
    ? allDataTrends.filter((t) => t.direction === activeDirection)
    : allDataTrends;

  const trendsBase = localePath(locale, "/trends");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${trendsBase}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filteredSeed.length + filteredData.length,
      itemListElement: [
        ...filteredSeed.map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.title,
          url: `${SITE.url}${localePath(locale, `/trends/${t.slug}`)}`,
        })),
        ...filteredData.map((t, idx) => ({
          "@type": "ListItem",
          position: filteredSeed.length + idx + 1,
          name: t.title,
          url: `${SITE.url}${localePath(locale, `/trends/${t.slug}`)}`,
        })),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Trends" title={TITLE} description={DESCRIPTION} />

      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* RSS + count row */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[11px] text-text-muted">
            {allSeedTrends.length + allDataTrends.length} trends tracked
          </p>
          <a
            href="/trends/feed.xml"
            className="flex items-center gap-1.5 rounded border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] text-orange-400 hover:border-orange-400"
            aria-label="Trends RSS feed"
          >
            RSS
          </a>
        </div>

        {/* Direction filter */}
        <div className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Filter by direction
          </p>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => {
              const isActive =
                d.id === "all" ? !activeDirection : activeDirection === d.id;
              const href =
                d.id === "all" ? trendsBase : `${trendsBase}?direction=${d.id}`;
              return (
                <Link
                  key={d.id}
                  href={href}
                  className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
                  }`}
                >
                  {d.id !== "all" && (
                    <span
                      className={`mr-1 ${directionColorClass(d.id as TrendDirection)}`}
                    >
                      {directionIcon(d.id as TrendDirection)}
                    </span>
                  )}
                  {d.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Direction-filtered data trend grid */}
        {filteredData.length > 0 && (
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Pattern signals
            </p>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredData.map((t) => (
                <li key={t.slug} id={t.slug}>
                  <DataTrendCard t={t} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Editorial-featured strip (seed trends) */}
        {!activeHorizon && !activeDirection && featuredSeed.length > 0 && (
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Analyst featured
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredSeed.map((t) => (
                <article key={t.slug} className="rounded border border-accent/30 bg-accent/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-accent">
                        {t.horizon}
                      </span>
                      <h2 className="mt-1 text-sm font-semibold text-text-primary">{t.title}</h2>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                    <Sparkline data={t.series} />
                  </div>
                  <div className="mt-3">
                    <Link
                      href={urls.trend(locale, t.slug)}
                      className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
                    >
                      Read analysis →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Timeframe filter chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href={trendsBase}
            className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              !activeHorizon
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
            }`}
          >
            All ({allSeedTrends.length})
          </Link>
          {ALL_HORIZONS.map((h) => {
            const count = allSeedTrends.filter((t) => t.horizon === h).length;
            const isActive = activeHorizon === h;
            return (
              <Link
                key={h}
                href={`${trendsBase}?horizon=${encodeURIComponent(h)}`}
                className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border-subtle bg-bg-surface text-text-muted hover:border-text-muted"
                }`}
              >
                {h} ({count})
              </Link>
            );
          })}
        </div>

        {/* Seed trend grid */}
        {filteredSeed.length === 0 ? (
          <p className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
            No analyst trends for this timeframe yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredSeed.map((t) => (
              <li key={t.slug} id={t.slug}>
                <SeedTrendCard t={t} locale={locale} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 rounded border border-border-subtle bg-bg-elevated p-5 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Methodology
          </p>
          <p className="mt-2 text-text-secondary">
            Trend bins are computed daily from the verified-events corpus. Each series is
            normalised to the bin window, not raw counts. Read the full{" "}
            <Link href={urls.methodology(locale)} className="text-accent hover:underline">
              methodology
            </Link>{" "}
            for detail.
          </p>
        </div>
      </section>
    </>
  );
}
