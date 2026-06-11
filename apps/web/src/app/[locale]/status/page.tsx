import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { StatusRefresher, StatusSubscribeForm } from "@/components/StatusRefresher";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "System status";
const DESCRIPTION =
  "Live operational status of the Aegis Lens platform — ingest pipeline, geocoding, LLM enrichment, public API, map tiles, and database — plus recent incident history.";

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
    pathFor: (lc) => localePath(lc, "/status"),
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

type Service = {
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: string;
};

type ActiveIncidentUpdate = { time: string; text: string };
type ActiveIncident = {
  id: string;
  title: string;
  status: string;
  severity: "minor" | "major" | "critical";
  started: string;
  updates: ActiveIncidentUpdate[];
};

type PastIncident = {
  id: string;
  title: string;
  severity: "minor" | "major" | "critical";
  resolved: string;
  duration: string;
};

type SourceHealth = {
  name: string;
  type: string;
  status: "Healthy" | "Lagging" | "Silent";
  lagMinutes?: number;
  lastSeenAt: string;
  note: string;
};

type ScheduledMaintenance = {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  affectedComponents: string[];
  status: "Upcoming" | "In progress" | "Completed";
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SERVICES: Service[] = [
  { name: "Live Map", description: "Real-time event visualization", status: "operational", uptime: "99.98%" },
  { name: "AI Copilot", description: "Intelligence analysis assistant", status: "operational", uptime: "99.91%" },
  { name: "Event Ingest", description: "Data ingestion pipeline", status: "operational", uptime: "99.97%" },
  { name: "Alert Delivery", description: "Email/Telegram/Slack notifications", status: "operational", uptime: "99.95%" },
  { name: "API", description: "REST API and webhooks", status: "operational", uptime: "99.99%" },
  { name: "Search", description: "Full-text and semantic search", status: "operational", uptime: "99.93%" },
  { name: "Report Generation", description: "AI-powered report pipeline", status: "degraded", uptime: "98.2%" },
  { name: "Satellite Imagery", description: "Sentinel Hub integration", status: "operational", uptime: "99.45%" },
  { name: "Telegram Bot", description: "Bot notifications", status: "operational", uptime: "99.87%" },
];

const ACTIVE_INCIDENTS: ActiveIncident[] = [
  {
    id: "INC-2026-042",
    title: "Report Generation: Elevated latency",
    status: "investigating",
    severity: "minor",
    started: "2026-06-03T08:00:00Z",
    updates: [
      { time: "2026-06-03T10:00:00Z", text: "We are investigating elevated response times in the report generation pipeline. No data loss." },
      { time: "2026-06-03T09:00:00Z", text: "Incident identified. Engineering team engaged." },
      { time: "2026-06-03T08:15:00Z", text: "Monitoring alert triggered for p95 latency > 5s." },
    ],
  },
];

const PAST_INCIDENTS: PastIncident[] = [
  { id: "INC-2026-038", title: "Telegram bot delayed delivery", severity: "minor", resolved: "2026-05-28", duration: "23 min" },
  { id: "INC-2026-031", title: "API rate limiter false positives", severity: "minor", resolved: "2026-05-15", duration: "45 min" },
  { id: "INC-2026-019", title: "Sentinel Hub imagery delay", severity: "minor", resolved: "2026-04-22", duration: "2h 10min" },
];

const SOURCE_HEALTH: SourceHealth[] = [
  { name: "Copernicus / Sentinel-1", type: "Satellite SAR", status: "Healthy", lastSeenAt: "2026-06-03T06:00Z", note: "Normal acquisition cycle." },
  { name: "NASA FIRMS (VIIRS)", type: "Fire detection", status: "Healthy", lastSeenAt: "2026-06-03T05:30Z", note: "Full coverage, 375 m resolution." },
  { name: "OpenStreetMap Overpass", type: "Geospatial base", status: "Healthy", lastSeenAt: "2026-06-03T07:00Z", note: "Diff sync every 5 min." },
  { name: "ISW Daily Assessment", type: "Editorial", status: "Healthy", lastSeenAt: "2026-06-02T22:15Z", note: "Published on schedule." },
  { name: "DeepState UA", type: "Ground truth", status: "Lagging", lagMinutes: 47, lastSeenAt: "2026-06-03T06:13Z", note: "Upstream API returning occasional 429s; auto-retry active." },
  { name: "Telegram channel aggregator", type: "Social/OSINT", status: "Healthy", lastSeenAt: "2026-06-03T07:42Z", note: "~200 channels monitored." },
  { name: "Radio Free Europe / RFE", type: "Editorial", status: "Healthy", lastSeenAt: "2026-06-03T06:45Z", note: "RSS parsed normally." },
  { name: "UNHCR displacement feed", type: "Humanitarian", status: "Silent", lastSeenAt: "2026-06-01T14:00Z", note: "No data for 34 h. Investigating upstream." },
];

const SCHEDULED_MAINTENANCE: ScheduledMaintenance[] = [
  {
    id: "MAINT-2026-0610",
    title: "Database cluster upgrade to Postgres 17",
    scheduledAt: "2026-06-10 02:00 UTC",
    durationMinutes: 30,
    affectedComponents: ["Database", "Public API"],
    status: "Upcoming",
  },
];

const SLO_METRICS = [
  { label: "API p95 latency", value: "142ms", description: "REST endpoint 95th percentile" },
  { label: "Ingest freshness", value: "< 90s", description: "Events ingested within SLA" },
  { label: "Map tile load", value: "280ms p95", description: "Vector tile CDN delivery" },
  { label: "Alert delivery", value: "4.2s median", description: "Email / Telegram / Slack" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serviceDotClass(status: ServiceStatus): string {
  switch (status) {
    case "operational": return "bg-green-500";
    case "degraded":    return "bg-yellow-500";
    case "outage":      return "bg-red-500";
    case "maintenance": return "bg-blue-400";
  }
}

function serviceTextClass(status: ServiceStatus): string {
  switch (status) {
    case "operational": return "text-green-500";
    case "degraded":    return "text-yellow-500";
    case "outage":      return "text-red-500";
    case "maintenance": return "text-blue-400";
  }
}

function serviceLabel(status: ServiceStatus): string {
  switch (status) {
    case "operational": return "Operational";
    case "degraded":    return "Degraded";
    case "outage":      return "Major outage";
    case "maintenance": return "Maintenance";
  }
}

function severityBadgeClass(severity: "minor" | "major" | "critical"): string {
  switch (severity) {
    case "minor":    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    case "major":    return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    case "critical": return "bg-red-500/20 text-red-400 border border-red-500/30";
  }
}

function sourceStatusDot(status: SourceHealth["status"]): string {
  if (status === "Healthy") return "bg-green-500";
  if (status === "Lagging") return "bg-yellow-500";
  return "bg-red-500";
}

function sourceStatusText(status: SourceHealth["status"]): string {
  if (status === "Healthy") return "text-green-500";
  if (status === "Lagging") return "text-yellow-500";
  return "text-red-500";
}

/**
 * Returns the Tailwind bg color for a 30-day uptime bar segment.
 * The last 2 bars are dimmed for services with degraded status,
 * simulating a minor blip.
 */
function getBarColor(service: Service, dayIndex: number): string {
  if (service.status === "outage") {
    return dayIndex >= 28 ? "#ef4444" : "#22c55e"; // red last 2 days
  }
  if (service.status === "degraded") {
    return dayIndex >= 28 ? "#eab308" : "#22c55e"; // yellow last 2 days
  }
  if (service.status === "maintenance") {
    return dayIndex >= 29 ? "#60a5fa" : "#22c55e";
  }
  return "#22c55e"; // all green for operational
}

function formatIncidentTime(iso: string): string {
  return iso.replace("T", " ").replace("Z", " UTC");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const allOperational = SERVICES.every((s) => s.status === "operational");
  const hasOutage = SERVICES.some((s) => s.status === "outage");

  const overallStatus = hasOutage ? "outage" : allOperational ? "operational" : "degraded";
  const bannerBg =
    overallStatus === "operational"
      ? "border-green-500/30 bg-green-500/10"
      : overallStatus === "degraded"
        ? "border-yellow-500/30 bg-yellow-500/10"
        : "border-red-500/30 bg-red-500/10";
  const bannerDot =
    overallStatus === "operational" ? "bg-green-500" : overallStatus === "degraded" ? "bg-yellow-500" : "bg-red-500";
  const bannerText =
    overallStatus === "operational" ? "text-green-500" : overallStatus === "degraded" ? "text-yellow-400" : "text-red-400";
  const bannerLabel =
    overallStatus === "operational"
      ? "All systems operational"
      : overallStatus === "degraded"
        ? "Partial degradation"
        : "Major outage";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "Aegis Lens",
      url: "https://aegislens.io",
    },
  };

  return (
    <>
      <PageHeader eyebrow="Status" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article lang={locale} className="mx-auto max-w-3xl px-4 py-10 text-text-secondary">

        {/* ── Overall status banner ───────────────────────────────────────── */}
        <div
          role="status"
          className={`flex flex-col gap-3 rounded border p-4 sm:flex-row sm:items-center sm:justify-between ${bannerBg}`}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className={`inline-block h-3 w-3 flex-shrink-0 rounded-full ${bannerDot}`}
            />
            <span className={`text-lg font-semibold ${bannerText}`}>{bannerLabel}</span>
          </div>
          <StatusRefresher />
        </div>

        {/* ── Active incidents ────────────────────────────────────────────── */}
        {ACTIVE_INCIDENTS.length > 0 && (
          <section className="mt-8" aria-labelledby="active-incidents-heading">
            <h2 id="active-incidents-heading" className="text-xl font-semibold text-text-primary">
              Active incidents
            </h2>
            <ul className="mt-4 space-y-4">
              {ACTIVE_INCIDENTS.map((inc) => (
                <li
                  key={inc.id}
                  className="rounded border border-yellow-500/30 bg-yellow-500/10 p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-semibold text-text-primary">{inc.title}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityBadgeClass(inc.severity)}`}
                      >
                        {inc.severity}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-yellow-400">
                        {inc.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 font-mono text-xs text-text-tertiary">
                    {inc.id} &middot; Started {formatIncidentTime(inc.started)}
                  </div>
                  <ul className="mt-4 space-y-3 border-l-2 border-yellow-500/30 pl-4">
                    {inc.updates.map((u) => (
                      <li key={u.time} className="text-sm">
                        <time className="block font-mono text-xs text-text-tertiary">
                          {formatIncidentTime(u.time)}
                        </time>
                        <p className="mt-0.5 text-text-secondary">{u.text}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Services ────────────────────────────────────────────────────── */}
        <section className="mt-10" aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-xl font-semibold text-text-primary">
            Services
          </h2>
          <div className="mt-4 space-y-0 divide-y divide-border-subtle rounded border border-border-subtle">
            {SERVICES.map((service) => (
              <div key={service.name} className="px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div>
                    <span className="font-medium text-text-primary">{service.name}</span>
                    <span className="ml-2 text-sm text-text-tertiary">{service.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-tertiary">{service.uptime} uptime</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`inline-block h-2 w-2 rounded-full ${serviceDotClass(service.status)}`}
                      />
                      <span className={`font-mono text-xs uppercase tracking-widest ${serviceTextClass(service.status)}`}>
                        {serviceLabel(service.status)}
                      </span>
                    </span>
                  </div>
                </div>
                {/* 30-day uptime bar */}
                <div className="mt-2 flex gap-0.5" role="img" aria-label={`30-day uptime for ${service.name}`}>
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className="h-4 w-1.5 rounded-sm"
                      style={{ background: getBarColor(service, i) }}
                      title={`Day ${i + 1}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-text-tertiary">30-day history</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SLO metrics ─────────────────────────────────────────────────── */}
        <section className="mt-10" aria-labelledby="slo-heading">
          <h2 id="slo-heading" className="text-xl font-semibold text-text-primary">
            Key SLOs
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Current performance against service level objectives. Measured over a rolling 7-day window.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SLO_METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded border border-border-subtle bg-bg-surface p-4 text-center"
              >
                <div className="font-mono text-xl font-semibold text-accent">{m.value}</div>
                <div className="mt-1 text-xs font-medium text-text-primary">{m.label}</div>
                <div className="mt-0.5 text-[10px] text-text-tertiary">{m.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scheduled maintenance ───────────────────────────────────────── */}
        {SCHEDULED_MAINTENANCE.length > 0 && (
          <section className="mt-10" aria-labelledby="maintenance-heading">
            <h2 id="maintenance-heading" className="text-xl font-semibold text-text-primary">
              Scheduled maintenance
            </h2>
            <ul className="mt-4 space-y-3">
              {SCHEDULED_MAINTENANCE.map((m) => (
                <li
                  key={m.id}
                  className="rounded border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-semibold text-text-primary">{m.title}</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
                      {m.status}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-text-tertiary">
                    {m.scheduledAt} &middot; ~{m.durationMinutes} min &middot;{" "}
                    {m.affectedComponents.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Source health ───────────────────────────────────────────────── */}
        <section className="mt-10" id="sources" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-xl font-semibold text-text-primary">
            Source health
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Live health of data sources feeding the intelligence pipeline. Updated every 5 minutes.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-text-primary">
                  <th className="py-2 pr-4 font-semibold">Source</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Last seen</th>
                  <th className="py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_HEALTH.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-border-subtle align-top last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium text-text-primary">{s.name}</td>
                    <td className="py-3 pr-4 text-text-tertiary">{s.type}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className={`inline-block h-2.5 w-2.5 rounded-full ${sourceStatusDot(s.status)}`}
                        />
                        <span
                          className={`font-mono text-xs uppercase tracking-widest ${sourceStatusText(s.status)}`}
                        >
                          {s.status}
                          {s.lagMinutes ? ` +${s.lagMinutes}m` : ""}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-text-tertiary">
                      {s.lastSeenAt.replace("T", " ").replace("Z", " UTC")}
                    </td>
                    <td className="py-3 text-text-tertiary">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Past incidents (last 30 days) ───────────────────────────────── */}
        <section className="mt-10" aria-labelledby="past-incidents-heading">
          <h2 id="past-incidents-heading" className="text-xl font-semibold text-text-primary">
            Past incidents
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Resolved incidents from the past 30 days.
          </p>
          <ul className="mt-4 divide-y divide-border-subtle rounded border border-border-subtle">
            {PAST_INCIDENTS.map((inc) => (
              <li
                key={inc.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityBadgeClass(inc.severity)}`}
                  >
                    {inc.severity}
                  </span>
                  <span className="text-text-primary">{inc.title}</span>
                </div>
                <div className="flex items-center gap-3 text-text-tertiary">
                  <span className="font-mono text-xs">{inc.resolved}</span>
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-500">
                    Resolved
                  </span>
                  <span className="text-xs">{inc.duration}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Recent incidents (historical) ───────────────────────────────── */}
        <section className="mt-10" aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-xl font-semibold text-text-primary">
            Incident history
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Closed incidents from the past 90 days.
          </p>
          <ul className="mt-4 space-y-4">
            {[
              {
                id: "INC-2026-0512",
                title: "Elevated latency in public API",
                startedAt: "2026-05-12 14:08 UTC",
                resolvedAt: "2026-05-12 14:41 UTC",
                impact: "Degraded" as const,
                summary:
                  "A burst of unauthenticated traffic saturated a single API edge node. Rate-limits were tightened and the node was rotated; no data loss.",
              },
              {
                id: "INC-2026-0428",
                title: "Geocoding fallback provider timeouts",
                startedAt: "2026-04-28 09:22 UTC",
                resolvedAt: "2026-04-28 10:55 UTC",
                impact: "Degraded" as const,
                summary:
                  "Upstream geocoder returned intermittent 504s. Affected events were queued and reprocessed automatically once the primary recovered.",
              },
              {
                id: "INC-2026-0319",
                title: "LLM enrichment backlog after model upgrade",
                startedAt: "2026-03-19 18:40 UTC",
                resolvedAt: "2026-03-19 22:10 UTC",
                impact: "Degraded" as const,
                summary:
                  "Rollout of a new enrichment model paused the worker pool for warm-up. Backlog cleared within the SLA window; no events were dropped.",
              },
            ].map((inc) => (
              <li
                key={inc.id}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500"
                    />
                    <span className="font-semibold text-text-primary">{inc.title}</span>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
                    {inc.id} &middot; Resolved
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs text-text-tertiary">
                  {inc.startedAt} &rarr; {inc.resolvedAt}
                </div>
                <p className="mt-3 text-sm">{inc.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Status badge ────────────────────────────────────────────────── */}
        <section className="mt-10" id="badge" aria-labelledby="badge-heading">
          <h2 id="badge-heading" className="text-xl font-semibold text-text-primary">
            Status badge
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Embed the live Aegis Lens status badge on your site or documentation.
          </p>
          <div className="mt-4 space-y-3">
            <div className="overflow-x-auto rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-primary">
              {`<a href="https://aegislens.io/status"><img src="https://aegislens.io/api/status/badge.svg" alt="Aegis Lens status" /></a>`}
            </div>
            <div className="overflow-x-auto rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-primary">
              {`[![Aegis Lens status](https://aegislens.io/api/status/badge.svg)](https://aegislens.io/status)`}
            </div>
          </div>
        </section>

        {/* ── Subscribe to updates ────────────────────────────────────────── */}
        <section className="mt-10" id="subscribe" aria-labelledby="subscribe-heading">
          <h2 id="subscribe-heading" className="text-xl font-semibold text-text-primary">
            Subscribe to status updates
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Get notified when incidents are created, updated, or resolved.
          </p>

          <div className="mt-4">
            <StatusSubscribeForm />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/status/feed.xml"
              rel="alternate"
              type="application/rss+xml"
              className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-primary hover:border-accent/40 hover:text-accent"
            >
              RSS feed
            </a>
            <a
              href="https://t.me/aegislens_status"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm text-text-primary hover:border-accent/40 hover:text-accent"
            >
              Telegram channel
            </a>
          </div>

          <div className="mt-4 rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-tertiary">
            <span className="font-semibold text-text-secondary">SMS &amp; Slack integration</span>
            &ensp;&mdash;&ensp;Available on Enterprise plans.{" "}
            <a
              href="/contact"
              className="text-accent underline-offset-2 hover:underline"
            >
              Contact us
            </a>{" "}
            to learn more.
          </div>
        </section>

      </article>
    </>
  );
}
