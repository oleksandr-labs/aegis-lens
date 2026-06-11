import Link from "next/link";
import { urls } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";
import { CLASS_COLOR, ALL_CLASSES } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

// ------------------------------------------------------------------ types

export type IncidentCardProps = {
  eventId: string;
  class: EventClass;
  summary: string;
  severity: number;
  confidence: number;
  dangerScore: number;
  verificationState: string;
  occurredAt: string;
  location: { lat: number; lon: number; name?: string };
  /** compact vs full display (default: false = full) */
  compact?: boolean;
  /** locale for URL building (default "en") */
  locale?: Locale;
};

// ------------------------------------------------------------------ helpers

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

function dangerBadgeCls(score: number): string {
  if (score >= 80) return "border-red-500/50 bg-red-500/10 text-red-300";
  if (score >= 60) return "border-orange-500/50 bg-orange-500/10 text-orange-300";
  return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
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

function formatCoords(lat: number, lon: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
}

function timeAgoSimple(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ------------------------------------------------------------------ compact view

function CompactCard(props: IncidentCardProps) {
  const color = CLASS_COLOR[props.class] ?? "#94a3b8";
  const href = urls.event(props.locale ?? "en", props.eventId);
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface px-3 py-2.5 hover:bg-bg-elevated"
    >
      {/* class dot */}
      <span
        className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-primary">{props.summary}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] text-text-muted">
          <span className={dangerBadgeCls(props.dangerScore)}>
            danger {props.dangerScore}
          </span>
          <span>conf {Math.round(props.confidence * 100)}%</span>
          <span>{timeAgoSimple(props.occurredAt)}</span>
          {props.location.name && <span>{props.location.name}</span>}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-accent">View →</span>
    </Link>
  );
}

// ------------------------------------------------------------------ full view

function FullCard(props: IncidentCardProps) {
  const color = CLASS_COLOR[props.class] ?? "#94a3b8";
  const href = urls.event(props.locale ?? "en", props.eventId);
  const label = CLASS_LABEL[props.class] ?? props.class;
  const badgeCls = dangerBadgeCls(props.dangerScore);

  return (
    <article className="rounded border border-border-subtle bg-bg-surface p-4 hover:bg-bg-elevated">
      {/* header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {label}
          </span>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded border border-accent/30 px-2 py-0.5 font-mono text-[10px] text-accent hover:bg-accent/10"
        >
          View →
        </Link>
      </div>

      {/* summary */}
      <p className="mt-2.5 text-sm text-text-primary">{props.summary}</p>

      {/* chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px]">
        <span
          className={`inline-flex items-center rounded border px-1.5 py-0.5 ${badgeCls}`}
        >
          danger {props.dangerScore}
        </span>
        <span className="rounded border border-border-subtle px-1.5 py-0.5 text-text-muted">
          severity {props.severity}/5
        </span>
        <span className="rounded border border-border-subtle px-1.5 py-0.5 text-text-muted">
          conf {Math.round(props.confidence * 100)}%
        </span>
        <span className={`rounded border border-border-subtle px-1.5 py-0.5 ${verificationCls(props.verificationState)}`}>
          {props.verificationState}
        </span>
      </div>

      {/* footer */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-muted">
        {props.location.name && <span>{props.location.name}</span>}
        <span>{formatCoords(props.location.lat, props.location.lon)}</span>
        <span>{timeAgoSimple(props.occurredAt)}</span>
        <span className="font-mono text-[9px] text-text-muted/60">{props.eventId}</span>
      </div>
    </article>
  );
}

// ------------------------------------------------------------------ export

export function IncidentCard(props: IncidentCardProps) {
  return props.compact ? <CompactCard {...props} /> : <FullCard {...props} />;
}
