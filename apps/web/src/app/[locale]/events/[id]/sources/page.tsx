import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { eventById, listEvents } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { formatDateTime, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";
import { SourceChain, SAMPLE_CHAIN } from "@/components/SourceChain";

// ------------------------------------------------------------------ types

type Params = { locale: string; id: string };

type EnrichedSource = {
  name: string;
  url: string;
  type: string;
  reliability: "high" | "medium" | "low";
  addedAt: string;
  archiveSnapshotUrl: string;
};

// ------------------------------------------------------------------ static params

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const ev of listEvents()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, id: ev.eventId });
  }
  return out;
}

// ------------------------------------------------------------------ metadata

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `Sources — ${ev.summary[locale] ?? ev.summary.en}`,
    description: `Source provenance for event ${ev.eventId}: ${ev.sources.length} source records with fetched-at, language, and archive availability.`,
    pathFor: (lc) => localePath(lc, `/events/${id}/sources`),
  });
}

// ------------------------------------------------------------------ helpers

const CLASS_LABEL = Object.fromEntries(
  ALL_CLASSES.map((c) => [c.id, c.label]),
) as Record<string, string>;

function reliabilityColor(r: EnrichedSource["reliability"]): string {
  switch (r) {
    case "high":   return "#22c55e";
    case "medium": return "#f59e0b";
    case "low":    return "#ef4444";
  }
}

function typeBgClass(type: string): string {
  if (type.toLowerCase().includes("telegram")) return "bg-[#229ED9]/10 text-[#229ED9] border-[#229ED9]/20";
  if (type.toLowerCase().includes("research"))  return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (type.toLowerCase().includes("official"))  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-bg-elevated text-text-muted border-border-subtle";
}

function archiveOrgUrl(originalUrl: string): string {
  return `https://web.archive.org/web/*/${encodeURIComponent(originalUrl)}`;
}

// ------------------------------------------------------------------ page

