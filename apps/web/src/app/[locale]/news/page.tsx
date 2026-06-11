import Link from "next/link";
import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventsInCountry, listEvents } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { formatDateTime } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { AegisEvent } from "@aegis/types";

const PAGE_SIZE = 8;

const CLASS_LABEL = Object.fromEntries(
  ALL_CLASSES.map((c) => [c.id, c.label]),
) as Record<string, string>;

// ---------- Static params ----------

export function generateStaticParams() {
  return ACTIVE_LOCALES.filter((lc) => lc !== "en").map((locale) => ({
    locale,
  }));
}

// ---------- Metadata ----------

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; class?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const page = parsePage(sp.page);
  return buildMetadata({
    locale,
    title:
      page === 1
        ? "Intelligence Feed — Latest Events"
        : `Intelligence Feed — page ${page}`,
    description:
      "Verified events, conflict updates and intelligence briefs — updated in near real-time.",
    pathFor: (lc) => urls.news(lc, page === 1 ? undefined : page),
    feeds: [
      {
        type: "application/rss+xml",
        href: urls.newsFeed(locale),
        title: "Aegis Lens — events (RSS)",
      },
      {
        type: "application/atom+xml",
        href: urls.newsAtom(),
        title: "Aegis Lens — events (Atom)",
      },
      {
        type: "application/feed+json",
        href: urls.newsJsonLocale(locale),
        title: "Aegis Lens — events (JSON Feed)",
      },
    ],
  });
}

// ---------- Helpers ----------

function parsePage(raw: string | undefined): number {
  const p = Number(raw);
  return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
}

function parseMinSeverity(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0;
}

/** Simple server-side "X ago" — no locale formatting, just h/d units. */
function simpleTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function confidencePill(confidence: number): {
  label: string;
  className: string;
} {
  if (confidence >= 0.8)
    return {
      label: "HIGH",
      className:
        "bg-green-500/10 text-green-400 border border-green-500/20",
    };
  if (confidence >= 0.5)
    return {
      label: "MED",
      className:
        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    };
  return {
    label: "LOW",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
}

type VerificationCfg = { icon: string; label: string; className: string };

function verificationBadge(
  state: AegisEvent["verificationState"],
): VerificationCfg {
  switch (state) {
    case "corroborated":
      return {
        icon: "✓",
        label: "Corroborated",
        className: "text-green-400",
      };
    case "verified":
      return {
        icon: "✓",
        label: "Verified",
        className: "text-green-400",
      };
    case "disputed":
      return { icon: "⚠", label: "Disputed", className: "text-yellow-400" };
    case "retracted":
      return { icon: "✕", label: "Retracted", className: "text-red-400" };
    default:
      return {
        icon: "?",
        label: "Unverified",
        className: "text-text-muted",
      };
  }
}

function severityDots(severity: number): string {
  return "●".repeat(severity) + "○".repeat(Math.max(0, 5 - severity));
}

function eventsToday(events: AegisEvent[]): number {
  const dayMs = 86_400_000;
  const cutoff = Date.now() - dayMs;
  return events.filter((e) => Date.parse(e.occurredAt) >= cutoff).length;
}

function avgDanger(events: AegisEvent[]): number {
  if (!events.length) return 0;
  return Math.round(
    events.reduce((s, e) => s + e.dangerScore, 0) / events.length,
  );
}

/** Top N event classes by count, sorted descending. */
function topClasses(
  events: AegisEvent[],
  n: number,
): { id: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.class] = (counts[e.class] ?? 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id, count]) => ({ id, label: CLASS_LABEL[id] ?? id, count }));
}

// ---------- Sub-components ----------

function ClassChips({
  activeClass,
  locale,
}: {
  activeClass: string | undefined;
  locale: Locale;
}) {
  const newsPath = urls.news(locale);
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={newsPath}
        className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
          !activeClass
            ? "bg-accent text-black"
            : "border border-border-subtle text-text-secondary hover:border-accent/40"
        }`}
      >
        All
      </Link>
      {ALL_CLASSES.map((cls) => (
        <Link
          key={cls.id}
          href={`${newsPath}?class=${cls.id}`}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-colors ${
            activeClass === cls.id
              ? "bg-accent text-black"
              : "border border-border-subtle text-text-secondary hover:border-accent/40"
          }`}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: CLASS_COLOR[cls.id] }}
          />
          {cls.label}
        </Link>
      ))}
    </div>
  );
}

