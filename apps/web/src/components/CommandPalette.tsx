"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CommandCategory = "navigate" | "search" | "filter" | "layer" | "action" | "ai";

interface PaletteCommand {
  id: string;
  category: CommandCategory;
  title: string;
  subtitle?: string;
  shortcut?: string;
  href?: string;
  action?: string;
}

interface ApiResponse {
  data: PaletteCommand[];
  meta: { count: number; query: string };
}

// ─── Static commands (mirrored from the API, so the palette works without a
//     network round-trip when the query is empty) ────────────────────────────

const STATIC_COMMANDS: PaletteCommand[] = [
  // Navigate
  { id: "nav-home",       category: "navigate", title: "Go to Home",           shortcut: "g h", href: "/" },
  { id: "nav-map",        category: "navigate", title: "Go to Map",            shortcut: "g m", href: "/map" },
  { id: "nav-search",     category: "navigate", title: "Go to Search",         shortcut: "g s", href: "/search" },
  { id: "nav-dashboard",  category: "navigate", title: "Go to Dashboard",      shortcut: "g d", href: "/dashboard" },
  { id: "nav-cases",      category: "navigate", title: "Go to Cases",          shortcut: "g c", href: "/cases" },
  { id: "nav-alerts",     category: "navigate", title: "Go to Alerts",         shortcut: "g a", href: "/alerts" },
  { id: "nav-aois",       category: "navigate", title: "Go to AOIs",           href: "/aois" },
  { id: "nav-reports",    category: "navigate", title: "Go to Reports",        href: "/reports" },
  { id: "nav-settings",   category: "navigate", title: "Settings",             href: "/settings" },
  { id: "nav-review",     category: "navigate", title: "Review Queue",         href: "/review" },

  // Search
  { id: "search-events",  category: "search",   title: "Search Events",        subtitle: "Full-text + semantic", shortcut: "/" },
  { id: "search-cases",   category: "search",   title: "Search Cases",         href: "/cases?q=" },
  { id: "search-sources", category: "search",   title: "Search Sources",       href: "/sources?q=" },
  { id: "search-regions", category: "search",   title: "Search Regions",       href: "/regions?q=" },

  // Filter
  { id: "filter-24h",          category: "filter", title: "Last 24 hours",            action: "set-filter-24h" },
  { id: "filter-7d",           category: "filter", title: "Last 7 days",              action: "set-filter-7d" },
  { id: "filter-military",     category: "filter", title: "Military actions only",    action: "set-class-military_action" },
  { id: "filter-civilian",     category: "filter", title: "Civilian alerts only",     action: "set-class-civilian_alert" },
  { id: "filter-high-danger",  category: "filter", title: "High danger (≥70)",        action: "set-min-danger-70" },
  { id: "filter-clear",        category: "filter", title: "Clear all filters",        shortcut: "Esc", action: "clear-filters" },

  // Layer
  { id: "layer-events",    category: "layer",  title: "Toggle Events layer",           action: "toggle-layer-events" },
  { id: "layer-drones",    category: "layer",  title: "Toggle Drones layer",           action: "toggle-layer-drones" },
  { id: "layer-missiles",  category: "layer",  title: "Toggle Missiles layer",         action: "toggle-layer-missiles" },
  { id: "layer-infra",     category: "layer",  title: "Toggle Infrastructure layer",   action: "toggle-layer-infrastructure" },
  { id: "layer-alerts",    category: "layer",  title: "Toggle Civilian Alerts layer",  action: "toggle-layer-civilian_alerts" },
  { id: "layer-satellite", category: "layer",  title: "Toggle Satellite imagery",      action: "toggle-layer-satellite" },
  { id: "layer-heatmap",   category: "layer",  title: "Toggle Activity heatmap",       action: "toggle-layer-heatmap" },

  // Action
  { id: "action-new-case",    category: "action", title: "New Case File",           action: "create-case" },
  { id: "action-new-aoi",     category: "action", title: "Draw new AOI",            action: "create-aoi" },
  { id: "action-new-alert",   category: "action", title: "Create Alert Rule",       action: "create-alert" },
  { id: "action-export-csv",  category: "action", title: "Export events (CSV)",     action: "export-csv" },
  { id: "action-export-geo",  category: "action", title: "Export events (GeoJSON)", action: "export-geojson" },
  { id: "action-share",       category: "action", title: "Share current view",      shortcut: "⌘ ⇧ S", action: "share-view" },
  { id: "action-screenshot",  category: "action", title: "Screenshot map",          action: "screenshot-map" },

  // AI
  { id: "ai-copilot",      category: "ai", title: "Ask AI Copilot…",           shortcut: "?", action: "open-copilot" },
  { id: "ai-brief",        category: "ai", title: "Generate region brief",     action: "generate-brief" },
  { id: "ai-create-rule",  category: "ai", title: "Create alert rule with AI", action: "open-rule-builder" },
  { id: "ai-summarize",    category: "ai", title: "Summarize selected events", action: "summarize-events" },
];

