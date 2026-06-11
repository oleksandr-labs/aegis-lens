"use client";

import { useEffect, useRef } from "react";
import { CHANGELOG, type ChangeType } from "@/lib/changelog-data";

const PREVIEW_COUNT = 2;

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const styles: Record<ChangeType, string> = {
    feature:     "bg-green-500/10 text-green-400 border-green-500/20",
    improvement: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    fix:         "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    breaking:    "bg-red-500/10 text-red-400 border-red-500/20",
    security:    "bg-purple-500/10 text-purple-400 border-purple-500/20",
    deprecation: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <span
      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase ${styles[type]}`}
    >
      {type}
    </span>
  );
}

interface WhatsNewPanelProps {
  onClose: () => void;
  onMarkRead: () => void;
}

export function WhatsNewPanel({ onClose, onMarkRead }: WhatsNewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const entries = CHANGELOG.slice(0, PREVIEW_COUNT);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay so the trigger button click doesn't immediately close
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="What's new"
      aria-modal="false"
      className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 z-50 border-l border-border-subtle bg-bg-surface overflow-y-auto shadow-xl"
    >
      {/* Panel header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-surface px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            What&apos;s New
          </p>
          <p className="text-xs text-text-muted">Latest Aegis Lens releases</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close what's new panel"
          className="rounded p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Entries */}
      <div className="px-4 py-4 space-y-6">
        {entries.map((entry) => (
          <div key={entry.version}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] font-semibold text-text-primary">
                v{entry.version}
              </span>
              <time className="font-mono text-[10px] text-text-muted">{entry.date}</time>
            </div>
            <p className="text-sm font-medium text-text-primary mb-2">{entry.title}</p>
            {entry.highlight && (
              <p className="mb-2 text-[11px] text-text-muted leading-relaxed">
                {entry.highlight}
              </p>
            )}
            <ul className="space-y-1.5">
              {entry.changes.slice(0, 4).map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChangeTypeBadge type={c.type} />
                  <span className="text-[11px] text-text-secondary leading-relaxed">
                    {c.link ? (
                      <a href={c.link} className="text-accent hover:underline">
                        {c.text}
                      </a>
                    ) : (
                      c.text
                    )}
                  </span>
                </li>
              ))}
              {entry.changes.length > 4 && (
                <li className="text-[10px] text-text-muted pl-1">
                  +{entry.changes.length - 4} more changes
                </li>
              )}
            </ul>
            <div className="mt-4 border-b border-border-subtle" />
          </div>
        ))}
      </div>

      {/* Panel footer */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-bg-surface px-4 py-3 flex items-center justify-between gap-2">
        <a
          href="/changelog"
          className="text-xs text-accent hover:underline"
          onClick={onClose}
        >
          View full changelog →
        </a>
        <button
          onClick={onMarkRead}
          className="rounded border border-border-subtle px-2.5 py-1 text-[11px] text-text-muted hover:bg-bg-elevated hover:text-text-primary"
        >
          Mark as read
        </button>
      </div>
    </div>
  );
}
