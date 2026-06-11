"use client";

import { useEffect, useState } from "react";

// ─── Checklist definition ─────────────────────────────────────────────────────

const CHECKLIST = [
  { id: "map",     label: "Open the live map",        href: "/map" },
  { id: "filter",  label: "Apply a filter",           action: "filter" },
  { id: "event",   label: "Click an event marker",    action: "event" },
  { id: "copilot", label: "Ask the AI Copilot",       action: "copilot" },
  { id: "alert",   label: "Create your first alert",  href: "/alerts" },
] as const;

type ChecklistId = (typeof CHECKLIST)[number]["id"];

const LS_COMPLETED = "aegis_checklist_completed";
const LS_DONE      = "aegis_checklist_done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_COMPLETED);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(LS_COMPLETED, JSON.stringify([...set]));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingChecklist() {
  const [visible,    setVisible]    = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [completed,  setCompleted]  = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!localStorage.getItem(LS_DONE)) {
      setVisible(true);
      setCompleted(loadCompleted());
    }
  }, []);

  if (!visible) return null;

  const allDone = CHECKLIST.every((item) => completed.has(item.id));
  const doneCount = CHECKLIST.filter((item) => completed.has(item.id)).length;

  function toggle(id: ChecklistId) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveCompleted(next);
      return next;
    });
  }

  function dismiss() {
    localStorage.setItem(LS_DONE, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-64 rounded-lg border border-border-subtle bg-bg-surface shadow-xl">
      {/* Collapsed trigger */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <span>🚀</span>
          <span>
            Getting started ({doneCount}/{CHECKLIST.length})
          </span>
        </button>
      ) : (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Getting started
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-text-muted hover:text-text-primary text-xs"
              aria-label="Collapse checklist"
            >
              ▼
            </button>
          </div>

          {allDone ? (
            /* All done state */
            <div className="text-center py-2">
              <p className="text-sm font-semibold text-text-primary">🎉 You're all set!</p>
              <button
                onClick={dismiss}
                className="mt-3 rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent-hover"
              >
                Dismiss
              </button>
            </div>
          ) : (
            /* Checklist items */
            <>
              <ul className="space-y-2">
                {CHECKLIST.map((item) => {
                  const done = completed.has(item.id);
                  return (
                    <li key={item.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(item.id)}
                        className={`h-4 w-4 flex-shrink-0 rounded border transition-colors ${
                          done
                            ? "bg-accent border-accent"
                            : "border-border-subtle bg-transparent"
                        }`}
                        aria-label={done ? `Unmark: ${item.label}` : `Mark done: ${item.label}`}
                      >
                        {done && (
                          <span className="flex h-full items-center justify-center text-[9px] font-bold text-black leading-none">
                            ✓
                          </span>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-xs ${
                          done ? "line-through text-text-muted" : "text-text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                      {"href" in item && item.href ? (
                        <a
                          href={item.href}
                          className="text-[10px] text-accent hover:underline"
                        >
                          →
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              {/* Progress */}
              <div className="mt-3 h-1 w-full rounded bg-border-subtle overflow-hidden">
                <div
                  className="h-full rounded bg-accent transition-all"
                  style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-text-muted">
                {doneCount}/{CHECKLIST.length} complete
              </p>

              <button
                onClick={dismiss}
                className="mt-3 text-[10px] text-text-muted hover:text-text-primary"
              >
                Dismiss checklist
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
