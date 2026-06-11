import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SourceStatus = "ok" | "degraded" | "down";

type Source = {
  name: string;
  status: SourceStatus;
  lastSeen: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const SOURCES: Source[] = [
  { name: "alerts.in.ua", status: "ok",       lastSeen: "2 min ago" },
  { name: "UA GenStaff",  status: "ok",       lastSeen: "1h ago"    },
  { name: "ISW",          status: "ok",       lastSeen: "6h ago"    },
  { name: "NASA FIRMS",   status: "degraded", lastSeen: "3h ago"    },
  { name: "OpenSky",      status: "ok",       lastSeen: "5 min ago" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<SourceStatus, string> = {
  ok:       "bg-green-500",
  degraded: "bg-yellow-500",
  down:     "bg-red-500",
};

const STATUS_LABEL: Record<SourceStatus, string> = {
  ok:       "Operational",
  degraded: "Degraded",
  down:     "Down",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SourceHealthWidget() {
  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-y divide-border-subtle">
        {SOURCES.map((src) => (
          <li key={src.name} className="flex items-center gap-2 py-2">
            {/* Status dot */}
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[src.status]}`}
              title={STATUS_LABEL[src.status]}
              aria-label={STATUS_LABEL[src.status]}
            />

            {/* Name */}
            <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
              {src.name}
            </span>

            {/* Last seen */}
            <span className="shrink-0 font-mono text-[10px] text-text-muted">
              {src.lastSeen}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="border-t border-border-subtle pt-2">
        <Link href="/sources" className="text-xs text-accent hover:underline">
          View all →
        </Link>
      </div>
    </div>
  );
}
