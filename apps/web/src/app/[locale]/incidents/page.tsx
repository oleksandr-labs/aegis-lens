import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { eventsInCountry } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { AegisEvent, EventClass } from "@aegis/types";

// ------------------------------------------------------------------ static

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

// ------------------------------------------------------------------ metadata

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Incident Tracker — Intelligence Hub",
    description:
      "Aggregated view of verified incidents. Track patterns, clusters, and anomalies across all monitored regions.",
    pathFor: (lc) => localePath(lc, "/incidents"),
  });
}

// ------------------------------------------------------------------ constants

const ACTIVE_SUMMARY = {
  total: 47,
  highSeverity: 12,
  avgDanger: 68,
  regionsAffected: 8,
  sourcesActive: 6,
};

const REGION_DATA = [
  { name: "Kharkiv",      events: 18, danger: 74 },
  { name: "Donetsk",      events: 31, danger: 89 },
  { name: "Zaporizhzhia", events: 12, danger: 65 },
  { name: "Kherson",      events:  8, danger: 58 },
  { name: "Kyiv",         events:  4, danger: 42 },
  { name: "Mykolaiv",     events:  6, danger: 51 },
  { name: "Odesa",        events:  3, danger: 38 },
  { name: "Dnipro",       events:  7, danger: 47 },
  { name: "Lviv",         events:  1, danger: 18 },
];

const ANOMALIES = [
  {
    type: "volume_spike",
    message:
      "Military events in Kharkiv Oblast: +340% vs 7-day baseline",
    detected: "2h ago",
    severity: "high",
  },
  {
    type: "new_source",
    message:
      "New Telegram source detected reporting 12 events — under reliability assessment",
    detected: "4h ago",
    severity: "medium",
  },
  {
    type: "cluster",
    message:
      "Drone events forming cluster pattern in NE Kharkiv — possible launch site",
    detected: "6h ago",
    severity: "high",
  },
] as const;

// ------------------------------------------------------------------ helpers

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

/** Trend arrow: ↑ for military/cyber, → for everything else */
function trendArrow(cls: EventClass): string {
  return cls === "military_action" || cls === "cyber" ? "↑" : "→";
}

function regionDangerCls(danger: number): string {
  if (danger > 70) return "bg-red-500/70";
  if (danger > 50) return "bg-yellow-500/70";
  return "bg-green-500/40";
}

function anomalyBorderCls(sev: string): string {
  return sev === "high"
    ? "border-red-500/50 bg-red-500/5"
    : "border-yellow-500/40 bg-yellow-500/5";
}

function anomalyBadgeCls(sev: string): string {
  return sev === "high"
    ? "border-red-500/60 text-red-400"
    : "border-yellow-500/50 text-yellow-400";
}

function anomalyTypeLabel(type: string): string {
  switch (type) {
    case "volume_spike": return "Volume Spike";
    case "new_source":   return "New Source";
    case "cluster":      return "Cluster Pattern";
    default:             return type;
  }
}

function dangerRowCls(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  return "text-yellow-300";
}

// ------------------------------------------------------------------ sort util

type SortField = "class" | "count" | "avgDanger" | "latest";
type SortDir = "asc" | "desc";

function parseSortParams(
  raw: Record<string, string | string[] | undefined>,
): { field: SortField; dir: SortDir } {
  const field = (raw["sort"] as SortField | undefined) ?? "count";
  const dir = (raw["dir"] as SortDir | undefined) ?? "desc";
  const validFields: SortField[] = ["class", "count", "avgDanger", "latest"];
  return {
    field: validFields.includes(field) ? field : "count",
    dir: dir === "asc" ? "asc" : "desc",
  };
}

// ------------------------------------------------------------------ page

