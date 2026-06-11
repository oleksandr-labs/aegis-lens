"use client";

// TODO: real auth — replace with session token check
const isAdmin = true;

import { useState } from "react";

const ADMIN_KPIS = [
  { label: "Total users", value: "2,413", delta: "+47 today" },
  { label: "Active sessions", value: "183" },
  { label: "Events in queue", value: "12", badge: "review" },
  { label: "API calls today", value: "847K" },
  { label: "Error rate", value: "0.03%", ok: true },
];

const QUICK_ACTIONS = [
  { label: "Review queue", href: "/admin/queue", desc: "Triage low-confidence events" },
  { label: "User management", href: "/admin/users", desc: "Manage accounts & orgs" },
  { label: "Source health", href: "/admin/sources", desc: "Curated source registry" },
  { label: "Feature flags", href: "/admin/flags", desc: "Toggle features & rollouts" },
  { label: "DLQ (ingest errors)", href: "/admin/queue?filter=dlq", desc: "Dead-letter queue recovery" },
  { label: "Internal dashboard", href: "#", desc: "Grafana / metrics link" },
];

const HEALTH = [
  { service: "API Gateway", status: "ok", latency: "142ms", uptime: "99.99%" },
  { service: "Ingest Service", status: "ok", latency: "—", uptime: "99.97%" },
  { service: "NLP Service", status: "ok", latency: "340ms", uptime: "99.91%" },
  { service: "Tile Service", status: "ok", latency: "89ms", uptime: "99.95%" },
  { service: "Alert Service", status: "ok", latency: "—", uptime: "99.98%" },
  { service: "Report Service", status: "degraded", latency: "4.2s", uptime: "98.20%" },
];

const AUDIT_LOG = [
  { action: "User suspended", target: "user@example.com", by: "admin", time: "10 min ago" },
  { action: "Feature flag enabled", target: "ai_copilot_v2", by: "admin", time: "2h ago" },
  { action: "Source tier updated", target: "UkraineNow_X → Tier 3", by: "admin", time: "Yesterday" },
];

export default function AdminHome() {
  const [now] = useState(() => new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="rounded border border-border-subtle bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">Access denied.</p>
          <a href="/" className="mt-4 block text-xs text-accent">← Back to app</a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Aegis Lens</span>
          <h1 className="text-xl font-semibold text-text-primary">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-muted">Oleksandr · Admin</span>
          <a
            href="/"
            className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface"
          >
            ← Back to app
          </a>
        </div>
      </div>

      {/* Timestamp ticker */}
      <div className="mb-6 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        System time: {now}
      </div>

      {/* KPI row */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {ADMIN_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded border border-border-subtle bg-bg-surface p-3 relative overflow-hidden"
          >
            {kpi.badge && (
              <span className="absolute top-2 right-2 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400">
                {kpi.badge}
              </span>
            )}
            <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{kpi.label}</div>
            <div className={`mt-1 text-2xl font-semibold ${kpi.ok ? "text-emerald-400" : "text-text-primary"}`}>
              {kpi.value}
            </div>
            {kpi.delta && (
              <div className="mt-1 font-mono text-[10px] text-emerald-400">{kpi.delta}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Quick actions
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group rounded border border-border-subtle bg-bg-surface p-3 transition hover:border-accent hover:bg-bg-elevated"
            >
              <div className="text-sm font-semibold text-text-primary group-hover:text-accent">
                {action.label} →
              </div>
              <div className="mt-1 text-xs text-text-muted">{action.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System health table */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            System health
          </div>
          <div className="overflow-hidden rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle bg-bg-elevated">
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  <th className="px-4 py-2">Service</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Latency</th>
                  <th className="px-4 py-2 text-right">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {HEALTH.map((row) => (
                  <tr key={row.service} className="border-t border-border-subtle">
                    <td className="px-4 py-2.5 text-text-primary text-xs">{row.service}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            row.status === "ok" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                          }`}
                        />
                        <span
                          className={`font-mono text-[10px] uppercase ${
                            row.status === "ok" ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {row.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-text-secondary">
                      {row.latency}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-text-secondary">
                      {row.uptime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent audit log */}
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Recent admin actions
          </div>
          <div className="overflow-hidden rounded border border-border-subtle bg-bg-surface">
            <ul>
              {AUDIT_LOG.map((entry, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 border-b border-border-subtle px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">{entry.action}</span>
                    <span className="font-mono text-[10px] text-text-muted">{entry.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-accent">{entry.target}</span>
                    <span className="font-mono text-[10px] text-text-muted">by {entry.by}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border-subtle px-4 py-2">
              <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                View full audit log →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
