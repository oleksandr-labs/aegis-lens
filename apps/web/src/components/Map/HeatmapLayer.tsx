"use client";

import { useEffect, useRef } from "react";
import type { AegisEvent } from "@aegis/types";

type HeatmapLayerProps = {
  events: AegisEvent[];
  visible: boolean;
  mapRef: React.MutableRefObject<any>; // MapLibreMap
};

export function HeatmapLayer({ events, visible, mapRef }: HeatmapLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current || !mapRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw radial gradients for each event at map coordinates
    for (const ev of events) {
      const point = mapRef.current.project([ev.location.lon, ev.location.lat]);
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        30,
      );
      gradient.addColorStop(0, `rgba(239, 68, 68, ${(ev.dangerScore / 100) * 0.6})`);
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - 30, point.y - 30, 60, 60);
    }
  }, [events, visible, mapRef]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={typeof window !== "undefined" ? window.innerWidth : 1920}
      height={typeof window !== "undefined" ? window.innerHeight : 1080}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