export default async function IncidentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const sp = (await searchParams) ?? {};
  const { field: sortField, dir: sortDir } = parseSortParams(sp);

  // All UA events from seed
  const allEvents = eventsInCountry("ua");

  // Group by class
  const byClass = new Map<EventClass, AegisEvent[]>();
  for (const e of allEvents) {
    const arr = byClass.get(e.class) ?? [];
    arr.push(e);
    byClass.set(e.class, arr);
  }

  // Build class rows
  type ClassRow = {
    id: EventClass;
    label: string;
    count: number;
    avgDanger: number;
    latest: string; // ISO
    trend: string;
  };

  const classRows: ClassRow[] = [];
  for (const [cls, events] of byClass.entries()) {
    const count = events.length;
    const avgDanger = Math.round(events.reduce((a, e) => a + e.dangerScore, 0) / count);
    const sorted = [...events].sort(
      (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
    );
    classRows.push({
      id: cls,
      label: CLASS_LABEL[cls] ?? cls,
      count,
      avgDanger,
      latest: sorted[0]?.occurredAt ?? "",
      trend: trendArrow(cls),
    });
  }

  // Apply sort
  classRows.sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "class":
        cmp = a.label.localeCompare(b.label);
        break;
      case "count":
        cmp = a.count - b.count;
        break;
      case "avgDanger":
        cmp = a.avgDanger - b.avgDanger;
        break;
      case "latest":
        cmp = Date.parse(a.latest) - Date.parse(b.latest);
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Recent 10 events for timeline
  const recent10 = [...allEvents]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 10);

  // Sort link builder
  function sortHref(f: SortField): string {
    const newDir = sortField === f && sortDir === "desc" ? "asc" : "desc";
    return `?sort=${f}&dir=${newDir}`;
  }

  function sortIndicator(f: SortField): string {
    if (sortField !== f) return "⇅";
    return sortDir === "desc" ? "↓" : "↑";
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Incident Tracker",
    description:
      "Aggregated view of verified incidents. Track patterns, clusters, and anomalies across all monitored regions.",
    url: `${SITE.url}${localePath(locale, "/incidents")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Intelligence"
        title="Incident Tracker"
        description="Aggregated view of verified incidents. Track patterns, clusters, and anomalies across all monitored regions."
      />

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10">

        {/* ── Active Summary KPI strip ── */}
        <section aria-label="Active incidents summary">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Active Incidents — Live Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Total Active
              </div>
              <div className="mt-1.5 text-3xl font-semibold text-text-primary">
                {ACTIVE_SUMMARY.total}
              </div>
            </div>
            <div className="rounded border border-red-500/30 bg-red-500/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                High Severity
              </div>
              <div className="mt-1.5 text-3xl font-semibold text-red-400">
                {ACTIVE_SUMMARY.highSeverity}
              </div>
            </div>
            <div className="rounded border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Avg Danger
              </div>
              <div className="mt-1.5 text-3xl font-semibold text-orange-400">
                {ACTIVE_SUMMARY.avgDanger}
              </div>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Regions
              </div>
              <div className="mt-1.5 text-3xl font-semibold text-text-primary">
                {ACTIVE_SUMMARY.regionsAffected}
              </div>
            </div>
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Sources Active
              </div>
              <div className="mt-1.5 text-3xl font-semibold text-accent">
                {ACTIVE_SUMMARY.sourcesActive}
              </div>
            </div>
          </div>
        </section>

        {/* ── Incident Categories table ── */}
        <section aria-label="Incident categories">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Incident Categories
          </h2>
          <div className="overflow-x-auto rounded border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-elevated">
                  {(
                    [
                      ["class",     "Category"],
                      ["count",     "Events"],
                      ["avgDanger", "Avg Danger"],
                      ["latest",    "Latest"],
                    ] as [SortField, string][]
                  ).map(([f, label]) => (
                    <th key={f} className="px-4 py-2.5 text-left">
                      <Link
                        href={sortHref(f)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text-muted hover:text-text-primary"
                      >
                        {label}
                        <span className="text-[8px]">{sortIndicator(f)}</span>
                      </Link>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {classRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center font-mono text-[11px] text-text-muted"
                    >
                      No events in seed data
                    </td>
                  </tr>
                ) : (
                  classRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ background: CLASS_COLOR[row.id] }}
                          />
                          <span className="text-text-primary">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-primary">
                        {row.count}
                      </td>
                      <td className={`px-4 py-3 font-mono ${dangerRowCls(row.avgDanger)}`}>
                        {row.avgDanger}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-muted">
                        {row.latest
                          ? timeAgo(row.latest, locale)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-text-muted">
                        {row.trend}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Regional Heatmap ── */}
        <section aria-label="Regional heatmap">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Regional Heatmap — Ukraine
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {REGION_DATA.map((r) => (
              <div
                key={r.name}
                className="rounded border border-border-subtle bg-bg-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{r.name}</span>
                  <span className="font-mono text-xs text-text-muted">{r.events} ev</span>
                </div>
                {/* danger bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full ${regionDangerCls(r.danger)}`}
                    style={{ width: `${r.danger}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[10px] text-text-muted">
                  danger {r.danger}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Timeline of recent incidents ── */}
        <section aria-label="Recent incidents timeline">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Recent Incidents — Last 10
          </h2>
          <ol className="relative space-y-0 border-l border-border-subtle pl-6">
            {recent10.map((e) => {
              const color = CLASS_COLOR[e.class] ?? "#94a3b8";
              const label = CLASS_LABEL[e.class] ?? e.class;
              return (
                <li key={e.eventId} className="relative pb-6 last:pb-0">
                  {/* timeline dot */}
                  <span
                    className="absolute -left-[22px] top-1 inline-block h-3 w-3 rounded-full border-2 border-bg-base"
                    style={{ background: color }}
                  />
                  <Link
                    href={urls.event(locale, e.eventId)}
                    className="group block rounded border border-border-subtle bg-bg-surface p-3 hover:bg-bg-elevated"
                  >
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                      <span
                        className="uppercase tracking-wider"
                        style={{ color }}
                      >
                        {label}
                      </span>
                      {e.subclass && (
                        <span className="text-text-muted">· {e.subclass}</span>
                      )}
                      <span className="text-text-muted">
                        · conf {Math.round(e.confidence * 100)}%
                      </span>
                      <span className="text-text-muted">
                        · danger{" "}
                        <span className={dangerRowCls(e.dangerScore)}>
                          {e.dangerScore}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-text-primary group-hover:text-white">
                      {e.summary[locale] ?? e.summary.en}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[10px] text-text-muted">
                      <span>
                        {Math.abs(e.location.lat).toFixed(2)}°
                        {e.location.lat >= 0 ? "N" : "S"}{" "}
                        {Math.abs(e.location.lon).toFixed(2)}°
                        {e.location.lon >= 0 ? "E" : "W"}
                      </span>
                      <span>{timeAgo(e.occurredAt, locale)}</span>
                      <span>{e.verificationState}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── Anomaly Alerts ── */}
        <section aria-label="Anomaly alerts">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Anomaly Alerts
          </h2>
          <div className="space-y-3">
            {ANOMALIES.map((a) => (
              <div
                key={a.type}
                className={`rounded border p-4 ${anomalyBorderCls(a.severity)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${anomalyBadgeCls(a.severity)}`}
                    >
                      {anomalyTypeLabel(a.type)}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase ${a.severity === "high" ? "text-red-400" : "text-yellow-400"}`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted">
                    Detected {a.detected}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-primary">{a.message}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
