"use client";

import { useEffect, useState } from "react";
import { setAoiDraw } from "@/lib/aoi-draw-store";

type AoiShape = "polygon" | "circle" | "rectangle";
type Aoi = { id: string; name: string; shape: AoiShape; active: boolean };

const SHAPE_ICON: Record<AoiShape, string> = {
  polygon: "⬡",
  circle: "○",
  rectangle: "▭",
};

const SHAPE_LABEL: Record<AoiShape, string> = {
  polygon: "Polygon",
  circle: "Circle",
  rectangle: "Rectangle",
};

export function AoiDrawPanel() {
  const [aois, setAois] = useState<Aoi[]>([
    { id: "aoi-1", name: "Kharkiv Oblast", shape: "polygon", active: true },
    { id: "aoi-2", name: "Black Sea corridor", shape: "rectangle", active: false },
  ]);
  const [drawing, setDrawing] = useState<AoiShape | null>(null);

  // Sync draw state to global store so AoiPopup can read it.
  useEffect(() => {
    setAoiDraw(drawing);
  }, [drawing]);

  // Simulate draw: auto-create AOI after 3 s.
  useEffect(() => {
    if (!drawing) return;
    const t = setTimeout(() => {
      const id = `aoi-${Date.now()}`;
      setAois((prev) => [
        ...prev,
        { id, name: `New ${drawing} AOI`, shape: drawing, active: true },
      ]);
      setDrawing(null);
    }, 3000);
    return () => clearTimeout(t);
  }, [drawing]);

  function startDraw(shape: AoiShape) {
    setDrawing(shape);
  }

  function cancelDraw() {
    setDrawing(null);
  }

  function toggleActive(id: string) {
    setAois((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
  }

  function deleteAoi(id: string) {
    setAois((prev) => prev.filter((a) => a.id !== id));
  }

  function handleAlertBell() {
    document.dispatchEvent(
      new CustomEvent("aegis:palette-action", {
        detail: { action: "create-alert" },
      }),
    );
  }

  return (
    <div className="mt-4 border-t border-border-subtle pt-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          AOI Monitor
        </span>
        <button
          onClick={() => startDraw("polygon")}
          className="rounded bg-accent/10 px-2 py-1 text-[10px] text-accent hover:bg-accent/20"
        >
          + Draw
        </button>
      </div>

      {/* Draw tool selector */}
      {drawing !== null && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            {(["polygon", "circle", "rectangle"] as AoiShape[]).map((shape) => (
              <button
                key={shape}
                onClick={() => startDraw(shape)}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                  drawing === shape
                    ? "bg-accent text-black"
                    : "bg-bg-surface text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                <span>{SHAPE_ICON[shape]}</span>
                <span>{SHAPE_LABEL[shape]}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] italic text-text-muted">
            Click on the map to draw {drawing}. Double-click to finish.
          </div>

          <button
            onClick={cancelDraw}
            className="rounded border border-border-subtle px-2 py-1 text-[11px] text-text-muted hover:bg-bg-surface hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      )}

      {/* AOI list */}
      {aois.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {aois.map((aoi) => (
            <li
              key={aoi.id}
              className="flex items-center gap-2 rounded border border-border-subtle bg-bg-surface px-2 py-1.5 text-[11px]"
            >
              {/* Color dot */}
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${aoi.active ? "bg-accent" : "bg-text-muted"}`}
              />

              {/* Name */}
              <span className="min-w-0 flex-1 truncate text-text-primary">{aoi.name}</span>

              {/* Shape badge */}
              <span className="shrink-0 rounded bg-bg-elevated px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                {aoi.shape}
              </span>

              {/* Alert bell */}
              <button
                onClick={handleAlertBell}
                title="Create alert for this AOI"
                className="shrink-0 text-text-muted hover:text-accent"
                aria-label={`Create alert for ${aoi.name}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* Active toggle */}
              <button
                onClick={() => toggleActive(aoi.id)}
                title={aoi.active ? "Deactivate AOI" : "Activate AOI"}
                className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  aoi.active
                    ? "bg-accent/20 text-accent hover:bg-accent/30"
                    : "bg-bg-elevated text-text-muted hover:bg-bg-surface"
                }`}
              >
                {aoi.active ? "ON" : "OFF"}
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteAoi(aoi.id)}
                title="Delete AOI"
                aria-label={`Delete ${aoi.name}`}
                className="shrink-0 text-text-muted hover:text-red-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {aois.length === 0 && drawing === null && (
        <p className="mt-2 text-[11px] text-text-muted">
          No areas defined. Click &quot;+ Draw&quot; to create one.
        </p>
      )}
    </div>
  );
}
