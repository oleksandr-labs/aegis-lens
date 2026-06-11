"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AegisEvent } from "@aegis/types";
import { CLASS_COLOR } from "@/lib/filter-config";

/**
 * Read-only mini-map for embedding in region / event detail pages.
 *
 * Supports two usage modes:
 *
 * Mode A — legacy (region/oblast pages with full event list):
 *   <MiniMap center={[lon, lat]} zoom={7} events={events} height={300} />
 *
 * Mode B — lightweight point-map (single location + optional event count):
 *   <MiniMap lat={49.99} lon={36.23} zoom={7} eventCount={12} className="h-64 rounded ..." />
 */

const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OSM",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      paint: {
        "raster-saturation": -0.6,
        "raster-brightness-min": 0.05,
        "raster-brightness-max": 0.55,
      },
    },
  ],
};

// ─── Mode A props (existing usage) ───────────────────────────────────────────
type LegacyProps = {
  center: [number, number]; // [lon, lat]
  zoom?: number;
  events?: AegisEvent[];
  height?: number;
  // Mode B props must NOT be present
  lat?: never;
  lon?: never;
  eventCount?: never;
  className?: never;
};

// ─── Mode B props (new lightweight usage) ────────────────────────────────────
type PointProps = {
  lat: number;
  lon: number;
  zoom?: number;
  eventCount?: number;
  className?: string;
  // Mode A props must NOT be present
  center?: never;
  events?: never;
  height?: never;
};

type MiniMapProps = LegacyProps | PointProps;

export function MiniMap(props: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // Normalise to a common internal shape
  const isPointMode = "lat" in props && props.lat !== undefined;

  const center: [number, number] = isPointMode
    ? [props.lon!, props.lat!]
    : (props as LegacyProps).center;

  const zoom = props.zoom ?? 5;
  const events: AegisEvent[] = isPointMode ? [] : ((props as LegacyProps).events ?? []);
  const eventCount: number = isPointMode ? ((props as PointProps).eventCount ?? 0) : events.length;
  const height: number | undefined = isPointMode ? undefined : ((props as LegacyProps).height ?? 280);
  const className: string | undefined = isPointMode
    ? ((props as PointProps).className ?? "")
    : undefined;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center,
      zoom,
      attributionControl: { compact: true },
      // Point-mode: fully locked; legacy mode: allow pan/zoom
      interactive: !isPointMode,
      dragRotate: false,
      dragPan: !isPointMode,
      scrollZoom: !isPointMode,
      doubleClickZoom: !isPointMode,
    });
    mapRef.current = map;

    if (isPointMode) {
      // Single centered marker sized by event count
      if (eventCount > 0) {
        const size = Math.min(8 + eventCount * 1.5, 24);
        const el = document.createElement("span");
        el.style.cssText = `
          display:block;
          width: ${size}px; height: ${size}px;
          border-radius: 999px;
          background: #ef4444;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.25);
        `;
        el.title = `${eventCount} event${eventCount === 1 ? "" : "s"}`;
        new maplibregl.Marker({ element: el }).setLngLat(center).addTo(map);
      }
    } else {
      // Legacy: one dot per event
      for (const ev of events) {
        const el = document.createElement("span");
        const color = CLASS_COLOR[ev.class];
        el.style.cssText = `
          display:block; width: 10px; height: 10px; border-radius: 999px;
          background: ${color}; border: 2px solid rgba(255,255,255,0.85);
          cursor: pointer;
        `;
        if (ev.summary?.en) el.title = ev.summary.en;
        new maplibregl.Marker({ element: el })
          .setLngLat([ev.location.lon, ev.location.lat])
          .addTo(map);
      }
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPointMode) {
    return (
      <div
        ref={containerRef}
        className={`w-full overflow-hidden ${className ?? "h-48"}`}
        aria-label="Location map"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded border border-border-subtle"
      aria-label="Region map"
    />
  );
}