function EventCard({
  event,
  locale,
}: {
  event: AegisEvent;
  locale: Locale;
}) {
  const pill = confidencePill(event.confidence);
  const badge = verificationBadge(event.verificationState);
  const color = CLASS_COLOR[event.class];

  return (
    <article className="rounded border border-border-subtle bg-bg-surface p-4 hover:border-accent/30 transition-colors">
      {/* Header row */}
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        <span
          className="inline-block h-2 w-2 flex-none rounded-full"
          style={{ background: color }}
        />
        <span>{CLASS_LABEL[event.class]}</span>
        {event.subclass && (
          <>
            <span className="opacity-40">·</span>
            <span className="opacity-70">{event.subclass}</span>
          </>
        )}
        <span className="opacity-40">·</span>
        <span
          className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${
            event.severity >= 4
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : event.severity >= 3
                ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                : "border-border-subtle text-text-muted"
          }`}
        >
          SEV {event.severity}
        </span>
        <span className="ml-auto opacity-60">
          {simpleTimeAgo(event.occurredAt)}
        </span>
      </div>

      {/* Title */}
      <p className="mt-2 text-sm font-medium leading-snug text-text-primary">
        {event.summary.en}
      </p>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
        {/* Confidence */}
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${pill.className}`}>
          {pill.label}
        </span>

        {/* Danger */}
        <span className="text-text-muted">
          danger{" "}
          <span className="text-text-secondary">{event.dangerScore}</span>
        </span>

        {/* Verification */}
        <span className={`flex items-center gap-0.5 ${badge.className}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </span>

        {/* Location */}
        <span className="text-text-muted">
          {event.location.lat.toFixed(2)}°N {event.location.lon.toFixed(2)}°E
        </span>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <Link
          href={urls.event(locale, event.eventId)}
          className="font-mono text-[11px] text-accent hover:underline"
        >
          View details →
        </Link>
        <span className="font-mono text-[10px] text-text-muted">
          {formatDateTime(event.occurredAt, locale)}
        </span>
      </div>
    </article>
  );
}

function QuickStats({
  events,
}: {
  events: AegisEvent[];
}) {
  const today = eventsToday(events);
  const danger = avgDanger(events);

  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Quick Stats
      </h2>
      <dl className="mt-3 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">Events today</dt>
          <dd className="font-semibold text-text-primary">{today}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">Avg danger</dt>
          <dd
            className={`font-semibold ${
              danger >= 60
                ? "text-red-400"
                : danger >= 40
                  ? "text-orange-400"
                  : "text-green-400"
            }`}
          >
            {danger}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-text-muted">Sources active</dt>
          <dd className="font-semibold text-text-primary">6</dd>
        </div>
      </dl>
    </div>
  );
}

function SeverityFilter({ locale }: { locale: Locale }) {
  const newsPath = urls.news(locale);
  const levels = [
    { n: 5, label: "Critical" },
    { n: 4, label: "High" },
    { n: 3, label: "Medium" },
    { n: 2, label: "Low" },
    { n: 1, label: "Minimal" },
  ];

  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Filter by Severity
      </h2>
      <ul className="mt-3 space-y-1">
        {levels.map(({ n, label }) => (
          <li key={n}>
            <Link
              href={`${newsPath}?minSeverity=${n}`}
              className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-bg-elevated"
            >
              <span className="text-text-secondary">{label}</span>
              <span className="font-mono tracking-tight text-text-muted">
                {severityDots(n)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopClassesChart({ events }: { events: AegisEvent[] }) {
  const top = topClasses(events, 5);
  const max = top[0]?.count ?? 1;

  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Top Event Classes
      </h2>
      <ul className="mt-3 space-y-2">
        {top.map(({ id, label, count }) => (
          <li key={id}>
            <div className="mb-0.5 flex items-center justify-between font-mono text-[10px]">
              <span className="text-text-secondary">{label}</span>
              <span className="text-text-muted">{count}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-bg-elevated">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.round((count / max) * 100)}%`,
                  background: CLASS_COLOR[id] ?? "#4ea1ff",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BriefsCTA({ locale }: { locale: Locale }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
        Intelligence Briefs
      </h2>
      <p className="mt-2 text-xs text-text-secondary">
        Get daily AI-curated briefs — verified events, threat summaries,
        conflict updates — delivered to your inbox.
      </p>
      <Link
        href={urls.alerts(locale)}
        className="mt-2 block font-mono text-xs text-accent hover:underline"
      >
        View all briefs →
      </Link>
      <form
        action="/api/subscribe"
        method="post"
        className="mt-3 flex gap-2"
      >
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="min-w-0 flex-1 rounded border border-border-subtle bg-bg-elevated px-2.5 py-1.5 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="flex-none rounded bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-black hover:opacity-90 transition-opacity"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

function RssCard({ locale }: { locale: Locale }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
        RSS Feeds
      </h2>
      <ul className="mt-3 space-y-1.5 font-mono text-xs">
        <li>
          <Link
            href={urls.newsFeed(locale)}
            className="flex items-center gap-2 text-text-secondary hover:text-accent"
          >
            <span className="text-orange-400">◈</span>
            RSS 2.0 feed
          </Link>
        </li>
        <li>
          <Link
            href={urls.newsAtom()}
            className="flex items-center gap-2 text-text-secondary hover:text-accent"
          >
            <span className="text-blue-400">◈</span>
            Atom feed
          </Link>
        </li>
        <li>
          <Link
            href={urls.newsJsonLocale(locale)}
            className="flex items-center gap-2 text-text-secondary hover:text-accent"
          >
            <span className="text-yellow-400">◈</span>
            JSON Feed
          </Link>
        </li>
      </ul>
    </div>
  );
}

// ---------- Page ----------

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    class?: string;
    minSeverity?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const sp = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const page = parsePage(sp.page);
  const activeClass = sp.class;
  const minSeverity = parseMinSeverity(sp.minSeverity);

  // All UA events — used for sidebar stats over full set
  const allUa = eventsInCountry("ua").sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );

  // Filtered events for main list
  let filtered = allUa;
  if (activeClass) {
    filtered = filtered.filter((e) => e.class === activeClass);
  }
  if (minSeverity > 0) {
    filtered = filtered.filter((e) => e.severity >= minSeverity);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(offset, offset + PAGE_SIZE);

  // All seed events (for top-classes chart — shows full global picture)
  const allGlobal = listEvents();

  const newsPath = urls.news(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Intelligence Feed — Latest Events",
        url: `${SITE.url}${newsPath}`,
        isPartOf: {
          "@type": "WebSite",
          url: SITE.url,
          name: SITE.name,
        },
        hasPart: slice.map((e) => ({
          "@type": "NewsArticle",
          headline: e.summary.en,
          datePublished: e.occurredAt,
          url: `${SITE.url}${urls.event(locale, e.eventId)}`,
        })),
      },
      {
        "@type": "ItemList",
        name: "Latest Intelligence Events",
        description: "Verified conflict intelligence events",
        numberOfItems: allUa.length,
        itemListElement: allUa.slice(0, 10).map((ev, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "NewsArticle",
            headline: ev.summary.en,
            datePublished: ev.occurredAt,
            url: `${SITE.url}${urls.event(locale, ev.eventId)}`,
            author: { "@type": "Organization", name: "Aegis Lens" },
          },
        })),
      },
    ],
  };

  // Build pagination hrefs preserving existing filters
  function paginationHref(targetPage: number): string {
    const qs = new URLSearchParams();
    if (targetPage > 1) qs.set("page", String(targetPage));
    if (activeClass) qs.set("class", activeClass);
    if (minSeverity > 0) qs.set("minSeverity", String(minSeverity));
    const q = qs.toString();
    return `${newsPath}${q ? `?${q}` : ""}`;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Intelligence Feed"
        title="Latest Events"
        description="Verified events, conflict updates and intelligence briefs — updated in near real-time."
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Category chips */}
        <div className="mb-6">
          <ClassChips activeClass={activeClass} locale={locale} />
        </div>

        <div className="flex gap-8">
          {/* ── Main column ── */}
          <main id="main-content" className="min-w-0 flex-1">
            {/* Active filter notice */}
            {(activeClass || minSeverity > 0) && (
              <p className="mb-4 font-mono text-xs text-text-muted">
                Showing{" "}
                <span className="text-text-secondary">{total}</span> events
                {activeClass && (
                  <>
                    {" "}
                    in class{" "}
                    <span className="text-accent">
                      {CLASS_LABEL[activeClass] ?? activeClass}
                    </span>
                  </>
                )}
                {minSeverity > 0 && (
                  <>
                    {" "}
                    with severity ≥{" "}
                    <span className="text-accent">{minSeverity}</span>
                  </>
                )}
                {" · "}
                <Link href={newsPath} className="text-accent hover:underline">
                  Clear filters
                </Link>
              </p>
            )}

            {/* Event cards */}
            {slice.length === 0 ? (
              <div className="rounded border border-border-subtle bg-bg-surface px-6 py-12 text-center">
                <p className="font-mono text-sm text-text-muted">
                  No events match the current filters.
                </p>
                <Link
                  href={newsPath}
                  className="mt-3 inline-block font-mono text-xs text-accent hover:underline"
                >
                  Clear filters →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 stagger-children" role="list">
                {slice.map((event) => (
                  <li key={event.eventId}>
                    <EventCard event={event} locale={locale} />
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            <nav
              className="mt-8 flex items-center justify-between text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={paginationHref(page - 1)}
                  rel="prev"
                  className="rounded border border-border-default px-3 py-1.5 font-mono text-xs text-text-primary hover:bg-bg-surface"
                >
                  ← Prev
                </Link>
              ) : (
                <span />
              )}
              <span className="font-mono text-xs text-text-muted">
                Page {page} of {totalPages} · {total} events
              </span>
              {page < totalPages ? (
                <Link
                  href={paginationHref(page + 1)}
                  rel="next"
                  className="rounded border border-border-default px-3 py-1.5 font-mono text-xs text-text-primary hover:bg-bg-surface"
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </main>

          {/* ── Sidebar ── */}
          <aside className="w-72 shrink-0 space-y-4">
            <QuickStats events={allUa} />
            <SeverityFilter locale={locale} />
            <TopClassesChart events={allGlobal} />
            <BriefsCTA locale={locale} />
            <RssCard locale={locale} />
          </aside>
        </div>
      </div>
    </>
  );
}
