"use client";

import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnomalyType = "volume_spike" | "new_source" | "cluster";
type Severity = "high" | "medium" | "low";

type Anomaly = {
  id: string;
  type: AnomalyType;
  message: string;
  region?: string;
  severity: Severity;
  time: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const ANOMALIES: Anomaly[] = [
  {
    id: "a1",
    type: "volume_spike",
    message: "Military events: +340% vs baseline",
    region: "Kharkiv",
    severity: "high",
    time: "2h ago",
  },
  {
    id: "a2",
    type: "new_source",
    message: "New source under assessment",
    severity: "medium",
    time: "4h ago",
  },
  {
    id: "a3",
    type: "cluster",
    message: "Drone cluster detected NE Kharkiv",
    region: "Kharkiv",
    severity: "high",
    time: "6h ago",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<AnomalyType, string> = {
  volume_spike: "Spike",
  new_source:   "Source",
  cluster:      "Cluster",
};

const SEVERITY_BORDER: Record<Severity, string> = {
  high:   "border-l-red-500",
  medium: "border-l-yellow-500",
  low:    "border-l-green-500",
};

const SEVERITY_BADGE: Record<Severity, string> = {
  high:   "bg-red-900/40 text-red-400",
  medium: "bg-yellow-900/40 text-yellow-400",
  low:    "bg-green-900/40 text-green-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AnomalyWidget() {
  if (ANOMALIES.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-text-muted">No anomalies detected</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {ANOMALIES.map((a) => (
        <li
          key={a.id}
          className={`flex items-start gap-3 rounded border-l-2 bg-bg-base py-2 pl-3 pr-2 ${SEVERITY_BORDER[a.severity]}`}
        >
          {/* Type badge */}
          <span
            className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${SEVERITY_BADGE[a.severity]}`}
          >
            {TYPE_LABEL[a.type]}
          </span>

          {/* Message */}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-secondary">{a.message}</p>
            {a.region && (
              <p className="mt-0.5 text-[10px] text-text-muted">{a.region}</p>
            )}
          </div>

          {/* Right: time + link */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-mono text-[10px] text-text-muted">{a.time}</span>
            <Link
              href="/map"
              className="text-[10px] text-accent hover:underline"
            >
              View →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
