/**
 * Per-layer time filtering — independent time windows per map layer.
 * Фільтрація часу для кожного шару — незалежні часові вікна для кожного шару карти.
 *
 * Each layer can have its own [fromIso, toIso] window, or be governed by the
 * global window. The LayerTimeFilterStore manages all per-layer windows and
 * supports bulk global overrides.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Default time window width in hours. */
export const DEFAULT_TIME_WINDOW_HOURS = 24;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LayerTimeWindow {
  layerId: string;
  fromIso: string;
  toIso: string;
  enabled: boolean;
}

export interface LayerTimeFilter {
  filters: LayerTimeWindow[];
  globalWindow: {
    fromIso: string;
    toIso: string;
  };
}

// ── Builder function ──────────────────────────────────────────────────────────

/**
 * Build a LayerTimeWindow for a single layer.
 * Побудова LayerTimeWindow для одного шару.
 */
export function buildTimeWindowFilter(
  layerId: string,
  window: { fromIso: string; toIso: string },
): LayerTimeWindow {
  return {
    layerId,
    fromIso: window.fromIso,
    toIso: window.toIso,
    enabled: true,
  };
}

// ── Store class ───────────────────────────────────────────────────────────────

class LayerTimeFilterStore {
  private filters = new Map<string, LayerTimeWindow>();
  private globalWindow: { fromIso: string; toIso: string };

  constructor() {
    const now = new Date();
    const from = new Date(now.getTime() - DEFAULT_TIME_WINDOW_HOURS * 60 * 60 * 1000);
    this.globalWindow = {
      fromIso: from.toISOString(),
      toIso: now.toISOString(),
    };
  }

  /** Set or replace the time window for a layer. */
  setFilter(filter: LayerTimeWindow): void {
    this.filters.set(filter.layerId, filter);
  }

  /** Get the active time window for a layer (falls back to global if not set). */
  getFilter(layerId: string): LayerTimeWindow {
    const f = this.filters.get(layerId);
    if (f) return f;
    return {
      layerId,
      fromIso: this.globalWindow.fromIso,
      toIso: this.globalWindow.toIso,
      enabled: true,
    };
  }

  /** Remove a per-layer filter so the layer falls back to global window. */
  resetLayer(layerId: string): void {
    this.filters.delete(layerId);
  }

  /** Remove all per-layer filters. */
  resetAll(): void {
    this.filters.clear();
  }

  /**
   * Override the global window and apply it to all layers that don't
   * have an explicit per-layer filter.
   * Перезаписати глобальне вікно і застосувати його до всіх шарів без явного фільтра.
   */
  applyGlobal(window: { fromIso: string; toIso: string }): void {
    this.globalWindow = window;
  }

  /** Return the current global window. */
  getGlobalWindow(): { fromIso: string; toIso: string } {
    return { ...this.globalWindow };
  }

  /** Snapshot of all explicitly-set per-layer filters. */
  listFilters(): LayerTimeWindow[] {
    return [...this.filters.values()];
  }
}

/** Singleton store instance. */
export const layerTimeFilterStore = new LayerTimeFilterStore();

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const LAYER_TIME_NOTES_EN: Record<string, string> = {
  'independent-per-layer':
    'Each layer maintains its own time window independently. ' +
    'Useful for comparing a drone layer at T-1h with a missile layer at T-6h on the same map.',
  'global-override':
    'applyGlobal() sets the fallback window for all layers without an explicit filter. ' +
    'Used when the analyst drags the main timeline scrubber.',
};

export const LAYER_TIME_NOTES_UK: Record<string, string> = {
  'independent-per-layer':
    'Кожен шар підтримує власне часове вікно незалежно. ' +
    'Корисно для порівняння шару дронів за T-1год із шаром ракет за T-6год на одній карті.',
  'global-override':
    'applyGlobal() встановлює резервне вікно для всіх шарів без явного фільтра. ' +
    'Використовується, коли аналітик переміщує головний скрубер часової шкали.',
};
