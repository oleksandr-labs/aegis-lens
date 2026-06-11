"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SHORTCUTS,
  eventToCombo,
  formatCombo,
  isTextInputFocused,
  shortcutsByScope,
  type ShortcutScope,
} from "@/lib/keyboard-shortcuts";
import { ensureLiveRegions } from "@/lib/a11y-announcer";

// ─── Sequence map for two-key "g X" navigation shortcuts ─────────────────────

const SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: "Global",
  map: "Map",
  list: "List / Table",
  modal: "Dialog",
  search: "Search",
};

export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const lastKey = useRef<string | null>(null);
  const lastKeyTime = useRef<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Build a route map from the static SHORTCUTS registry
  const NAV_ROUTES: Record<string, string> = {
    "g h": "/",
    "g m": "/map",
    "g d": "/dashboard",
    "g a": "/alerts",
    "g s": "/search",
    "g r": "/reports",
    "g c": "/cases",
  };

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      // Always allow Esc to close the modal
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }

      if (isTextInputFocused()) return;

      const now = Date.now();
      const combo = eventToCombo(e);

      // Build potential two-key sequence
      const sequence =
        lastKey.current && now - lastKeyTime.current < 1000
          ? `${lastKey.current} ${e.key.toLowerCase()}`
          : combo;

      // Two-key navigation sequences
      if (NAV_ROUTES[sequence]) {
        e.preventDefault();
        router.push(NAV_ROUTES[sequence]);
        lastKey.current = null;
        return;
      }

      // Single-key: show shortcuts cheat-sheet
      if (combo === "shift+/" || e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        lastKey.current = null;
        return;
      }

      lastKey.current = e.key.toLowerCase();
      lastKeyTime.current = now;
    },
    [open, router], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    ensureLiveRegions();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const grouped = shortcutsByScope();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded border border-border-subtle bg-bg-surface p-6 outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Keyboard shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close keyboard shortcuts"
            className="rounded p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {(Object.entries(grouped) as [ShortcutScope, typeof grouped[ShortcutScope]][]).map(
          ([scope, defs]) => (
            <div key={scope} className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {SCOPE_LABELS[scope]}
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {defs.map((s) => (
                    <tr key={s.id} className="border-b border-border-subtle/40 last:border-0">
                      <td className="py-1.5 pr-4 text-text-secondary">{s.description.en}</td>
                      <td className="py-1.5 text-right">
                        <kbd className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-text-primary">
                          {formatCombo(s.combo)}
                        </kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        )}

        <p className="mt-2 text-xs text-text-muted">
          Press <kbd className="font-mono">?</kbd> or <kbd className="font-mono">Shift+/</kbd> to toggle this panel
        </p>
      </div>
    </div>
  );
}
