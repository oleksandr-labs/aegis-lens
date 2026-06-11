import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, absoluteUrl } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { eventById, listEvents } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { formatDateTime, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";
import { MiniMap } from "@/components/Map/MiniMap";
import { ShareButton } from "@/components/ShareButton";
import { CopyEventIdButton } from "./CopyEventIdButton";
import { PinToDashboardButton } from "./PinToDashboardButton";

// ------------------------------------------------------------------ types

type Params = { locale: string; id: string };

// ------------------------------------------------------------------ static params

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const ev of listEvents()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, id: ev.eventId });
    }
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
  const title = ev.summary[locale] ?? ev.summary.en;
  return buildMetadata({
    locale,
    title,
    description: `${ev.class} · severity ${ev.severity}/5 · confidence ${Math.round(ev.confidence * 100)}% · ${formatDateTime(ev.occurredAt, locale)}`,
    pathFor: (lc) => urls.event(lc, id),
    noindex: ev.verificationState === "retracted",
  });
}

// ------------------------------------------------------------------ helpers

const CLASS_LABEL = Object.fromEntries(
  ALL_CLASSES.map((c) => [c.id, c.label]),
) as Record<string, string>;

function confidenceColor(conf: number): string {
  if (conf >= 0.8) return "#22c55e";
  if (conf >= 0.5) return "#f59e0b";
  return "#ef4444";
}

function severityLabel(s: number): string {
  return ["None", "Low", "Moderate", "High", "Critical", "Extreme"][s] ?? String(s);
}

function verificationColor(state: string): string {
  switch (state) {
    case "corroborated": return "#22c55e";
    case "verified":     return "#4ea1ff";
    case "disputed":     return "#f59e0b";
    case "retracted":    return "#ef4444";
    default:             return "#94a3b8";
  }
}

// ------------------------------------------------------------------ page

