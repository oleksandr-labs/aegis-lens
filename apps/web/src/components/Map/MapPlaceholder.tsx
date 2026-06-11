"use client";

import { useEffect, useRef } from "react";

/**
 * Workspace map placeholder.
 *
 * In Sprint 1 this becomes a real Mapbox GL JS instance with deck.gl overlays.
 * For Sprint 0 we render a deterministic grid placeholder so the workspace
 * shell is honest about its state.
 *
 * Once `NEXT_PUBLIC_MAPBOX_TOKEN` is set, we'll lazy-init mapbox-gl here.
 */
export function MapPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "#0a0d12";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(78,161,255,0.08)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label="Map placeholder" />;
}
