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
  /** Locale-aware fallback link for the "see all results" submission. */
  searchHref: string;
  /** Trigger label (e.g. localized "Search"). */
  triggerLabel: string;
};

/**
 * Compact header-level search trigger. Collapsed: a small icon button.
 * Expanded: an inline input with a typeahead dropdown — same backend
 * as the `/search` page typeahead.
 *
 * The "see all results for X" footer item submits to /search?q= to
 * preserve full-results behavior.
 */
export function HeaderSearch({ searchHref, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus the input when opening.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Debounced suggest.
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
          `/api/search/suggest?q=${encodeURIComponent(term)}&limit=6`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setItems(data.suggestions ?? []);
        setActiveIdx(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          // Silent.
        }
      }
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  // Click outside closes.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Global hotkeys to focus the search:
  //   cmd+K / ctrl+K — anywhere (including inside inputs)
  //   "/"            — only when not inside an input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        (e.target as HTMLElement | null)?.isContentEditable
      )
        return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQ("");
      return;
    }
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) window.location.href = item.href;
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded border border-border-default px-2.5 py-1.5 text-sm text-text-primary hover:bg-bg-surface"
        aria-label={triggerLabel}
        aria-keyshortcuts="Control+K Meta+K /"
        title={`${triggerLabel}  (⌘K or /)`}
      >
        <span aria-hidden>⌕</span>
        <kbd
          aria-hidden
          className="hidden rounded border border-border-subtle bg-bg-elevated px-1 py-0 font-mono text-[10px] leading-tight text-text-muted sm:inline"
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <form
        action={searchHref}
        method="get"
        onSubmit={(e) => {
          // Allow native submit to fall through, but close the dropdown.
          setOpen(false);
          void e;
        }}
        className="flex items-center gap-1"
      >
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="kharkiv, drone, osint…"
          aria-label={triggerLabel}
          autoComplete="off"
          className="w-64 rounded border border-border-default bg-bg-base px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setQ("");
          }}
          aria-label="Close search"
          className="rounded px-2 py-1 text-xs text-text-muted hover:text-text-primary"
          title="Esc"
        >
          ✕
        </button>
      </form>

      {q.trim().length >= 2 && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-[420px] max-w-[95vw] overflow-hidden rounded border border-border-default bg-bg-surface shadow-lg"
        >
          {items.length === 0 ? (
            <li className="px-3 py-3 text-xs text-text-muted">
              No suggestions. Hit Enter for full results.
            </li>
          ) : (
            <>
              {items.map((it, idx) => (
                <li
                  key={`${it.kind}-${it.slug}-${idx}`}
                  role="option"
                  aria-selected={idx === activeIdx}
                >
                  <Link
                    href={it.href}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 ${
                      idx === activeIdx ? "bg-bg-elevated" : ""
                    } hover:bg-bg-elevated`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-text-primary">
                        {it.label}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                        {KIND_LABEL[it.kind] ?? it.kind}
                      </span>
                    </div>
                    {it.sub && (
                      <div className="mt-0.5 truncate text-xs text-text-muted">
                        {it.sub}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </>
          )}
          <li className="border-t border-border-subtle">
            <Link
              href={`${searchHref}?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-xs text-accent hover:bg-bg-elevated"
            >
              See all results for "{q.trim()}" →
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
