"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "aegis_saved_searches";
const MAX_SAVED = 10;

type SavedSearch = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

function load(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedSearch[];
  } catch {
    return [];
  }
}

function save(items: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type Props = {
  onClose: () => void;
};

export function SavedSearches({ onClose }: Props) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [name, setName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Load on mount
  useEffect(() => {
    setSearches(load());
  }, []);

  // Outside-click closes panel
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const newItem: SavedSearch = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      url,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...searches].slice(0, MAX_SAVED);
    save(updated);
    setSearches(updated);
    setName("");
  }

  function handleDelete(id: string) {
    const updated = searches.filter((s) => s.id !== id);
    save(updated);
    setSearches(updated);
  }

  function handleLoad(url: string) {
    window.location.href = url;
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-30 mt-1 w-80 rounded border border-border-default bg-bg-elevated shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Saved searches
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Save current form */}
      <div className="border-b border-border-subtle px-3 py-2">
        <div className="flex gap-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Name this search…"
            className="flex-1 rounded border border-border-default bg-bg-base px-2 py-1 text-xs text-text-primary outline-none focus:border-accent"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded bg-accent px-2 py-1 text-xs font-semibold text-black disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-60 overflow-y-auto">
        {searches.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs italic text-text-muted">
            No saved searches yet
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {searches.map((s) => (
              <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-text-primary">{s.name}</div>
                  <div className="font-mono text-[9px] text-text-muted">{formatDate(s.createdAt)}</div>
                </div>
                <button
                  onClick={() => handleLoad(s.url)}
                  className="rounded border border-border-subtle px-2 py-0.5 text-[10px] text-text-secondary hover:border-accent hover:text-accent"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-text-muted hover:text-text-primary"
                  aria-label={`Delete "${s.name}"`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
