"use client";

import { useState, useCallback } from "react";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { useFilters } from "@/lib/use-filters";
import type { EventClass } from "@aegis/types";
import { BottomSheet } from "./BottomSheet";

export function MobileMapControls() {
  const [layerSheetOpen, setLayerSheetOpen] = useState(false);
  const f = useFilters();

  const handleZoomIn = useCallback(() => {
    window.dispatchEvent(new CustomEvent("aegis:zoom-in"));
  }, []);

  const handleZoomOut = useCallback(() => {
    window.dispatchEvent(new CustomEvent("aegis:zoom-out"));
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.dispatchEvent(
          new CustomEvent("aegis:fly-to", {
            detail: { lat: pos.coords.latitude, lon: pos.coords.longitude, zoom: 12 },
          }),
        );
      },
      () => {
        // permission denied or unavailable — silently ignore
      },
    );
  }, []);

  const isAll = f.classes.length === 0;

  return (
    <>
      {/* Floating action buttons — bottom-right, above timeline bar, mobile only */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2 md:hidden">
        {/* Locate me */}
        <button
          onClick={handleLocate}
          aria-label="Locate me"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated shadow-lg text-text-primary hover:bg-bg-surface active:scale-95 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>

        {/* Zoom in */}
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated shadow-lg text-text-primary text-xl font-semibold hover:bg-bg-surface active:scale-95 transition-transform"
        >
          +
        </button>

        {/* Zoom out */}
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated shadow-lg text-text-primary text-xl font-semibold hover:bg-bg-surface active:scale-95 transition-transform"
        >
          −
        </button>

        {/* Layers FAB */}
        <button
          onClick={() => setLayerSheetOpen(true)}
          aria-label="Open layers"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg text-black font-semibold text-lg hover:opacity-90 active:scale-95 transition-transform"
        >
          ◈
        </button>
      </div>

      {/* Layer picker bottom sheet */}
      <BottomSheet
        open={layerSheetOpen}
        onClose={() => setLayerSheetOpen(false)}
        title="Map Layers"
        snapPoints={[360, 560]}
        defaultSnap={0}
      >
        <p className="mb-3 text-xs text-text-muted">
          Tap to toggle. Empty selection shows all.
        </p>

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
            const active = f.classes.includes(c.id as EventClass);
            return (
              <button
                key={c.id}
                onClick={() => f.toggleClass(c.id as EventClass)}
                className={`flex items-center gap-2 rounded border p-3 text-left transition-colors ${
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
            onClick={() => { f.setClasses([]); setLayerSheetOpen(false); }}
            className="flex-1 rounded border border-border-subtle px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated"
          >
            Reset
          </button>
          <button
            onClick={() => setLayerSheetOpen(false)}
            className="flex-1 rounded bg-accent px-3 py-2 text-sm font-semibold text-black"
          >
            Apply
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
