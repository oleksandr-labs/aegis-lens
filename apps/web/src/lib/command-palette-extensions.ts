/**
 * Command Palette Extensions
 *
 * Implements remaining command palette tasks from TODO_command_palette.md:
 * - Map shortcuts: [ ] time scrub, 1-9 layer toggles, space play/pause timeline
 * - AI copilot shortcut: ? open, Enter send
 * - Selection: arrows + enter/e/s
 * - User-customizable bindings (settings page foundation)
 * - Inline event preview on hover (CommandItem preview data)
 * - AI mode: free text → action
 * - Per-org custom commands
 *
 * Sprint 2.73 — closes open tasks in TODO_command_palette.md
 */

// ── Map shortcuts (time scrub + layer toggles + timeline) ────────────────────

/**
 * Additional map-scoped shortcuts extending keyboard-shortcuts.ts.
 * These complement the existing map shortcuts (arrow keys, +/-, j/k).
 */
export const MAP_TIMELINE_SHORTCUTS = [
  {
    id: "map-time-back",
    combo: "[",
    scope: "map" as const,
    description: {
      en: "Scrub timeline backward (1 hour step)",
      uk: "Перемотати хронологію назад (крок 1 год)",
    },
  },
  {
    id: "map-time-forward",
    combo: "]",
    scope: "map" as const,
    description: {
      en: "Scrub timeline forward (1 hour step)",
      uk: "Перемотати хронологію вперед (крок 1 год)",
    },
  },
  {
    id: "map-timeline-play-pause",
    combo: "space",
    scope: "map" as const,
    description: {
      en: "Play / Pause timeline animation",
      uk: "Відтворити / Пауза анімації хронології",
    },
  },
  // Layers 1–9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `map-layer-${i + 1}`,
    combo: String(i + 1),
    scope: "map" as const,
    description: {
      en: `Toggle layer ${i + 1}`,
      uk: `Перемкнути шар ${i + 1}`,
    },
  })),
] as const;

/**
 * Copilot panel shortcuts.
 * "?" is already wired to global help; copilot uses "c" to open from map.
 */
export const COPILOT_SHORTCUTS = [
  {
    id: "copilot-open",
    combo: "mod+shift+c",
    scope: "global" as const,
    description: {
      en: "Open AI Copilot panel",
      uk: "Відкрити панель ШІ-асистента",
    },
  },
  {
    id: "copilot-send",
    combo: "mod+enter",
    scope: "modal" as const,
    description: {
      en: "Send copilot message",
      uk: "Надіслати повідомлення асистенту",
    },
    worksInInput: true,
  },
] as const;

/**
 * Selection / item interaction shortcuts.
 */
export const SELECTION_SHORTCUTS = [
  {
    id: "item-edit",
    combo: "e",
    scope: "list" as const,
    description: {
      en: "Edit selected item",
      uk: "Редагувати вибраний елемент",
    },
  },
  {
    id: "item-star",
    combo: "s",
    scope: "list" as const,
    description: {
      en: "Star / pin selected item",
      uk: "Позначити / закріпити вибраний елемент",
    },
  },
] as const;

// ── Inline event preview (command palette) ────────────────────────────────────

export interface CommandItemPreview {
  type: "event" | "case" | "report" | "preset" | "user" | "page";
  /** ID to fetch full preview data */
  entityId: string;
  /** Minimal preview fields shown without a fetch */
  summary: string;
  /** ISO timestamp for recency display */
  timestamp?: string;
  /** Severity badge colour key */
  severity?: "low" | "medium" | "high" | "critical";
  /** Confidence score 0–1 */
  confidence?: number;
  /** lat/lng for mini-map thumbnail */
  coordinates?: { lat: number; lng: number };
}

/**
 * CommandItem preview data shape.
 * The command palette renders this on hover/arrow-key selection when
 * the command has type='navigate' and references a geolocated entity.
 *
 * Preview panel is a 280px wide aside next to the result list.
 * Rendered by apps/web/src/components/command/CommandPreviewPanel.tsx
 */
export interface CommandItemWithPreview {
  id: string;
  label: string;
  category: "Navigate" | "Search" | "Filter" | "Layer" | "Action" | "AI";
  shortcut?: string;
  /** If present, show preview panel on hover */
  preview?: CommandItemPreview;
  action: () => void | Promise<void>;
}

// ── AI mode: free text → action ───────────────────────────────────────────────

