"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Suggestion = {
  kind: string;
  slug: string;
  label: string;
  href: string;
  sub?: string;
  score: number;
};

const KIND_LABEL: Record<string, string> = {
  event: "Event",
  equipment: "Equipment",
  conflict: "Conflict",
  glossary: "Glossary",
  company: "Company",
  tool: "Tool",
  region: "Region",
  source: "Source",
  threat: "Threat",
  report: "Report",
  investigation: "Investigation",
};

type Props = {
  /** Initial query value (server-rendered). */
  initialQuery: string;
  /** Path the form should POST to (locale-aware). */
  action: string;
};

/**
 * Search typeahead. Renders the input + submit button, plus a
 * debounced dropdown of suggestions from /api/search/suggest.
 *
 * - Submitting (Enter) navigates to the full results page server-side.
 * - Clicking a suggestion navigates directly to its href.
 * - Esc clears focus / closes the dropdown.
 */
export function SearchTypeahead({ initialQuery, action }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(term)}&limit=8`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setItems(data.suggestions ?? []);
        setActiveIdx(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          // Silent fail — server-side submit still works.
        }
      }
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  // Outside-click closes dropdown.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const RECENT_KEY = "aegis_recent_searches";
  const MAX_RECENT = 10;

  function trackRecentSearch(term: string) {
    if (!term.trim()) return;
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      const deduped = [term, ...existing.filter((t) => t !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
    } catch {
      // localStorage unavailable — silently ignore.
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (!open || items.length === 0) {
      if (e.key === "Enter") {
        trackRecentSearch(q.trim());
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) {
        trackRecentSearch(q.trim());
        window.location.href = item.href;
      }
    } else if (e.key === "Enter") {
      trackRecentSearch(q.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form action={action} method="get" className="flex gap-2" onSubmit={() => trackRecentSearch(q.trim())}>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && items.length > 0}
          placeholder="kharkiv, drone, osint…"
          className="flex-1 rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      {open && items.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-[80px] top-full z-20 mt-1 max-h-[400px] overflow-y-auto rounded border border-border-default bg-bg-surface shadow-lg"
        >
          {items.map((it, idx) => (
            <li key={`${it.kind}-${it.slug}-${idx}`} role="option" aria-selected={idx === activeIdx}>
              <Link
                href={it.href}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`block px-3 py-2 ${
                  idx === activeIdx ? "bg-bg-elevated" : ""
                } hover:bg-bg-elevated`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-text-primary">{it.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                    {KIND_LABEL[it.kind] ?? it.kind}
                  </span>
                </div>
                {it.sub && (
                  <div className="mt-0.5 truncate text-xs text-text-muted">{it.sub}</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
