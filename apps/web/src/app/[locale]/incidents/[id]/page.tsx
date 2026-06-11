import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { eventsInCountry, listEvents } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { formatDateTime, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/site";

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
  const ev = listEvents().find((e) => e.eventId === id);
  if (!ev) return { robots: { index: false } };
  const title = ev.summary[locale] ?? ev.summary.en;
  return buildMetadata({
    locale,
    title: `Incident: ${title}`,
    description: `${ev.class} · severity ${ev.severity}/5 · confidence ${Math.round(ev.confidence * 100)}% · ${formatDateTime(ev.occurredAt, locale)}`,
    pathFor: (lc) => localePath(lc, `/incidents/${id}`),
    noindex: ev.verificationState === "retracted",
  });
}

// ------------------------------------------------------------------ helpers

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

function dangerBandCls(score: number): string {
  if (score >= 80) return "bg-red-500/20 border-red-500/50";
  if (score >= 60) return "bg-orange-500/15 border-orange-500/40";
  return "bg-yellow-500/10 border-yellow-500/30";
}

function dangerTextCls(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  return "text-yellow-300";
}

function confidenceCls(conf: number): string {
  if (conf >= 0.8) return "text-green-400";
  if (conf >= 0.5) return "text-yellow-400";
  return "text-red-400";
}

function verificationCls(state: string): string {
  switch (state) {
    case "corroborated": return "text-green-400";
    case "verified":     return "text-blue-400";
    case "disputed":     return "text-yellow-400";
    case "retracted":    return "text-red-400";
    default:             return "text-text-muted";
  }
}

function severityLabel(s: number): string {
  return ["None", "Low", "Moderate", "High", "Critical", "Extreme"][s] ?? String(s);
}

// AI class summaries (hardcoded placeholders)
const CLASS_AI_SUMMARY: Record<string, string> = {
  military_action:
    "This event belongs to the military action category, which encompasses kinetic engagements including missile strikes, artillery exchanges, drone operations, and ground force movements. Events in this category are prioritized for rapid verification due to their immediate humanitarian impact. Geospatial clustering analysis is applied to detect coordinated offensive patterns.",
  infrastructure:
    "Infrastructure events cover damage or disruption to critical systems including energy grids, water supply, transportation networks, and communications. These events are tracked with particular attention to cascading failure risks and civilian exposure.",
  civilian_alert:
    "Civilian alert events include officially issued air raid warnings, evacuation orders, and shelter-in-place directives. They are cross-referenced against active missile and drone trajectories where data is available.",
  humanitarian:
    "Humanitarian events document displacement, border crossing volumes, and access constraints affecting civilian populations. These events feed into risk scoring for NGO partners operating in affected areas.",
  cyber:
    "Cyber events track digital attacks against government, financial, critical infrastructure, and military targets. Attribution data is handled with higher uncertainty thresholds and clearly labeled when speculative.",
  maritime:
    "Maritime events include vessel movements, naval incidents, and restrictions in the Black Sea and Sea of Azov zones. AIS data gaps are noted as a confidence-limiting factor.",
  aviation:
    "Aviation events encompass airspace restrictions, drone activity, and fixed-wing aircraft incidents. NOTAM cross-referencing is applied where available.",
  environmental:
    "Environmental events include fires, floods, and industrial pollution incidents that may result from or compound conflict-related damage.",
  political:
    "Political events track diplomatic meetings, sanctions, and policy decisions with material implications for the monitored regions.",
  economic:
    "Economic events cover supply chain disruptions, sanctions enforcement, and financial system stress indicators relevant to the conflict context.",
};

// ------------------------------------------------------------------ hardcoded timeline steps (generic per-class)
function getTimelineSteps(occurredAt: string, cls: string): { label: string; time: string; note: string }[] {
  const t = new Date(occurredAt);
  const t1 = new Date(t.getTime() - 25 * 60 * 1000).toISOString();
  const t2 = new Date(t.getTime() + 12 * 60 * 1000).toISOString();
  return [
    {
      label: "First report ingested",
      time: t1,
      note: "Initial signal detected from primary source. Automated deduplication check passed.",
    },
    {
      label: "Event created",
      time: occurredAt,
      note: `${CLASS_LABEL[cls] ?? cls} event classified and scored. Verification state set to initial value.`,
    },
    {
      label: "Corroboration check",
      time: t2,
      note: "Cross-referenced against secondary source pool. Confidence score updated accordingly.",
    },
  ];
}

