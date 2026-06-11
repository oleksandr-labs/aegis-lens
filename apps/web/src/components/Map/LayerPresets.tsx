"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/lib/use-filters";
import type { EventClass } from "@aegis/types";

const PRESETS: { id: string; label: string; classes: EventClass[] }[] = [
  { id: "conflict",       label: "Conflict",      classes: ["military_action", "civilian_alert"] },
  { id: "humanitarian",   label: "Humanitarian",  classes: ["humanitarian", "civilian_alert"] },
  { id: "infrastructure", label: "Infra",         classes: ["infrastructure", "environmental"] },
  { id: "maritime",       label: "Maritime",      classes: ["maritime", "aviation"] },
  { id: "all",            label: "All",           classes: [] },
];

/**
 * Returns the preset id whose class list exactly matches the current filter,
 * or null if no preset matches.
 */
function matchPreset(classes: EventClass[]): string | null {
  for (const p of PRESETS) {
    if (p.classes.length === 0 && classes.length === 0) return p.id;
    if (
      p.classes.length === classes.length &&
      p.classes.every((c) => classes.includes(c))
    ) {
      return p.id;
    }
  }
  return null;
}

export function LayerPresets() {
  const f = useFilters();
  const [activePreset, setActivePreset] = useState<string | null>(
    () => matchPreset(f.classes as EventClass[]),
  );

  // When external class toggle changes filters, deactivate preset if it no longer matches
  useEffect(() => {
    const matched = matchPreset(f.classes as EventClass[]);
    setActivePreset(matched);
  }, [f.classes]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    f.setClasses(preset.classes);
    setActivePreset(preset.id);
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Presets
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              aria-pressed={isActive}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-accent text-black"
                  : "bg-bg-surface text-text-muted hover:bg-bg-surface/80 hover:text-text-primary"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
