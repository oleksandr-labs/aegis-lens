import Link from "next/link";

export const dynamic = "force-dynamic";

const STATS = [
  { label: "API requests this month", value: "14,879" },
  { label: "Copilot queries", value: "47" },
  { label: "Active alerts", value: "2" },
  { label: "Case files", value: "3" },
];

type ActivityItem = {
  type: "api_request" | "copilot" | "alert" | "export" | "login";
  label: string;
  time: string;
};

const ACTIVITY: ActivityItem[] = [
  { type: "api_request", label: "API request to /events", time: "2 min ago" },
  { type: "copilot", label: "Copilot: Summarize Kharkiv last 6h", time: "1h ago" },
  { type: "alert", label: "Alert triggered: Military UA (Kharkiv)", time: "3h ago" },
  { type: "export", label: "Exported events as GeoJSON", time: "Yesterday" },
  { type: "login", label: "Sign-in from Ukraine (Chrome)", time: "2026-06-02" },
];

const ACTIVITY_ICONS: Record<ActivityItem["type"], string> = {
  api_request: "⚡",
  copilot: "🤖",
  alert: "🔔",
  export: "📦",
  login: "🔑",
};

const QUICK_LINKS = [
  { label: "Settings", href: "/account/settings" },
  { label: "API Keys", href: "/account/api-keys" },
  { label: "Usage", href: "/account/usage" },
  { label: "Alerts", href: "/alerts" },
  { label: "Cases", href: "/cases" },
];

export default async function AccountHome() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Welcome card */}
      <section className="rounded border border-border-default bg-bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Hello, Oleksandr</h1>
            <p className="mt-1 text-sm text-text-muted">Member since May 2026</p>
          </div>
          <span className="rounded bg-accent/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Analyst
          </span>
        </div>
      </section>

      {/* Quick stats */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3">
          This month
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded border border-border-subtle bg-bg-surface p-3"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted leading-snug">
                {s.label}
              </div>
              <div className="mt-2 text-xl font-semibold text-text-primary">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Recent activity</h2>
        <ul className="divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
          {ACTIVITY.map((item, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <span
                className="shrink-0 text-lg leading-none"
                aria-hidden="true"
              >
                {ACTIVITY_ICONS[item.type]}
              </span>
              <span className="flex-1 text-sm text-text-primary">{item.label}</span>
              <span className="shrink-0 font-mono text-[11px] text-text-muted whitespace-nowrap">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
