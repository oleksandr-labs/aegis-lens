"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { DraggableGrid, type DashboardWidgetSlots } from "@/components/Dashboard/DraggableGrid";
import { DashboardCopilot } from "./_components/DashboardCopilot";
import { CLASS_COLOR, ALL_CLASSES } from "@/lib/filter-config";
import type { AegisEvent, EventClass } from "@aegis/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClassBreakdownItem = {
  id: EventClass;
  label: string;
  count: number;
  pct: number;
  color: string;
};

type AlertRule = {
  id: number;
  name: string;
  cls: EventClass;
  active: boolean;
};

type Props = {
  events: AegisEvent[];
  recentEvents: AegisEvent[];
  classBreakdown: ClassBreakdownItem[];
  totalEvents: number;
  avgDanger: number;
  topClass: string;
  topClassCount: number;
  alertRules: AlertRule[];
  locale: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHoursAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return "< 1h ago";
  if (hoursAgo === 1) return "1h ago";
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  return `${Math.round(hoursAgo / 24)}d ago`;
}

function confidenceLabel(c: number): string {
  if (c >= 0.85) return "HIGH";
  if (c >= 0.65) return "MED";
  return "LOW";
}

function confidenceClass(c: number): string {
  if (c >= 0.85) return "bg-green-900/40 text-green-400";
  if (c >= 0.65) return "bg-yellow-900/40 text-yellow-400";
  return "bg-red-900/40 text-red-400";
}

function dangerColor(d: number): string {
  if (d >= 70) return "text-red-400";
  if (d >= 45) return "text-yellow-400";
  return "text-green-400";
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-border-subtle bg-bg-elevated p-4">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-mono text-text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-text-muted">{sub}</p>}
    </div>
  );
}

// ─── Dashboard Client ─────────────────────────────────────────────────────────