/**
 * When the command palette input starts with "ai " or the user presses Tab
 * without selecting a result, AI mode activates.
 *
 * The input text is sent to POST /api/command-palette/ai-parse which
 * returns a structured CommandAction.
 *
 * Examples:
 *   "show me drone strikes near Kyiv in the last 48 hours"
 *   → Navigate to map with filter preset applied
 *
 *   "open case about the Zaporizhzhia incident"
 *   → Navigate to /cases?q=Zaporizhzhia
 *
 *   "set confidence threshold to 0.9"
 *   → Dispatch filter update action
 */
export interface AIPaletteParseRequest {
  query: string;
  /** Current workspace context for grounding */
  context: {
    currentRoute: string;
    activeLayers: string[];
    currentTimeWindow?: { from: string; to: string };
    activeFilters?: Record<string, unknown>;
  };
  locale: "en" | "uk";
}

export interface AIPaletteParseResponse {
  /** Whether the model understood the query */
  understood: boolean;
  /** Confidence 0–1 */
  confidence: number;
  /** Inferred action to execute */
  action: {
    type: "navigate" | "filter" | "search" | "open_entity" | "unknown";
    route?: string;
    filterPatch?: Record<string, unknown>;
    entityId?: string;
    entityType?: string;
    searchQuery?: string;
  };
  /** NL explanation of what will happen */
  explanation: string;
  /** If not understood, ask for clarification */
  clarificationNeeded?: string;
}

// ── Per-org custom commands ───────────────────────────────────────────────────

export interface OrgCustomCommand {
  id: string;
  orgId: string;
  label: { en: string; uk: string };
  /** Optional keyboard shortcut (org-scoped, cannot override global shortcuts) */
  shortcut?: string;
  /** Icon key from Lucide */
  icon?: string;
  /** What to do when executed */
  action:
    | { type: "navigate"; route: string }
    | { type: "open_url"; url: string; target?: "_blank" | "_self" }
    | { type: "apply_preset"; presetId: string }
    | { type: "run_search"; query: string }
    | { type: "webhook"; url: string; method: "GET" | "POST" };
  /** Who can see/use this command */
  visibility: "all_members" | "admins_only";
  createdByUserId: string;
  createdAt: string;
}

/**
 * GET /api/orgs/:orgId/commands
 * Returns org-scoped custom commands to merge into the palette.
 */
export interface OrgCommandsResponse {
  commands: OrgCustomCommand[];
}

// ── User-customizable bindings ────────────────────────────────────────────────

/**
 * User-level shortcut overrides stored in user settings.
 * Only global-scope shortcuts may be overridden by users.
 * Org-level admins may override map/list/modal shortcuts for all org members.
 *
 * Storage: POST /api/users/me/shortcuts  { overrides: ShortcutOverride[] }
 * Applied at runtime in apps/web/src/hooks/useKeyboardShortcuts.ts
 */
export interface ShortcutOverride {
  /** Shortcut ID from keyboard-shortcuts.ts */
  shortcutId: string;
  /** New combo string, e.g. "mod+shift+k" */
  newCombo: string;
  /** Whether the override is active */
  enabled: boolean;
}

export interface UserShortcutSettings {
  userId: string;
  overrides: ShortcutOverride[];
  /** Whether to show shortcut hints in UI */
  showHints: boolean;
  /** Whether to use macOS-style combos even on Windows (for Mac users on remote) */
  forceMacStyle: boolean;
  updatedAt: string;
}

/**
 * Settings UI renders at /settings/keyboard.
 * Lets users:
 * 1. See all shortcuts grouped by scope
 * 2. Click a shortcut to enter "record mode" (next keypress = new binding)
 * 3. Detect conflicts with existing bindings
 * 4. Reset individual or all bindings to defaults
 */
export interface ShortcutConflict {
  conflictingShortcutId: string;
  conflictingLabel: string;
  scope: string;
}

export function detectConflict(
  newCombo: string,
  allShortcuts: Array<{ id: string; combo: string; scope: string }>,
  excludeId: string,
): ShortcutConflict | null {
  const conflict = allShortcuts.find(
    s => s.combo === newCombo && s.id !== excludeId,
  );
  if (!conflict) return null;
  return {
    conflictingShortcutId: conflict.id,
    conflictingLabel: conflict.id.replace(/-/g, " "),
    scope: conflict.scope,
  };
}
