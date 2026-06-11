export const dynamic = "force-dynamic";

const USAGE = {
  plan: "Analyst",
  cycleStart: "2026-06-01",
  cycleEnd: "2026-06-30",
  copilotQueries: { used: 47, limit: 100 },
  apiRequests: { used: 14879, limit: 50000 },
  exportJobs: { used: 3, limit: 10 },
  aoiMonitors: { used: 1, limit: 3 },
  alertRules: { used: 2, limit: 5 },
};

const ENDPOINTS = [
  { path: "GET /api/events", count: 8420, pct: 56.6, latency: 142 },
  { path: "POST /api/copilot", count: 47, pct: 0.3, latency: 2840 },
  { path: "GET /api/search/suggest", count: 4312, pct: 29.0, latency: 38 },
  { path: "GET /api/layers", count: 2100, pct: 14.1, latency: 18 },
];

// 30 days of synthetic API request data
const DAILY_REQUESTS = [
  210, 340, 290, 520, 480, 310, 150, 620, 710, 540, 430, 390, 280, 170,
  760, 830, 690, 510, 440, 320, 270, 890, 950, 820, 640, 580, 720, 660,
  740, 490,
];

type Metric = { label: string; used: number; limit: number };

function barColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-400";
  return "bg-accent";
}

function UsageBar({ label, used, limit }: Metric) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-primary">{label}</span>
        <span className="font-mono text-xs text-text-muted">
          {used.toLocaleString()} / {limit.toLocaleString()}
          <span className="ml-2 text-text-secondary">{pct}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-base">
        <div
          className={`h-full rounded-full ${barColor(pct)}`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function DailyBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const chartH = 80;

  return (
    <figure
      className="overflow-hidden rounded border border-border-subtle bg-bg-surface p-4"
      aria-label="30-day API request history"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <figcaption className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          API requests · last 30 days
        </figcaption>
        <span className="font-mono text-[10px] text-text-muted">
          peak {Math.max(...data).toLocaleString()}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${data.length * 10} ${chartH}`}
        width="100%"
        height={chartH}
        role="img"
        preserveAspectRatio="none"
        aria-label="30-day bar chart"
      >
        {data.map((v, i) => {
          const h = Math.max(1, (v / max) * (chartH - 4));
          return (
            <rect
              key={i}
              x={i * 10 + 1}
              y={chartH - h}
              width={8}
              height={h}
              fill="currentColor"
              className="text-accent"
              opacity={0.8}
              rx={1}
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-text-muted">
        <span>Jun 1</span>
        <span>Jun 15</span>
        <span>Jun 30</span>
      </div>
    </figure>
  );
}

export default function UsagePage() {
  const metrics: Metric[] = [
    { label: "API requests", ...USAGE.apiRequests },
    { label: "Copilot queries", ...USAGE.copilotQueries },
    { label: "Export jobs", ...USAGE.exportJobs },
    { label: "AOI monitors", ...USAGE.aoiMonitors },
    { label: "Alert rules", ...USAGE.alertRules },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-text-primary">Usage</h1>
      <p className="mt-1 text-sm text-text-muted">
        Metering for the current billing cycle. Resets on cycle end.
      </p>

      {/* Current billing cycle */}
      <section className="mt-6 rounded border border-border-default bg-bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Current cycle
            </div>
            <div className="mt-0.5 text-sm text-text-secondary">
              {USAGE.cycleStart} → {USAGE.cycleEnd}
            </div>
          </div>
          <span className="rounded bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            {USAGE.plan}
          </span>
        </div>
        <div className="space-y-4">
          {metrics.map((m) => (
            <UsageBar key={m.label} {...m} />
          ))}
        </div>
      </section>

      {/* 30-day chart */}
      <section className="mt-6">
        <DailyBarChart data={DAILY_REQUESTS} />
      </section>

      {/* Endpoint breakdown */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-text-primary">Request breakdown by endpoint</h2>
        <div className="mt-3 overflow-hidden rounded border border-border-subtle bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
                <th className="px-3 py-2.5">Endpoint</th>
                <th className="px-3 py-2.5 text-right">Count</th>
                <th className="px-3 py-2.5 text-right">Share</th>
                <th className="px-3 py-2.5 text-right">Avg latency</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.path} className="border-t border-border-subtle hover:bg-bg-elevated/50">
                  <td className="px-3 py-2.5 font-mono text-xs text-text-primary">{e.path}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-secondary">
                    {e.count.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs text-text-secondary">{e.pct}%</span>
                      <span
                        className="inline-block h-1.5 rounded-full bg-accent/70"
                        style={{ width: `${Math.round(e.pct * 0.6)}px` }}
                        aria-hidden="true"
                      />
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-text-secondary">
                    {e.latency >= 1000
                      ? `${(e.latency / 1000).toFixed(1)} s`
                      : `${e.latency} ms`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="mt-8 rounded border border-border-default bg-bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Upgrade to Team for unlimited API requests
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Remove request caps, unlock team seats, shared case files, and priority support.
            </p>
          </div>
          <a
            href="/pricing"
            className="shrink-0 rounded bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent/90"
          >
            View plans
          </a>
        </div>
      </section>
    </div>
  );
}
