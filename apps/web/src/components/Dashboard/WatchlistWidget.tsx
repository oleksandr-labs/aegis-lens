"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type WatchlistItemType = "region" | "entity" | "source" | "topic";

type WatchlistItem = {
  id: string;
  type: WatchlistItemType;
  label: string;
  alertCount: number;
  lastActivity: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<WatchlistItemType, string> = {
  region: "🗺",
  entity: "🏢",
  source: "📡",
  topic:  "🏷",
};

const TYPE_LABEL: Record<WatchlistItemType, string> = {
  region: "Region",
  entity: "Entity",
  source: "Source",
  topic:  "Topic",
};

const INITIAL_ITEMS: WatchlistItem[] = [
  { id: "w1", type: "region", label: "Kharkiv Oblast",        alertCount: 3, lastActivity: "2h ago"    },
  { id: "w2", type: "entity", label: "Shahed-136 / Geran-2",  alertCount: 0, lastActivity: "4h ago"    },
  { id: "w3", type: "source", label: "Ukraine GenStaff",      alertCount: 1, lastActivity: "1h ago"    },
  { id: "w4", type: "topic",  label: "Cyber attacks",         alertCount: 0, lastActivity: "Yesterday" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function WatchlistWidget() {
  const [items, setItems] = useState<WatchlistItem[]>(INITIAL_ITEMS);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<WatchlistItemType>("region");

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    const item: WatchlistItem = {
      id: `w${Date.now()}`,
      type: newType,
      label,
      alertCount: 0,
      lastActivity: "Just now",
    };
    setItems((prev) => [item, ...prev]);
    setNewLabel("");
    setShowForm(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* List */}
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-text-muted">Nothing being watched yet</p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 py-2">
              {/* Type icon */}
              <span title={TYPE_LABEL[item.type]} className="text-base leading-none" aria-label={TYPE_LABEL[item.type]}>
                {TYPE_ICON[item.type]}
              </span>

              {/* Label */}
              <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
                {item.label}
              </span>

              {/* Alert count badge */}
              {item.alertCount > 0 && (
                <span className="shrink-0 rounded bg-red-900/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-red-400">
                  {item.alertCount}
                </span>
              )}

              {/* Last activity */}
              <span className="shrink-0 font-mono text-[10px] text-text-muted">
                {item.lastActivity}
              </span>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.label} from watchlist`}
                className="shrink-0 text-text-muted hover:text-red-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="flex flex-col gap-2 rounded border border-border-subtle bg-bg-base p-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setShowForm(false); }}
            placeholder="Label…"
            autoFocus
            className="w-full rounded border border-border-subtle bg-bg-elevated px-2 py-1 text-xs text-text-primary outline-none focus:border-accent placeholder:text-text-muted"
          />
          <div className="flex gap-1">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as WatchlistItemType)}
              className="flex-1 rounded border border-border-subtle bg-bg-elevated px-1 py-1 text-xs text-text-primary outline-none focus:border-accent"
            >
              {(["region", "entity", "source", "topic"] as WatchlistItemType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_ICON[t]} {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addItem}
              className="rounded bg-accent px-3 py-1 text-xs font-semibold text-bg-base hover:bg-accent/90"
            >
              Watch
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-border-subtle px-2 py-1 text-xs text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 self-start text-xs text-accent hover:underline"
        >
          <span aria-hidden="true">+</span> Add to watchlist
        </button>
      )}

      {/* Footer */}
      <div className="border-t border-border-subtle pt-2">
        <Link
          href="/alerts/rule-builder"
          className="text-xs text-accent hover:underline"
        >
          Configure alerts →
        </Link>
      </div>
    </div>
  );
}
