"use client";

import { useState } from "react";
import Link from "next/link";
import { CLASS_COLOR, ALL_CLASSES } from "@/lib/filter-config";
import type { EventClass } from "@aegis/types";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

type RuleStatus = "active" | "paused";
type Channel = "in_app" | "telegram" | "email" | "slack" | "webhook";

interface AlertRule {
  id: string;
  name: string;
  status: RuleStatus;
  classes: EventClass[];
  region: string;
  channels: Channel[];
  triggeredToday: number;
}

interface RecentAlert {
  id: string;
  ruleName: string;
  event: string;
  time: string;
  severity: number;
  confidence: number;
  eventClass: EventClass;
}

const INITIAL_RULES: AlertRule[] = [
  {
    id: "rule-1",
    name: "Military Ukraine",
    status: "active",
    classes: ["military_action"],
    region: "Ukraine",
    channels: ["in_app", "telegram"],
    triggeredToday: 3,
  },
  {
    id: "rule-2",
    name: "Cyber Attacks EU",
    status: "active",
    classes: ["cyber"],
    region: "EU",
    channels: ["email"],
    triggeredToday: 0,
  },
  {
    id: "rule-3",
    name: "Civilian Alerts Kyiv",
    status: "paused",
    classes: ["civilian_alert"],
    region: "Kyiv Oblast",
    channels: ["in_app"],
    triggeredToday: 0,
  },
];

const RECENT_ALERTS: RecentAlert[] = [
  {
    id: "al-1",
    ruleName: "Military Ukraine",
    event: "Strike reported near Kharkiv rail hub",
    time: "2h ago",
    severity: 3,
    confidence: 0.82,
    eventClass: "military_action",
  },
  {
    id: "al-2",
    ruleName: "Military Ukraine",
    event: "Drone activity over Zaporizhzhia",
    time: "5h ago",
    severity: 2,
    confidence: 0.71,
    eventClass: "military_action",
  },
  {
    id: "al-3",
    ruleName: "Military Ukraine",
    event: "Artillery exchange — Donetsk Oblast",
    time: "Yesterday",
    severity: 4,
    confidence: 0.91,
    eventClass: "military_action",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHANNEL_LABELS: Record<Channel, string> = {
  in_app: "In-app",
  telegram: "Telegram",
  email: "Email",
  slack: "Slack",
  webhook: "Webhook",
};

function getClassLabel(id: EventClass): string {
  return ALL_CLASSES.find((c) => c.id === id)?.label ?? id;
}

function SeverityDots({ severity }: { severity: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Severity ${severity} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={[
            "inline-block h-1.5 w-1.5 rounded-full",
            i < severity ? "bg-accent" : "bg-border-subtle",
          ].join(" ")}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AlertRulesSection({ locale }: { locale: string }) {
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_RULES);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function toggleStatus(id: string) {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "paused" : "active" }
          : r,
      ),
    );
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  }

  const builderHref = `/${locale}/alerts/rule-builder`;

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* My Alert Rules                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">My Alert Rules</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Active rules trigger notifications when matching events are published.
            </p>
          </div>
          <Link
            href={builderHref}
            className="rounded bg-accent px-3 py-2 text-sm font-medium text-bg-base hover:bg-accent/90 transition-colors"
          >
            + Create rule
          </Link>
        </div>

        {rules.length === 0 ? (
          <div className="mt-6 rounded border border-dashed border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-secondary">
            No rules yet.{" "}
            <Link href={builderHref} className="text-accent hover:underline underline-offset-2">
              Create your first rule
            </Link>
            .
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={[
                  "rounded border bg-bg-surface p-4 transition-opacity",
                  rule.status === "paused"
                    ? "border-border-subtle opacity-60"
                    : "border-border-default",
                ].join(" ")}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start gap-3">
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleStatus(rule.id)}
                    aria-label={rule.status === "active" ? "Pause rule" : "Activate rule"}
                    className={[
                      "relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200",
                      rule.status === "active"
                        ? "border-accent bg-accent"
                        : "border-border-default bg-bg-base",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
                        rule.status === "active" ? "translate-x-3.5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>

                  {/* Name + status badge */}
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <span className="font-medium text-text-primary">{rule.name}</span>
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                        rule.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-bg-elevated text-text-secondary",
                      ].join(" ")}
                    >
                      {rule.status}
                    </span>

                    {/* Triggered today */}
                    {rule.triggeredToday > 0 && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        {rule.triggeredToday} today
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`${builderHref}?edit=${rule.id}`}
                      className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Edit
                    </Link>

                    {deletingId === rule.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-secondary">Delete?</span>
                        <button
                          type="button"
                          onClick={() => deleteRule(rule.id)}
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(rule.id)}
                        className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:border-red-500/40 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* Class chips */}
                  {rule.classes.map((cls) => (
                    <span
                      key={cls}
                      className="flex items-center gap-1 rounded-full border border-border-subtle bg-bg-base px-2 py-0.5 text-xs text-text-secondary"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: CLASS_COLOR[cls] }}
                      />
                      {getClassLabel(cls)}
                    </span>
                  ))}

                  {/* Region */}
                  <span className="text-xs text-text-secondary">
                    <span className="opacity-50">Region:</span> {rule.region}
                  </span>

                  {/* Channels */}
                  <span className="ml-auto flex flex-wrap gap-1">
                    {rule.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-secondary uppercase tracking-wide"
                      >
                        {CHANNEL_LABELS[ch]}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Alerts Feed                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Recent alerts</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Latest events that matched your active rules.
        </p>

        <ul className="mt-5 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
          {RECENT_ALERTS.map((alert) => (
            <li key={alert.id} className="flex flex-wrap items-start gap-3 px-4 py-4">
              {/* Class dot */}
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: CLASS_COLOR[alert.eventClass] }}
                aria-hidden="true"
              />

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {alert.event}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {/* Rule name badge */}
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                    {alert.ruleName}
                  </span>
                  {/* Severity */}
                  <SeverityDots severity={alert.severity} />
                  {/* Confidence */}
                  <span className="text-xs text-text-secondary">
                    {Math.round(alert.confidence * 100)}% confidence
                  </span>
                  {/* Time */}
                  <span className="text-xs text-text-secondary ml-auto">{alert.time}</span>
                </div>
              </div>

              {/* View link */}
              <a
                href={`/events?highlight=${alert.id}`}
                className="mt-0.5 shrink-0 text-xs text-accent hover:underline underline-offset-2 whitespace-nowrap"
              >
                View event →
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
