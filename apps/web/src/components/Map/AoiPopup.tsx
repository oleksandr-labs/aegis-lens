"use client";

import { useAoiDraw } from "@/lib/aoi-draw-store";
import { setAoiDraw } from "@/lib/aoi-draw-store";

const SHAPE_HINT: Record<string, { line1: string; line2: string }> = {
  polygon: {
    line1: "Click on the map to place points.",
    line2: "Double-click to close the shape.",
  },
  circle: {
    line1: "Click to set the center, drag to set the radius.",
    line2: "Release to finish the circle.",
  },
  rectangle: {
    line1: "Click and drag to draw the rectangle.",
    line2: "Release to finish.",
  },
};

export function AoiPopup() {
  const { shape } = useAoiDraw();

  if (!shape) return null;

  const hint = SHAPE_HINT[shape] ?? {
    line1: "Click on the map to draw.",
    line2: "Double-click to finish.",
  };

  function handleCancel() {
    setAoiDraw(null);
  }

  return (
    <div className="pointer-events-auto absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
      <div className="flex min-w-[320px] items-start gap-3 rounded border border-border-subtle bg-bg-elevated/95 px-4 py-3 shadow-xl backdrop-blur">
        {/* Pulsing indicator */}
        <span className="relative mt-0.5 flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-accent bg-transparent" />
        </span>

        {/* Text */}
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-text-primary">
            Drawing{" "}
            <span className="capitalize text-accent">{shape}</span> AOI…
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted">{hint.line1}</p>
          <p className="text-[11px] text-text-muted">{hint.line2}</p>
        </div>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          className="shrink-0 rounded border border-border-subtle px-2 py-1 text-[11px] text-text-muted hover:bg-bg-surface hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