// ------------------------------------------------------------------ placeholder sources

const PLACEHOLDER_SOURCES = [
  {
    id: "src-01",
    name: "Primary OSINT Source",
    url: "https://example.com/synthetic-source-1",
    type: "telegram_channel",
    reliability: "medium",
    language: "uk",
  },
  {
    id: "src-02",
    name: "Corroborating Feed",
    url: "https://example.com/synthetic-source-2",
    type: "news_wire",
    reliability: "high",
    language: "en",
  },
];

// ------------------------------------------------------------------ page

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  // Find event — treat eventId as incident ID
  const ev = listEvents().find((e) => e.eventId === id);

  // Not found
  if (!ev) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-text-muted">404</div>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">Incident not found</h1>
        <p className="mt-3 text-text-secondary">
          No incident with ID <code className="font-mono text-accent">{id}</code> exists in
          the current dataset.
        </p>
        <Link
          href={localePath(locale, "/incidents")}
          className="mt-6 inline-flex items-center gap-1.5 rounded border border-accent/30 px-4 py-2 font-mono text-sm text-accent hover:bg-accent/10"
        >
          ← Back to Incidents
        </Link>
      </div>
    );
  }

  const color = CLASS_COLOR[ev.class] ?? "#94a3b8";
  const label = CLASS_LABEL[ev.class] ?? ev.class;
  const summary = ev.summary[locale] ?? ev.summary.en;
  const mapHref = `https://www.openstreetmap.org/?mlat=${ev.location.lat}&mlon=${ev.location.lon}&zoom=11`;

  const steps = getTimelineSteps(ev.occurredAt, ev.class);

  // Related: same class, different event
  const related = eventsInCountry("ua")
    .filter((e) => e.class === ev.class && e.eventId !== ev.eventId)
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 3);

  const aiSummary = CLASS_AI_SUMMARY[ev.class] ?? CLASS_AI_SUMMARY.military_action;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">

      {/* ── Class header bar ── */}
      <div
        className={`rounded border p-4 ${dangerBandCls(ev.dangerScore)}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: color }}
          />
          <span className="font-mono text-sm uppercase tracking-widest" style={{ color }}>
            {label}
          </span>
          {ev.subclass && (
            <span className="font-mono text-xs text-text-muted">· {ev.subclass}</span>
          )}
          <span className={`ml-auto font-mono text-xl font-semibold ${dangerTextCls(ev.dangerScore)}`}>
            Danger {ev.dangerScore}
          </span>
        </div>
      </div>

      {/* ── Title + meta ── */}
      <section>
        <nav className="mb-3 font-mono text-[11px] text-text-muted">
          <Link href={localePath(locale, "/incidents")} className="hover:text-accent">
            Incidents
          </Link>
          {" / "}
          <span>{id}</span>
        </nav>

        <h1 className="text-2xl font-semibold leading-snug text-text-primary">{summary}</h1>

        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
          <span className="rounded border border-border-subtle px-2 py-0.5 text-text-muted">
            Severity:{" "}
            <span className="text-text-primary">
              {severityLabel(ev.severity)} ({ev.severity}/5)
            </span>
          </span>
          <span className="rounded border border-border-subtle px-2 py-0.5 text-text-muted">
            Confidence:{" "}
            <span className={confidenceCls(ev.confidence)}>
              {Math.round(ev.confidence * 100)}%
            </span>
          </span>
          <span className="rounded border border-border-subtle px-2 py-0.5 text-text-muted">
            Verification:{" "}
            <span className={verificationCls(ev.verificationState)}>
              {ev.verificationState}
            </span>
          </span>
          <span className="rounded border border-border-subtle px-2 py-0.5 text-text-muted">
            Occurred: <span className="text-text-primary">{formatDateTime(ev.occurredAt, locale)}</span>
          </span>
        </div>

        <div className="mt-2 font-mono text-[10px] text-text-muted">
          ID: {ev.eventId}
        </div>
      </section>

      {/* ── Location ── */}
      <section aria-label="Location">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Location
        </h2>
        <div className="rounded border border-border-subtle bg-bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 font-mono text-sm">
              <div>
                <span className="text-text-muted">Lat:</span>{" "}
                <span className="text-text-primary">{ev.location.lat.toFixed(5)}°</span>
              </div>
              <div>
                <span className="text-text-muted">Lon:</span>{" "}
                <span className="text-text-primary">{ev.location.lon.toFixed(5)}°</span>
              </div>
              {ev.location.precisionM && (
                <div className="text-[10px] text-text-muted">
                  Precision: ±{ev.location.precisionM.toLocaleString()}m
                </div>
              )}
            </div>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-accent/30 px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent/10"
            >
              View on map →
            </a>
          </div>
        </div>
      </section>

      {/* ── Incident Timeline ── */}
      <section aria-label="Incident timeline">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Incident Timeline
        </h2>
        <ol className="relative space-y-0 border-l border-border-subtle pl-6">
          {steps.map((step, idx) => (
            <li key={idx} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-[9px] top-1.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-bg-base"
                style={{ background: color }}
              />
              <div className="rounded border border-border-subtle bg-bg-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-text-primary">
                    {step.label}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {formatDateTime(step.time, locale)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Sources ── */}
      <section aria-label="Sources">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Sources
        </h2>
        <div className="space-y-2">
          {PLACEHOLDER_SOURCES.map((src) => (
            <div
              key={src.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">{src.name}</div>
                <div className="mt-0.5 flex flex-wrap gap-2 font-mono text-[10px] text-text-muted">
                  <span>{src.type}</span>
                  <span>·</span>
                  <span>{src.language.toUpperCase()}</span>
                  <span>·</span>
                  <span
                    className={
                      src.reliability === "high"
                        ? "text-green-400"
                        : src.reliability === "medium"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }
                  >
                    {src.reliability} reliability
                  </span>
                </div>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-border-subtle px-2 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
              >
                Visit →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Summary ── */}
      <section aria-label="AI-generated summary">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          AI Context Summary
        </h2>
        <div className="rounded border border-accent/20 bg-accent/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded border border-accent/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
              AI-generated · Not verified
            </span>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{aiSummary}</p>
        </div>
      </section>

      {/* ── Related Incidents ── */}
      {related.length > 0 && (
        <section aria-label="Related incidents">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Related Incidents — Same Class
          </h2>
          <div className="space-y-2">
            {related.map((rel) => (
              <Link
                key={rel.eventId}
                href={localePath(locale, `/incidents/${rel.eventId}`)}
                className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
              >
                <span
                  className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">
                    {rel.summary[locale] ?? rel.summary.en}
                  </p>
                  <div className="mt-0.5 flex gap-2 font-mono text-[10px] text-text-muted">
                    <span>danger {rel.dangerScore}</span>
                    <span>·</span>
                    <span>{timeAgo(rel.occurredAt, locale)}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-accent">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Actions ── */}
      <section className="flex flex-wrap gap-3 border-t border-border-subtle pt-6">
        <Link
          href={urls.event(locale, ev.eventId)}
          className="rounded border border-border-subtle px-4 py-2 font-mono text-sm text-text-muted hover:text-text-primary"
        >
          View full event →
        </Link>
        <Link
          href={localePath(locale, "/investigations")}
          className="rounded border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent hover:bg-accent/20"
        >
          + Add to investigation
        </Link>
        <Link
          href={localePath(locale, "/incidents")}
          className="rounded border border-border-subtle px-4 py-2 font-mono text-sm text-text-muted hover:text-text-primary"
        >
          ← All incidents
        </Link>
      </section>

    </div>
  );
}