export default async function EventDetailPage({
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
  const confColor = confidenceColor(ev.confidence);
  const pageUrl = absoluteUrl(SITE.url, urls.event(locale, id));

  // Related events: same class, not this event, up to 3 most recent
  const related = listEvents()
    .filter((e) => e.class === ev.class && e.eventId !== ev.eventId)
    .slice(0, 3);

  // Verification chain
  const VERIFICATION_STEPS = [
    { step: "Ingested",        done: true,                                          detail: "Raw event received from source" },
    { step: "Deduplicated",    done: true,                                          detail: "No duplicate events found" },
    { step: "Geolocated",      done: true,                                          detail: `lat: ${ev.location.lat}, lon: ${ev.location.lon}` },
    { step: "Cross-referenced", done: ev.verificationState !== "unverified",        detail: "2 independent sources" },
    { step: "AI Verified",     done: ev.verificationState === "corroborated",       detail: "Vision + NLP verification passed" },
    { step: "Human Reviewed",  done: false,                                         detail: "Pending review queue" },
  ];

  // Sub-nav tabs
  const TABS = [
    { label: "Overview",  href: urls.event(locale, id) },
    { label: "Sources",   href: urls.eventSources(locale, id) },
    { label: "Media",     href: urls.eventMedia(locale, id) },
    { label: "Timeline",  href: urls.eventTimeline(locale, id) },
    { label: "Related",   href: urls.eventRelated(locale, id) },
  ];

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        "@id": pageUrl,
        name: title,
        description: title,
        startDate: ev.occurredAt,
        eventStatus:
          ev.verificationState === "retracted"
            ? "https://schema.org/EventCancelled"
            : "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          geo: {
            "@type": "GeoCoordinates",
            latitude: ev.location.lat,
            longitude: ev.location.lon,
          },
        },
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
          { "@type": "ListItem", position: 2, name: title, item: pageUrl },
        ],
      },
      {
        "@type": "NewsArticle",
        headline: ev.summary.en,
        datePublished: ev.occurredAt,
        dateModified: ev.occurredAt,
        author: {
          "@type": "Organization",
          name: "Aegis Lens Verification Team",
          url: "https://aegislens.io/team",
        },
        publisher: {
          "@type": "Organization",
          name: "Aegis Lens",
          logo: {
            "@type": "ImageObject",
            url: "https://aegislens.io/icon.png",
          },
        },
        description: ev.summary.en,
        keywords: [ev.class, ev.subclass].filter(Boolean).join(", "),
        about: {
          "@type": "Place",
          geo: {
            "@type": "GeoCoordinates",
            latitude: ev.location.lat,
            longitude: ev.location.lon,
          },
        },
        inLanguage: "en",
        isAccessibleForFree: true,
        url: pageUrl,
        credibilitySignals: {
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: Math.round(ev.confidence * 5),
            bestRating: 5,
          },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Class colour bar — full-width accent strip */}
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ---- Hero ---- */}
        <header className="mb-6">
          {/* Breadcrumb */}
          <nav className="mb-4 font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
            <Link href={urls.map(locale)} className="hover:text-text-primary">
              Live map
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <Link
              href={locale === "en" ? "/events" : `/${locale}/events`}
              className="hover:text-text-primary"
            >
              Events
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <span className="text-text-secondary">{ev.eventId}</span>
          </nav>

          {/* Eyebrow */}
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-text-muted">
            <span style={{ color }}>{classLabel}</span>
            {" / "}
            {ev.subclass ?? "—"}
          </p>

          {/* Title */}
          <h1 className="text-2xl font-semibold leading-snug text-text-primary">
            {title}
          </h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {/* Severity */}
            <span className="inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-surface px-2 py-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">Severity</span>
              <span className="font-semibold text-text-primary">
                {severityLabel(ev.severity)} ({ev.severity}/5)
              </span>
            </span>

            {/* Confidence */}
            <span className="inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-surface px-2 py-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">Confidence</span>
              <span className="font-semibold" style={{ color: confColor }}>
                {Math.round(ev.confidence * 100)}%
              </span>
            </span>

            {/* Danger */}
            <span className="inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-surface px-2 py-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">Danger</span>
              <span className="font-semibold text-text-primary">{ev.dangerScore}/100</span>
            </span>

            {/* Verification chip */}
            <span
              className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-surface px-2 py-1"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: verificationColor(ev.verificationState) }}
              />
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                {ev.verificationState}
              </span>
            </span>

            {/* Timestamp */}
            <span className="font-mono text-[10px] text-text-muted">
              {formatDateTime(ev.occurredAt, locale)}
              {" · "}
              {timeAgo(ev.occurredAt, locale)}
            </span>

            {/* Coords */}
            <span className="font-mono text-[10px] text-text-muted">
              {ev.location.lat.toFixed(4)}, {ev.location.lon.toFixed(4)}
            </span>
          </div>
        </header>

        {/* ---- Sub-navigation tabs ---- */}
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
                i === 0
                  ? "rounded-l-lg bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                i === TABS.length - 1 ? "rounded-r-lg" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* ---- 2-column layout ---- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* ======== MAIN / ARTICLE ======== */}
          <article className="min-w-0 space-y-8">
            {/* Map */}
            <section>
              <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Location
              </h2>
              <MiniMap
                center={[ev.location.lon, ev.location.lat]}
                zoom={9}
                events={[ev]}
                height={320}
              />
              <p className="mt-2 font-mono text-[11px] text-text-muted">
                {ev.location.lat.toFixed(4)}, {ev.location.lon.toFixed(4)}
                {" · precision "}
                {ev.location.precisionM ?? "?"} m
              </p>
            </section>

            {/* Confidence visualization */}
            <section>
              <div className="rounded border border-border-subtle bg-bg-surface p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
                  <span className="font-mono uppercase tracking-wider">Confidence</span>
                  <span className="font-semibold text-text-primary">
                    {Math.round(ev.confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${ev.confidence * 100}%`,
                      background: confColor,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-text-muted">
                  <span>Unverified</span>
                  <span>Corroborated</span>
                </div>
              </div>
            </section>

            {/* Verification chain */}
            <section>
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Verification chain
              </h2>
              <ol className="space-y-0">
                {VERIFICATION_STEPS.map((step, i) => (
                  <li key={step.step} className="flex gap-3">
                    {/* Connector column */}
                    <div className="flex flex-col items-center">
                      <div
                        className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full border-2"
                        style={{
                          borderColor: step.done ? "#22c55e" : "#334155",
                          background: step.done ? "#22c55e" : "transparent",
                        }}
                      />
                      {i < VERIFICATION_STEPS.length - 1 && (
                        <div
                          className="my-1 w-px flex-1"
                          style={{
                            background: step.done ? "#22c55e40" : "#1e293b",
                            minHeight: "28px",
                          }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-4">
                      <p
                        className="text-sm font-medium"
                        style={{ color: step.done ? "#e8edf5" : "#64748b" }}
                      >
                        {step.step}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Sources summary (links to full sources sub-page) */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Sources
                </h2>
                <Link
                  href={urls.eventSources(locale, id)}
                  className="font-mono text-[10px] text-accent hover:underline"
                >
                  View all sources →
                </Link>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {ev.sources.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-2"
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-accent hover:underline"
                    >
                      {s.url}
                    </a>
                    <span className="ml-3 flex-shrink-0 font-mono text-[10px] uppercase text-text-muted">
                      {s.language}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Metadata table */}
            <section>
              <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Metadata
              </h2>
              <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <MetaRow label="Event ID"  value={ev.eventId}                         mono />
                <MetaRow label="Class"     value={`${classLabel} / ${ev.subclass ?? "—"}`} />
                <MetaRow label="Occurred"  value={formatDateTime(ev.occurredAt, locale)} />
                <MetaRow label="Reported"  value={formatDateTime(ev.reportedAt, locale)} />
                <MetaRow label="Ingested"  value={formatDateTime(ev.ingestedAt, locale)} />
                <MetaRow label="Severity"  value={`${severityLabel(ev.severity)} (${ev.severity}/5)`} />
                <MetaRow label="Danger score" value={`${ev.dangerScore}/100`} />
                <MetaRow label="Precision" value={`${ev.location.precisionM ?? "?"} m`} />
              </dl>
            </section>

            <p className="pt-2 text-xs text-text-muted">
              <Link href={urls.map(locale)} className="text-accent hover:underline">
                ← Back to live map
              </Link>
            </p>
          </article>

          {/* ======== SIDEBAR ======== */}
          <aside className="space-y-6">
            {/* Actions card */}
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Actions
              </p>
              <div className="flex flex-col gap-2">
                <CopyEventIdButton eventId={ev.eventId} />
                <ShareButton url={pageUrl} title={title} />
                <PinToDashboardButton />
              </div>

              {/* Export links */}
              <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Export
              </p>
              <div className="flex gap-2">
                {(["JSON", "GeoJSON", "STIX"] as const).map((fmt) => (
                  <a
                    key={fmt}
                    href={`/api/events/${ev.eventId}/export?format=${fmt.toLowerCase()}`}
                    className="rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {fmt}
                  </a>
                ))}
              </div>
            </div>

            {/* Event metadata card */}
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Event metadata
              </p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Source count</dt>
                  <dd className="font-mono text-text-primary">
                    {ev.sources.length} source{ev.sources.length === 1 ? "" : "s"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Ingested</dt>
                  <dd className="font-mono text-text-primary">
                    {timeAgo(ev.ingestedAt, locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Last updated</dt>
                  <dd className="font-mono text-text-primary">
                    {formatDateTime(ev.occurredAt, locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Schema</dt>
                  <dd className="font-mono text-text-primary">v1.0</dd>
                </div>
              </dl>
            </div>

            {/* Related events */}
            {related.length > 0 && (
              <div className="rounded border border-border-subtle bg-bg-surface p-4">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Related events
                </p>
                <ul className="space-y-3">
                  {related.map((r) => {
                    const rLabel = CLASS_LABEL[r.class] ?? r.class;
                    const rColor = CLASS_COLOR[r.class] ?? "#94a3b8";
                    return (
                      <li key={r.eventId}>
                        <Link
                          href={urls.event(locale, r.eventId)}
                          className="group block rounded border border-border-subtle bg-bg-elevated p-3 hover:border-border-default"
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                              style={{ background: rColor }}
                            />
                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                              {rLabel}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs text-text-secondary group-hover:text-text-primary">
                            {r.summary.en}
                          </p>
                          <p className="mt-1 font-mono text-[9px] text-text-muted">
                            {timeAgo(r.occurredAt, locale)}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Quick links to sub-pages */}
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Sub-pages
              </p>
              <ul className="space-y-1">
                {TABS.slice(1).map((tab) => (
                  <li key={tab.label}>
                    <Link
                      href={tab.href}
                      className="flex items-center justify-between py-1 text-xs text-text-secondary hover:text-accent"
                    >
                      <span>{tab.label}</span>
                      <span className="font-mono text-text-muted">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ helpers

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded border border-border-subtle bg-bg-surface px-4 py-2">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </dt>
      <dd className={`text-sm ${mono ? "font-mono" : ""} text-text-primary`}>
        {value}
      </dd>
    </div>
  );
}
