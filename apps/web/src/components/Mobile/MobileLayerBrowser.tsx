"use client";

import { useState } from "react";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { useFilters } from "@/lib/use-filters";
import type { EventClass } from "@aegis/types";
import { BottomSheet } from "./BottomSheet";

export function MobileLayerBrowser() {
  const f = useFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeClasses = f.classes;
  const isAll = activeClasses.length === 0;

  return (
    <>
      {/* Horizontal scrollable chips row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* "All" chip */}
        <button
          onClick={() => f.setClasses([])}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            isAll
              ? "border-transparent bg-accent text-black"
              : "border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary"
          }`}
        >
          All
        </button>

        {ALL_CLASSES.map((c) => {
          const active = isAll || activeClasses.includes(c.id as EventClass);
          return (
            <button
              key={c.id}
              onClick={() => f.toggleClass(c.id as EventClass)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-transparent bg-bg-elevated text-text-primary"
                  : "border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: CLASS_COLOR[c.id as EventClass] }}
              />
              {c.label}
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:border-border-default hover:text-text-secondary"
        >
          More ▾
        </button>
      </div>

      {/* Full layer browser in a BottomSheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Map Layers"
        snapPoints={[360, 560]}
        defaultSnap={0}
      >
        <p className="mb-3 text-xs text-text-muted">
          Tap to toggle. Empty selection shows all.
        </p>

        {/* Reset button */}
        <button
          onClick={() => f.setClasses([])}
          className={`mb-4 w-full rounded border px-3 py-2 text-sm font-medium transition-colors ${
            isAll
              ? "border-accent bg-accent/10 text-accent"
              : "border-border-subtle text-text-muted hover:bg-bg-elevated"
          }`}
        >
          Show all layers
        </button>

        <div className="grid grid-cols-2 gap-2">
          {ALL_CLASSES.map((c) => {
            const active = activeClasses.includes(c.id as EventClass);
            return (
              <button
                key={c.id}
                onClick={() => f.toggleClass(c.id as EventClass)}
                className={`flex items-center gap-2 rounded border p-3 text-left text-sm transition-colors ${
                  active || isAll
                    ? "border-border-default bg-bg-elevated text-text-primary"
                    : "border-border-subtle text-text-muted"
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: CLASS_COLOR[c.id as EventClass] }}
                />
                <span className="text-xs leading-tight">{c.label}</span>
                {active && !isAll && (
                  <span className="ml-auto text-[10px] text-accent">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => { f.setClasses([]); setSheetOpen(false); }}
            className="flex-1 rounded border border-border-subtle px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated"
          >
            Reset
          </button>
          <button
            onClick={() => setSheetOpen(false)}
            className="flex-1 rounded bg-accent px-3 py-2 text-sm font-semibold text-black"
          >
            Apply
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