// Canonical order for grouping when no query is active
const CATEGORY_ORDER: CommandCategory[] = ["navigate", "search", "filter", "layer", "action", "ai"];

const CATEGORY_LABEL: Record<CommandCategory, string> = {
  navigate: "Navigate",
  search:   "Search",
  filter:   "Filter",
  layer:    "Layer",
  action:   "Action",
  ai:       "AI",
};

const CATEGORY_ICON: Record<CommandCategory, string> = {
  navigate: "→",
  search:   "⌕",
  filter:   "⊘",
  layer:    "◈",
  action:   "⚡",
  ai:       "✦",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByCategory(commands: PaletteCommand[]): Map<CommandCategory, PaletteCommand[]> {
  const map = new Map<CommandCategory, PaletteCommand[]>();
  for (const cat of CATEGORY_ORDER) {
    const items = commands.filter((c) => c.category === cat);
    if (items.length > 0) map.set(cat, items);
  }
  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ShortcutBadge({ shortcut }: { shortcut: string }) {
  return (
    <kbd
      aria-hidden
      className="ml-auto shrink-0 rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] leading-tight text-text-muted"
    >
      {shortcut}
    </kbd>
  );
}

interface CommandItemProps {
  command: PaletteCommand;
  isActive: boolean;
  onActivate: (cmd: PaletteCommand) => void;
  onHover: () => void;
}

function CommandItem({ command, isActive, onActivate, onHover }: CommandItemProps) {
  const icon = CATEGORY_ICON[command.category];

  return (
    <li
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      onClick={() => onActivate(command)}
      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
        isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated"
      }`}
    >
      {/* Category icon */}
      <span
        aria-hidden
        className="w-4 shrink-0 text-center font-mono text-[11px] text-text-muted"
      >
        {icon}
      </span>

      {/* Title + subtitle */}
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm text-text-primary">{command.title}</span>
        {command.subtitle && (
          <span className="block truncate text-xs text-text-muted">{command.subtitle}</span>
        )}
      </div>

      {/* Shortcut badge */}
      {command.shortcut && <ShortcutBadge shortcut={command.shortcut} />}
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<PaletteCommand[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading]   = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLUListElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived display list ─────────────────────────────────────────────────
  // When query is empty: show all static commands
  // When query is active and results returned: show those
  const displayCommands: PaletteCommand[] = query.length >= 2 ? results : STATIC_COMMANDS;

  // Flat list for keyboard nav (across all groups)
  const flatList: PaletteCommand[] = displayCommands;

  // ── Open / close helpers ─────────────────────────────────────────────────
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setResults([]);
    setActiveIdx(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIdx(0);
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Global ⌘K / Ctrl+K listener ─────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        // Don't interfere if HeaderSearch is also listening — we check if the
        // palette itself is already open so we toggle it off instead.
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => {
          if (prev) {
            closePalette();
            return false;
          }
          openPalette();
          return true;
        });
      }
    };
    // useCapture=true so we fire before HeaderSearch's bubble listener
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [closePalette, openPalette]);

  // ── Focus input when opened ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  // ── Debounced API fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIdx(0);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(
          `/api/command-palette?q=${encodeURIComponent(query)}&limit=20`,
          { signal: ctrl.signal },
        );
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = (await res.json()) as ApiResponse;
        setResults(json.data ?? []);
        setActiveIdx(0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Activate a command ───────────────────────────────────────────────────
  const activateCommand = useCallback((cmd: PaletteCommand) => {
    if (cmd.href) {
      window.location.href = cmd.href;
    } else if (cmd.action) {
      window.dispatchEvent(
        new CustomEvent("aegis:palette-action", { detail: { action: cmd.action } }),
      );
    }
    closePalette();
  }, [closePalette]);

  // ── Keyboard navigation inside the palette ───────────────────────────────
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (flatList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => {
        const next = (i + 1) % flatList.length;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => {
        const next = (i - 1 + flatList.length) % flatList.length;
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = flatList[activeIdx];
      if (cmd) activateCommand(cmd);
    }
  };

  const scrollActiveIntoView = (idx: number) => {
    if (!listRef.current) return;
    const item = listRef.current.querySelectorAll("[role='option']")[idx];
    item?.scrollIntoView({ block: "nearest" });
  };

  // ── Nothing to render when closed ───────────────────────────────────────
  if (!open) return null;

  // ── Grouped display ──────────────────────────────────────────────────────
  const isGrouped = query.length < 2;
  const grouped   = isGrouped ? groupByCategory(displayCommands) : null;

  // Build a global flat index map for active highlight (needed for grouped view)
  let flatIdx = 0;
  const groupedWithIndex: Array<{ cat: CommandCategory; items: Array<{ cmd: PaletteCommand; idx: number }> }> = [];
  if (grouped) {
    for (const [cat, items] of grouped) {
      const itemsWithIdx = items.map((cmd) => ({ cmd, idx: flatIdx++ }));
      groupedWithIndex.push({ cat, items: itemsWithIdx });
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={closePalette}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-0 z-[61] flex items-start justify-center px-4 pt-[15vh]"
        onKeyDown={(e) => {
          // Prevent Esc from bubbling to other listeners once caught
          if (e.key === "Escape") closePalette();
        }}
      >
        <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border-default bg-bg-surface shadow-2xl">

          {/* ── Search input ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
            <span aria-hidden className="shrink-0 text-sm text-text-muted">⌕</span>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls="command-palette-list"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Type a command or search…"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {loading && (
              <span aria-hidden className="shrink-0 text-xs text-text-muted animate-pulse">
                …
              </span>
            )}
            <kbd
              aria-hidden
              className="shrink-0 rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] leading-tight text-text-muted"
            >
              Esc
            </kbd>
          </div>

          {/* ── Results list ──────────────────────────────────────────────── */}
          <ul
            id="command-palette-list"
            ref={listRef}
            role="listbox"
            aria-label="Commands"
            className="max-h-[60vh] overflow-y-auto py-2"
          >
            {flatList.length === 0 && !loading && (
              <li className="px-4 py-6 text-center text-sm text-text-muted">
                No commands found.
              </li>
            )}

            {/* Flat (search results) */}
            {!isGrouped &&
              flatList.map((cmd, idx) => (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  isActive={idx === activeIdx}
                  onActivate={activateCommand}
                  onHover={() => setActiveIdx(idx)}
                />
              ))}

            {/* Grouped (empty query) */}
            {isGrouped &&
              groupedWithIndex.map(({ cat, items }) => (
                <li key={cat} role="presentation">
                  {/* Section header */}
                  <div className="flex items-center gap-2 px-4 pb-1 pt-3">
                    <span aria-hidden className="font-mono text-[10px] text-text-muted">
                      {CATEGORY_ICON[cat]}
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      {CATEGORY_LABEL[cat]}
                    </span>
                  </div>
                  <ul role="presentation">
                    {items.map(({ cmd, idx }) => (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isActive={idx === activeIdx}
                        onActivate={activateCommand}
                        onHover={() => setActiveIdx(idx)}
                      />
                    ))}
                  </ul>
                </li>
              ))}
          </ul>

          {/* ── Footer hint ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 border-t border-border-subtle px-4 py-2 text-[10px] text-text-muted">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
            <span className="ml-auto font-mono">⌘K</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Thin provider wrapper (for layout.tsx) ────────────────────────────────

export function CommandPaletteProvider() {
  return <CommandPalette />;
}