export function DashboardClient({
  events,
  recentEvents,
  classBreakdown,
  totalEvents,
  avgDanger,
  topClass,
  topClassCount,
  alertRules,
  locale,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [alertRulesState, setAlertRulesState] = useState(alertRules);

  // Copy dashboard URL to clipboard
  const shareUrl = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).catch(() => {
      // fallback: do nothing
    });
  }, []);

  // Toggle alert rule active state
  const toggleRule = (id: number) => {
    setAlertRulesState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  // ── Build widget slot content ──────────────────────────────────────────────

  const kpiSlot = (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard label="Events (24h)" value={String(totalEvents)} sub="seed data" />
      <KpiCard label="Avg Danger" value={String(avgDanger)} sub="0–100 scale" />
      <KpiCard label="Top Class" value={topClass} sub={`${topClassCount} events`} />
      <KpiCard label="Active Sources" value="6" sub="verified feeds" />
    </div>
  );

  const eventsSlot = (
    <ul className="max-h-[380px] divide-y divide-border-subtle overflow-y-auto">
      {recentEvents.map((ev) => {
        const color = CLASS_COLOR[ev.class] ?? "#94a3b8";
        const summary = ev.summary.en ?? "No summary";
        const hoursAgo = Math.round((Date.now() - Date.parse(ev.occurredAt)) / 3_600_000);
        return (
          <li key={ev.eventId} className="flex items-start gap-3 py-3">
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-text-secondary">{summary}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${confidenceClass(ev.confidence)}`}>
                  {confidenceLabel(ev.confidence)}
                </span>
                <span className={`font-mono text-[10px] ${dangerColor(ev.dangerScore)}`}>
                  ⚡ {ev.dangerScore}
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  {formatHoursAgo(hoursAgo)}
                </span>
              </div>
            </div>
            <Link
              href={`/${locale}/events/${ev.eventId}`}
              className="shrink-0 text-[10px] text-accent hover:underline"
            >
              View →
            </Link>
          </li>
        );
      })}
      {recentEvents.length === 0 && (
        <li className="py-6 text-center text-xs text-text-muted">No events in window</li>
      )}
    </ul>
  );

  const classesSlot = (
    <ul className="space-y-2.5">
      {classBreakdown
        .filter((c) => c.count > 0)
        .map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: c.color }}
              aria-hidden="true"
            />
            <span className="w-32 truncate text-[11px] text-text-secondary">{c.label}</span>
            <span className="w-5 shrink-0 text-right font-mono text-[11px] text-text-muted">
              {c.count}
            </span>
            <div className="flex-1 rounded-full bg-bg-elevated" style={{ height: "6px" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(4, c.pct)}%`,
                  backgroundColor: c.color,
                  opacity: 0.7,
                }}
              />
            </div>
            <span className="w-8 text-right font-mono text-[10px] text-text-muted">
              {c.pct.toFixed(0)}%
            </span>
          </li>
        ))}
      {classBreakdown.every((c) => c.count === 0) && (
        <li className="text-xs text-text-muted">No data</li>
      )}
    </ul>
  );

  const briefSlot = (
    <>
      <p className="mb-3 text-xs text-text-muted">
        Ask the Aegis Copilot to summarise current events, draft a situation report, or assess
        threat vectors.
      </p>
      <DashboardCopilot />
    </>
  );

  const alertsSlot = (
    <>
      <ul className="divide-y divide-border-subtle">
        {alertRulesState.map((rule) => {
          const color = CLASS_COLOR[rule.cls] ?? "#94a3b8";
          const clsLabel = ALL_CLASSES.find((c) => c.id === rule.cls)?.label ?? rule.cls;
          return (
            <li key={rule.id} className="flex items-center gap-3 py-3">
              <button
                type="button"
                onClick={() => toggleRule(rule.id)}
                aria-label={rule.active ? "Deactivate rule" : "Activate rule"}
                aria-pressed={rule.active}
                className={`flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
                  rule.active
                    ? "border-accent/60 bg-accent/20"
                    : "border-border-subtle bg-bg-base"
                }`}
              >
                <span
                  className={`ml-0.5 h-4 w-4 rounded-full transition-transform ${
                    rule.active
                      ? "translate-x-4 bg-accent"
                      : "translate-x-0 bg-text-muted"
                  }`}
                />
              </button>
              <span className="flex-1 text-xs font-medium text-text-primary">{rule.name}</span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{ backgroundColor: `${color}22`, color }}
              >
                {clsLabel}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-border-subtle pt-3">
        <Link href={`/${locale}/alerts`} className="text-xs text-accent hover:underline">
          Manage all alert rules →
        </Link>
      </div>
    </>
  );

  const slots: DashboardWidgetSlots = {
    kpi: kpiSlot,
    events: eventsSlot,
    classes: classesSlot,
    brief: briefSlot,
    alerts: alertsSlot,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 font-mono text-lg font-semibold text-text-primary">
          ANALYST DASHBOARD
        </h1>
        <span className="font-mono text-xs text-text-muted">Ukraine · 24h window</span>

        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
            editMode
              ? "border-accent/60 bg-accent/20 text-accent"
              : "border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary"
          }`}
        >
          {editMode ? "Exit Customize" : "Customize"}
        </button>

        {editMode && (
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="rounded border border-accent/60 bg-accent px-3 py-1.5 text-xs font-semibold text-bg-base hover:bg-accent/90"
          >
            Save layout
          </button>
        )}

        {/* Export preset */}
        <button
          type="button"
          onClick={() => {
            const preset = {
              id: `custom-${Date.now()}`,
              name: "My Dashboard Layout",
              filters: {
                country: "ua",
                hours: 24,
                classes: ALL_CLASSES.map((c) => c.id),
              },
              dashboardWidgets: ["kpi", "events", "classes", "brief", "alerts"],
              public: false,
            };
            const blob = new Blob([JSON.stringify(preset, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "aegis-preset.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
        >
          ⬇ Export preset
        </button>

        {/* Import preset */}
        <label className="cursor-pointer rounded border border-border-subtle px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface">
          ⬆ Import preset
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              file
                .text()
                .then((text) => {
                  const preset = JSON.parse(text) as {
                    name?: string;
                    dashboardWidgets?: string[];
                  };
                  // Fire toast to confirm import success
                  window.dispatchEvent(
                    new CustomEvent("aegis:toast", {
                      detail: {
                        message: `Imported preset: ${preset.name ?? "Custom layout"}`,
                        variant: "success",
                      },
                    }),
                  );
                })
                .catch(() => {
                  window.dispatchEvent(
                    new CustomEvent("aegis:toast", {
                      detail: {
                        message: "Failed to parse preset file",
                        variant: "error",
                      },
                    }),
                  );
                });
              // Reset so the same file can be re-selected
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={shareUrl}
          title="Copy dashboard URL to clipboard"
          className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
        >
          Share
        </button>
      </div>

      {editMode && (
        <p className="mb-4 text-xs text-text-muted">
          Drag widgets to reorder. Use the grid toolbar to add or remove panels.
        </p>
      )}

      <DraggableGrid slots={slots} editMode={editMode} />
    </main>
  );
}