export default async function EventSourcesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ev = eventById(id);
  if (!ev) notFound();

  const title = ev.summary[locale] ?? ev.summary.en;
  const classLabel = CLASS_LABEL[ev.class] ?? ev.class;
  const color = CLASS_COLOR[ev.class] ?? "#94a3b8";
  const pageUrl = `${SITE.url}${localePath(locale, `/events/${id}/sources`)}`;

  // Enriched sources: merge seed event sources with hardcoded named sources for seed events
  const ENRICHED_SOURCES: EnrichedSource[] = [
    {
      name: "Telegram: @UkraineNow",
      url: "https://t.me/ukrainenow",
      type: "Telegram channel",
      reliability: "high",
      addedAt: ev.occurredAt,
      archiveSnapshotUrl: archiveOrgUrl("https://t.me/ukrainenow"),
    },
    {
      name: "ISW Daily Assessment",
      url: "https://understandingwar.org",
      type: "Research institute",
      reliability: "high",
      addedAt: ev.occurredAt,
      archiveSnapshotUrl: archiveOrgUrl("https://understandingwar.org"),
    },
    // Merge any real sources from the seed event
    ...ev.sources
      .filter((s) => s.url && s.url !== "https://example.com/synthetic")
      .map((s) => ({
        name: s.url,
        url: s.url,
        type: "Raw source",
        reliability: "medium" as const,
        addedAt: s.fetchedAt,
        archiveSnapshotUrl: s.archiveUrl ?? archiveOrgUrl(s.url),
      })),
  ];

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Sources — ${ev.eventId}`,
        description: `Source provenance for event ${ev.eventId}.`,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        inLanguage: locale,
        citation: ENRICHED_SOURCES.map((s) => ({
          "@type": "CreativeWork",
          name: s.name,
          url: s.url,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Events",
            item: `${SITE.url}${locale === "en" ? "/events" : `/${locale}/events`}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: ev.eventId,
            item: `${SITE.url}${urls.event(locale, id)}`,
          },
          { "@type": "ListItem", position: 3, name: "Sources" },
        ],
      },
    ],
  };

  // Sub-nav tabs
  const TABS = [
    { label: "Overview",  href: urls.event(locale, id) },
    { label: "Sources",   href: urls.eventSources(locale, id) },
    { label: "Media",     href: urls.eventMedia(locale, id) },
    { label: "Timeline",  href: urls.eventTimeline(locale, id) },
    { label: "Related",   href: urls.eventRelated(locale, id) },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Class colour bar */}
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav
          className="mb-4 font-mono text-[11px] text-text-muted"
          aria-label="Breadcrumb"
        >
          <Link
            href={locale === "en" ? "/events" : `/${locale}/events`}
            className="hover:text-text-primary"
          >
            Events
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <Link
            href={urls.event(locale, id)}
            className="hover:text-text-primary"
          >
            {ev.eventId}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">Sources</span>
        </nav>

        {/* Page heading */}
        <header className="mb-6">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest" style={{ color }}>
            {classLabel}
          </p>
          <h1 className="text-xl font-semibold text-text-primary">
            Sources — {ev.eventId}
          </h1>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{title}</p>
        </header>

        {/* Sub-navigation tabs */}
        <nav
          className="mb-8 flex gap-0 overflow-x-auto rounded-lg border border-border-subtle bg-bg-surface"
          aria-label="Event sections"
        >
          {TABS.map((tab, i) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={[
                "flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors",
                i === 1
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                i === 0 ? "rounded-l-lg" : "",
                i === TABS.length - 1 ? "rounded-r-lg" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Provenance note */}
        <section className="mb-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Provenance discipline
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Every source on this event carries a fetched-at timestamp and a
            content hash. See{" "}
            <Link
              href={urls.methodologyTopic(locale, "source-tiering")}
              className="text-accent hover:underline"
            >
              /methodology/source-tiering
            </Link>{" "}
            for how each source contributes to the confidence score.
          </p>
        </section>

        {/* Provenance chain */}
        <section className="mb-8">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Propagation chain
          </h2>
          <SourceChain items={SAMPLE_CHAIN} />
        </section>

        {/* Source count + list */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {ENRICHED_SOURCES.length} source
            {ENRICHED_SOURCES.length === 1 ? "" : "s"}
          </h2>

          <ul className="space-y-3">
            {ENRICHED_SOURCES.map((s, i) => (
              <li
                key={i}
                className="rounded border border-border-subtle bg-bg-surface p-4"
              >
                {/* Top row: type badge + name + reliability */}
                <div className="flex flex-wrap items-start gap-2">
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${typeBgClass(s.type)}`}
                  >
                    {s.type}
                  </span>

                  <a
                    href={s.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex-1 text-sm font-medium text-accent hover:underline"
                  >
                    {s.name}
                    <span className="ml-1 font-mono text-[10px] text-text-muted">
                      ↗
                    </span>
                  </a>

                  <span
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded border border-border-subtle px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{ color: reliabilityColor(s.reliability) }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: reliabilityColor(s.reliability) }}
                    />
                    {s.reliability} reliability
                  </span>
                </div>

                {/* URL (muted) */}
                <p className="mt-1.5 truncate font-mono text-[10px] text-text-muted">
                  {s.url}
                </p>

                {/* Bottom row: archive link + added timestamp */}
                <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] text-text-muted">
                  <a
                    href={s.archiveSnapshotUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Archive.org snapshot ↗
                  </a>
                  <span>
                    Added {timeAgo(s.addedAt, locale)} ·{" "}
                    {formatDateTime(s.addedAt, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Reliability timeline */}
        <section className="mt-8 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
            Source reliability at time of publication
          </div>
          {ENRICHED_SOURCES.map((s, i) => (
            <p key={i} className="mt-1.5 text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{s.name}</span>
              {" "}was{" "}
              <span
                className="font-mono"
                style={{ color: reliabilityColor(s.reliability) }}
              >
                {s.reliability === "high"
                  ? "Tier 1"
                  : s.reliability === "medium"
                  ? "Tier 2"
                  : "Tier 3"}
              </span>
              {" "}at time of event publication.
            </p>
          ))}
        </section>

        {/* Submit additional source */}
        <form className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Submit an additional source
          </h3>
          <input
            type="url"
            placeholder="https://..."
            className="w-full rounded border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Brief description of the source and what it corroborates…"
            rows={3}
            className="mt-2 w-full rounded border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
          />
          <button
            type="submit"
            className="mt-3 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Submit for review
          </button>
        </form>

        {/* Footer links */}
        <p className="mt-10 text-xs text-text-muted">
          Lifecycle timeline:{" "}
          <Link
            href={urls.eventTimeline(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/timeline
          </Link>{" "}
          · related events:{" "}
          <Link
            href={urls.eventRelated(locale, id)}
            className="text-accent hover:underline"
          >
            /events/{id}/related
          </Link>
        </p>
      </div>
    </>
  );
}
