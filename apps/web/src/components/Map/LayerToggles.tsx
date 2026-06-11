"use client";

import { useState } from "react";
import { useFilters } from "@/lib/use-filters";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { CLASS_ICON_PATH } from "@/lib/map-markers";
import { setHeatmap, useHeatmap } from "@/lib/heatmap-store";
import type { EventClass } from "@aegis/types";

type Opacities = Record<EventClass, number>;

function buildDefaultOpacities(): Opacities {
  return Object.fromEntries(ALL_CLASSES.map((c) => [c.id, 100])) as Opacities;
}

export function LayerToggles() {
  const f = useFilters();
  const showingAll = f.classes.length === 0;
  const heatmapVisible = useHeatmap();

  const [opacities, setOpacities] = useState<Opacities>(buildDefaultOpacities);

  function setOpacity(id: EventClass, value: number) {
    setOpacities((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="space-y-1 text-sm">
      {/* Heatmap toggle */}
      <div className="mb-3">
        <button
          onClick={() => setHeatmap(!heatmapVisible)}
          aria-pressed={heatmapVisible}
          className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-bg-surface ${
            heatmapVisible ? "text-text-primary" : "text-text-muted"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            Activity Heatmap
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {heatmapVisible ? "on" : "off"}
          </span>
        </button>
      </div>

      <ul className="space-y-1">
      {ALL_CLASSES.map((c) => {
        const active = showingAll || f.classes.includes(c.id);
        const opacity = opacities[c.id];

        return (
          <li key={c.id}>
            <button
              onClick={() => f.toggleClass(c.id)}
              aria-pressed={active}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-bg-surface ${
                active ? "text-text-primary" : "text-text-muted line-through"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-flex h-3 w-3 shrink-0 items-center justify-center transition-opacity"
                  style={{
                    color: CLASS_COLOR[c.id],
                    opacity: active ? opacity / 100 : 0.3,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    dangerouslySetInnerHTML={{ __html: CLASS_ICON_PATH[c.id] }}
                  />
                </span>
                {c.label}
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {active ? "on" : "off"}
              </span>
            </button>

            {/* Opacity slider — only shown when layer is active */}
            {active && (
              <div className="px-2 pb-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(c.id, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-full accent-accent"
                    aria-label={`${c.label} opacity`}
                  />
                  <span className="w-7 shrink-0 font-mono text-[10px] text-text-muted">
                    {opacity}%
                  </span>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
    </div>
  );
}
