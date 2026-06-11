"use client";

import { useState, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PinnedEvent {
  id: string;
  cls: string;
  summary: string;
  confidence: number;
  danger: number;
}

interface SearchResult {
  id: string;
  cls: string;
  summary: string;
  confidence: number;
  danger: number;
}

interface CaseEventListProps {
  events: PinnedEvent[];
  onRemove?: (id: string) => void;
  onPin?: (event: PinnedEvent) => void;
}

// ── Class dot colours ─────────────────────────────────────────────────────────

const CLS_COLOURS: Record<string, string> = {
  military_action: "bg-red-500",
  infrastructure:  "bg-orange-400",
  cyber:           "bg-purple-500",
  humanitarian:    "bg-blue-400",
  chemical:        "bg-yellow-400",
  nuclear:         "bg-yellow-600",
  diplomatic:      "bg-green-400",
  default:         "bg-border-default",
};

function clsDot(cls: string) {
  return CLS_COLOURS[cls] ?? CLS_COLOURS.default;
}

// ── Danger colour ─────────────────────────────────────────────────────────────

function dangerColor(danger: number): string {
  if (danger >= 80) return "text-red-400";
  if (danger >= 50) return "text-orange-400";
  return "text-text-muted";
}

// ── Confidence bar ────────────────────────────────────────────────────────────

function ConfBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-text-muted">{pct}%</span>
    </div>
  );
}

// ── Pin Modal ─────────────────────────────────────────────────────────────────

function PinModal({
  open,
  onClose,
  onPin,
  alreadyPinned,
}: {
  open: boolean;
  onClose: () => void;
  onPin: (ev: PinnedEvent) => void;
  alreadyPinned: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/events?q=${encodeURIComponent(query.trim())}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data: SearchResult[]) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError("Search failed. Try again.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-lg border border-border-default bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h3 className="text-sm font-semibold text-text-primary">Pin event to case</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events by ID or keyword…"
            className="w-full rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {loading && (
            <p className="px-5 py-4 text-sm text-text-muted">Searching…</p>
          )}
          {error && (
            <p className="px-5 py-4 text-sm text-red-400">{error}</p>
          )}
          {!loading && !error && results.length === 0 && query.trim() && (
            <p className="px-5 py-4 text-sm text-text-muted">No events found.</p>
          )}
          {results.map((r) => {
            const pinned = alreadyPinned.includes(r.id);
            return (
              <div
                key={r.id}
                className="flex items-start gap-3 border-t border-border-subtle px-5 py-3 hover:bg-bg-elevated"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${clsDot(r.cls)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-text-primary">{r.summary}</p>
                  <p className="font-mono text-[10px] text-text-muted">{r.id}</p>
                </div>
                <button
                  type="button"
                  disabled={pinned}
                  onClick={() => {
                    onPin(r);
                    onClose();
                  }}
                  className={[
                    "shrink-0 rounded px-3 py-1 text-xs font-medium",
                    pinned
                      ? "cursor-not-allowed bg-bg-elevated text-text-muted"
                      : "bg-accent text-black hover:bg-accent/90",
                  ].join(" ")}
                >
                  {pinned ? "Pinned" : "Pin"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border-subtle px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CaseEventList({ events, onRemove, onPin }: CaseEventListProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {events.length === 0 && (
        <p className="py-3 text-xs text-text-muted">No events pinned yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-2 rounded border border-border-subtle bg-bg-elevated p-2.5"
          >
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${clsDot(ev.cls)}`}
              title={ev.cls}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs text-text-primary" title={ev.summary}>
                {ev.summary}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <ConfBar value={ev.confidence} />
                <span className={`font-mono text-[10px] ${dangerColor(ev.danger)}`}>
                  D:{ev.danger}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <a
                href={`/events/${ev.id}`}
                className="font-mono text-[10px] text-accent hover:underline"
              >
                Open
              </a>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(ev.id)}
                  className="font-mono text-[10px] text-text-muted hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mt-3 w-full rounded border border-dashed border-border-default py-2 text-xs text-text-muted hover:border-accent hover:text-accent transition-colors"
      >
        + Pin more events
      </button>

      <PinModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPin={(ev) => onPin?.(ev)}
        alreadyPinned={events.map((e) => e.id)}
      />
    </div>
  );
}
