/**
 * Central keyboard-shortcut registry.
 *
 * Single source of truth for all keyboard shortcuts, so the "?" cheat sheet
 * stays in sync with the actual handlers. Avoids AltGr conflicts (no plain
 * Alt+letter combos that collide with EU keyboard layouts).
 */

export type ShortcutScope = "global" | "map" | "list" | "modal" | "search";

export interface ShortcutDef {
  id: string;
  /** Key combination, e.g. "mod+k" (mod = Cmd on macOS, Ctrl elsewhere) */
  combo: string;
  scope: ShortcutScope;
  /** Localized descriptions for the cheat sheet */
  description: { en: string; uk: string };
  /** Whether this shortcut works while focus is in a text input */
  worksInInput?: boolean;
}

export const SHORTCUTS: ShortcutDef[] = [
  // ── Global ───────────────────────────────────────────────────────────────
  { id: "command-palette", combo: "mod+k", scope: "global", description: { en: "Open command palette", uk: "Відкрити палітру команд" }, worksInInput: true },
  { id: "search", combo: "/", scope: "global", description: { en: "Focus search", uk: "Перейти до пошуку" } },
  { id: "help", combo: "shift+/", scope: "global", description: { en: "Show keyboard shortcuts", uk: "Показати клавіатурні скорочення" } },
  { id: "go-map", combo: "g m", scope: "global", description: { en: "Go to map", uk: "Перейти до карти" } },
  { id: "go-alerts", combo: "g a", scope: "global", description: { en: "Go to alerts", uk: "Перейти до сповіщень" } },
  { id: "go-reports", combo: "g r", scope: "global", description: { en: "Go to reports", uk: "Перейти до звітів" } },
  { id: "go-cases", combo: "g c", scope: "global", description: { en: "Go to cases", uk: "Перейти до справ" } },
  { id: "toggle-theme", combo: "mod+shift+l", scope: "global", description: { en: "Toggle light/dark theme", uk: "Перемкнути світлу/темну тему" } },

  // ── Map workspace (keyboard alternative to mouse pan/zoom) ────────────────
  { id: "map-pan-up", combo: "up", scope: "map", description: { en: "Pan map up", uk: "Зсунути карту вгору" } },
  { id: "map-pan-down", combo: "down", scope: "map", description: { en: "Pan map down", uk: "Зсунути карту вниз" } },
  { id: "map-pan-left", combo: "left", scope: "map", description: { en: "Pan map left", uk: "Зсунути карту вліво" } },
  { id: "map-pan-right", combo: "right", scope: "map", description: { en: "Pan map right", uk: "Зсунути карту вправо" } },
  { id: "map-zoom-in", combo: "+", scope: "map", description: { en: "Zoom in", uk: "Збільшити" } },
  { id: "map-zoom-out", combo: "-", scope: "map", description: { en: "Zoom out", uk: "Зменшити" } },
  { id: "map-next-event", combo: "j", scope: "map", description: { en: "Select next event", uk: "Наступна подія" } },
  { id: "map-prev-event", combo: "k", scope: "map", description: { en: "Select previous event", uk: "Попередня подія" } },
  { id: "map-open-event", combo: "enter", scope: "map", description: { en: "Open selected event", uk: "Відкрити обрану подію" } },
  { id: "map-toggle-layers", combo: "l", scope: "map", description: { en: "Toggle layer panel", uk: "Перемкнути панель шарів" } },

  // ── List / table ─────────────────────────────────────────────────────────
  { id: "list-next", combo: "j", scope: "list", description: { en: "Next item", uk: "Наступний елемент" } },
  { id: "list-prev", combo: "k", scope: "list", description: { en: "Previous item", uk: "Попередній елемент" } },
  { id: "list-open", combo: "enter", scope: "list", description: { en: "Open item", uk: "Відкрити елемент" } },
  { id: "list-select", combo: "x", scope: "list", description: { en: "Toggle selection", uk: "Перемкнути вибір" } },

  // ── Modal ────────────────────────────────────────────────────────────────
  { id: "modal-close", combo: "escape", scope: "modal", description: { en: "Close dialog", uk: "Закрити діалог" }, worksInInput: true },
  { id: "modal-confirm", combo: "mod+enter", scope: "modal", description: { en: "Confirm / submit", uk: "Підтвердити" }, worksInInput: true },
];

/** Detect macOS for `mod` → Cmd vs Ctrl display. */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/** Render a combo for display, e.g. "mod+k" → "⌘K" (mac) or "Ctrl+K". */
export function formatCombo(combo: string): string {
  const mac = isMac();
  return combo
    .split("+")
    .map((part) => {
      switch (part) {
        case "mod": return mac ? "⌘" : "Ctrl";
        case "shift": return mac ? "⇧" : "Shift";
        case "alt": return mac ? "⌥" : "Alt";
        case "enter": return "↵";
        case "escape": return "Esc";
        case "up": return "↑";
        case "down": return "↓";
        case "left": return "←";
        case "right": return "→";
        default: return part.length === 1 ? part.toUpperCase() : part;
      }
    })
    .join(mac ? "" : "+");
}

/** Group shortcuts by scope for the cheat-sheet UI. */
export function shortcutsByScope(): Record<ShortcutScope, ShortcutDef[]> {
  const grouped = {} as Record<ShortcutScope, ShortcutDef[]>;
  for (const s of SHORTCUTS) {
    (grouped[s.scope] ??= []).push(s);
  }
  return grouped;
}

/**
 * Normalise a KeyboardEvent into a combo string for matching against the registry.
 * Handles the `mod` abstraction (Cmd on mac, Ctrl elsewhere).
 */
export function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = [];
  const mod = isMac() ? e.metaKey : e.ctrlKey;
  if (mod) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  const key = e.key.toLowerCase();
  const named: Record<string, string> = {
    arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right",
    " ": "space", escape: "escape", enter: "enter",
  };
  parts.push(named[key] ?? key);
  return parts.join("+");
}

/** Whether the active element is a text-entry field (to gate non-input shortcuts). */
export function isTextInputFocused(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || (el as HTMLElement).isContentEditable;
}
