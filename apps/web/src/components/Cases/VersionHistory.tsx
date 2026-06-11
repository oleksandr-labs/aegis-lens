"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VersionEntry {
  version: string;
  author: string;
  time: string;
  change: string;
}

interface VersionHistoryProps {
  versions?: VersionEntry[];
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const VERSIONS: VersionEntry[] = [
  {
    version: "v4",
    author: "James W.",
    time: "2026-06-03 10:22",
    change: "Added verification note from GenStaff",
  },
  {
    version: "v3",
    author: "Oleksandr K.",
    time: "2026-06-02 09:00",
    change: "Pinned 2nd event, added satellite request task",
  },
  {
    version: "v2",
    author: "James W.",
    time: "2026-06-01 15:10",
    change: "Cross-referenced with GenStaff update",
  },
  {
    version: "v1",
    author: "Oleksandr K.",
    time: "2026-06-01 14:32",
    change: "Case created, initial note added",
  },
];

// ── Toast helper (fire-and-forget) ────────────────────────────────────────────

function fireToast(message: string, variant = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("aegis:toast", { detail: { message, variant } }),
    );
  }
}

// ── Author avatar ─────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 font-mono text-[10px] font-bold text-accent">
      {initials}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function VersionHistory({ versions = VERSIONS }: VersionHistoryProps) {
  const [restoring, setRestoring] = useState<string | null>(null);

  function handleRestore(v: VersionEntry) {
    setRestoring(v.version);
    // Stub — simulate async restore
    setTimeout(() => {
      setRestoring(null);
      fireToast(`Restored to ${v.version} by ${v.author}`, "success");
    }, 800);
  }

  return (
    <div>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        Version History
      </h3>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-3 top-0 h-full w-px bg-border-subtle" />

        <div className="flex flex-col gap-0">
          {versions.map((v, idx) => (
            <div key={v.version} className="relative flex items-start gap-3 pb-5 pl-8">
              {/* Rail dot */}
              <span
                className={[
                  "absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2",
                  idx === 0
                    ? "border-accent bg-accent/20"
                    : "border-border-default bg-bg-base",
                ].join(" ")}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Version badge */}
                  <span
                    className={[
                      "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                      idx === 0
                        ? "bg-accent/20 text-accent"
                        : "bg-bg-elevated text-text-muted",
                    ].join(" ")}
                  >
                    {v.version}
                  </span>

                  {/* Author */}
                  <div className="flex items-center gap-1">
                    <Avatar name={v.author} />
                    <span className="text-xs font-medium text-text-secondary">
                      {v.author}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                  {v.time}
                </p>

                {/* Change description */}
                <p className="mt-1 text-xs text-text-secondary leading-snug">
                  {v.change}
                </p>

                {/* Restore */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRestore(v)}
                    disabled={restoring === v.version}
                    className="mt-1.5 rounded border border-border-subtle px-2 py-0.5 text-[10px] text-text-muted hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                  >
                    {restoring === v.version ? "Restoring…" : "Restore"}
                  </button>
                )}
                {idx === 0 && (
                  <span className="mt-1.5 block font-mono text-[10px] text-accent">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
