/**
 * Mapbox / MapLibre map style configuration.
 *
 * Three style variants:
 *   - dark:     Default — dark tactical theme for OSINT analysts
 *   - satellite: Satellite imagery basemap with label overlay
 *   - print:    High-contrast for PDF/report generation
 */

export type MapStyleVariant = "dark" | "satellite" | "print";

export interface MapStyleConfig {
  variant: MapStyleVariant;
  /** Mapbox GL style URL or object */
  styleUrl: string;
  /** Fallback MapLibre-compatible style URL */
  maplibreStyleUrl?: string;
  /** Default map center [lon, lat] for Ukraine */
  defaultCenter: [number, number];
  defaultZoom: number;
  /** Min/max zoom supported */
  minZoom: number;
  maxZoom: number;
  /** Tile usage budget (tiles/month before alert) */
  tilesBudget: number;
}

export const MAP_STYLES: Record<MapStyleVariant, MapStyleConfig> = {
  dark: {
    variant: "dark",
    styleUrl: "mapbox://styles/mapbox/dark-v11",
    maplibreStyleUrl: "https://tiles.openfreemap.org/styles/dark",
    defaultCenter: [31.0, 49.0],
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 20,
    tilesBudget: 500_000,
  },
  satellite: {
    variant: "satellite",
    styleUrl: "mapbox://styles/mapbox/satellite-streets-v12",
    maplibreStyleUrl: "https://tiles.openfreemap.org/styles/positron",
    defaultCenter: [31.0, 49.0],
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 22,
    tilesBudget: 1_000_000,
  },
  print: {
    variant: "print",
    styleUrl: "mapbox://styles/mapbox/light-v11",
    maplibreStyleUrl: "https://tiles.openfreemap.org/styles/positron",
    defaultCenter: [31.0, 49.0],
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 18,
    tilesBudget: 50_000,
  },
};

/** Ukraine bounding box (west, south, east, north). */
export const UKRAINE_BBOX: [number, number, number, number] = [22.14, 44.38, 40.23, 52.38];

/** Mapbox layer style specs for Aegis Lens data layers. */
export const LAYER_PAINT_SPECS = {
  events: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 4, 12, 10],
    circleColor: [
      "match",
      ["get", "class"],
      "drone", "#f59e0b",
      "missile", "#ef4444",
      "airstrike", "#dc2626",
      "artillery", "#f97316",
      "infrastructure_damage", "#8b5cf6",
      "power_outage", "#eab308",
      "#94a3b8", // default
    ],
    circleOpacity: 0.85,
    circleStrokeWidth: 1,
    circleStrokeColor: "#1e293b",
  },
  drones: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 5, 14, 14],
    circleColor: [
      "match",
      ["get", "subtype"],
      "swarm", "#fbbf24",
      "intercept", "#22c55e",
      "launch", "#f97316",
      "#f59e0b",
    ],
    circleOpacity: 0.9,
    circleBlur: ["case", ["==", ["get", "subtype"], "sighting"], 0.3, 0],
  },
  missiles: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 4, 6, 14, 16],
    circleColor: [
      "match",
      ["get", "subtype"],
      "hypersonic", "#7c3aed",
      "ballistic", "#dc2626",
      "cruise", "#ef4444",
      "#f87171",
    ],
    circleOpacity: 0.9,
    circleStrokeWidth: 2,
    circleStrokeColor: "#ffffff",
  },
  infrastructure: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 6, 14, 18],
    circleColor: [
      "match",
      ["get", "severity"],
      "destroyed", "#991b1b",
      "major", "#b91c1c",
      "minor", "#f59e0b",
      "#94a3b8",
    ],
    circleOpacity: 0.85,
  },
  // 3D extrusion of damaged infrastructure (fill-extrusion layer, type "fill-extrusion").
  // Extrusion height encodes severity so destroyed assets visually tower over minor ones.
  infrastructure_damage: {
    fillExtrusionColor: [
      "match",
      ["get", "severity"],
      "destroyed", "#991b1b",
      "major", "#dc2626",
      "minor", "#f59e0b",
      "#94a3b8",
    ],
    fillExtrusionHeight: [
      "match",
      ["get", "severity"],
      "destroyed", 600,
      "major", 350,
      "minor", 150,
      80,
    ],
    fillExtrusionBase: 0,
    fillExtrusionOpacity: 0.8,
  },
  // Troop movement: intentionally LARGE radius + heavy blur so markers read as a
  // fuzzed area, never a precise point. Low precision is a visual guarantee here.
  troop_movement: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 24, 12, 60],
    circleColor: [
      "match",
      ["get", "side"],
      "ua", "#0057b7",
      "ru", "#cc0000",
      "#94a3b8",
    ],
    circleOpacity: 0.25,
    circleBlur: 1,
    circleStrokeWidth: 0,
  },
  powerOutages: {
    fillColor: "#fbbf24",
    fillOpacity: [
      "interpolate",
      ["linear"],
      ["get", "coverage"],
      0, 0.05,
      0.5, 0.25,
      1, 0.5,
    ],
    fillOutlineColor: "#f59e0b",
  },
  // Active fires: radius/colour scale with FRP-derived `intensity`; a pulsing
  // radiance halo (animated via `pulse` feature-state) and a smoke-direction
  // arrow rotated by `windBearing` (degrees, direction smoke travels toward).
  active_fires: {
    circleRadius: ["interpolate", ["linear"], ["get", "intensity"], 0, 3, 1, 12],
    circleColor: [
      "interpolate",
      ["linear"],
      ["get", "intensity"],
      0, "#fde047",
      0.5, "#fb923c",
      1, "#dc2626",
    ],
    circleOpacity: 0.9,
    circleStrokeWidth: 1,
    circleStrokeColor: "#7f1d1d",
    haloRadius: [
      "interpolate",
      ["linear"],
      ["coalesce", ["feature-state", "pulse"], 0],
      0, 6,
      1, 26,
    ],
    haloColor: "#f97316",
    haloOpacity: [
      "interpolate",
      ["linear"],
      ["coalesce", ["feature-state", "pulse"], 0],
      0, 0.45,
      1, 0,
    ],
    smokeIconRotate: ["coalesce", ["get", "windBearing"], 0],
    smokeIconOpacity: ["case", ["has", "windBearing"], 0.7, 0],
  },
  // Thermal heat-gradient overlay (FIRMS / SLSTR / Landsat). Coarse pixels →
  // soft heatmap; `thermalOpacity` is bound to the layer panel's opacity slider.
  thermal: {
    heatmapWeight: ["interpolate", ["linear"], ["get", "frpNorm"], 0, 0.1, 1, 1],
    heatmapIntensity: ["interpolate", ["linear"], ["zoom"], 4, 0.6, 12, 2],
    heatmapColor: [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.2, "#1e3a8a",
      0.4, "#7c3aed",
      0.6, "#f59e0b",
      0.8, "#f97316",
      1, "#dc2626",
    ],
    heatmapRadius: ["interpolate", ["linear"], ["zoom"], 4, 12, 12, 30],
    heatmapOpacity: ["coalesce", ["get", "thermalOpacity"], 0.6],
  },

  // ── Sprint 2.57 layer paint specs (merged from per-cluster handoffs) ──────────

  // Maritime (C1): heading-arrow symbol + class-color circle; sanctioned = red halo,
  // AIS-dark = amber stroke.
  maritime: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 4, 4, 12, 9],
    circleColor: [
      "match",
      ["get", "shipType"],
      "tanker", "#0ea5e9",
      "cargo", "#0066cc",
      "military", "#cc0000",
      "passenger", "#22c55e",
      "fishing", "#a16207",
      "tugboat", "#7c3aed",
      "#94a3b8",
    ],
    circleOpacity: 0.9,
    circleStrokeWidth: [
      "case",
      ["==", ["get", "sanctioned"], true], 3,
      ["==", ["get", "aisStatus"], "dark"], 2,
      1,
    ],
    circleStrokeColor: [
      "case",
      ["==", ["get", "sanctioned"], true], "#dc2626",
      ["==", ["get", "aisStatus"], "dark"], "#f59e0b",
      "#1e293b",
    ],
    iconImage: "triangle-15",
    iconRotate: ["coalesce", ["get", "headingDeg"], ["get", "courseDeg"], 0],
    iconRotationAlignment: "map",
    iconAllowOverlap: true,
    iconSize: ["interpolate", ["linear"], ["zoom"], 4, 0.6, 12, 1.1],
  },

  // Aviation (C2): heading-rotated arrow glyph colored by altitude band; military /
  // redacted aircraft fall back to a circle.
  aviation: {
    iconImage: "aircraft-arrow",
    iconRotate: ["coalesce", ["get", "headingDeg"], 0],
    iconRotationAlignment: "map",
    iconAllowOverlap: true,
    iconSize: ["interpolate", ["linear"], ["zoom"], 4, 0.5, 11, 1.1],
    iconColor: [
      "interpolate", ["linear"], ["coalesce", ["get", "baroAltitudeM"], 0],
      0, "#00ccff",
      2000, "#22c55e",
      6000, "#eab308",
      9000, "#f97316",
      12000, "#7c3aed",
    ],
    circleRadius: ["interpolate", ["linear"], ["zoom"], 4, 4, 12, 9],
    circleColor: [
      "case",
      ["==", ["get", "redacted"], true], "#64748b",
      ["==", ["get", "category"], "military"], "#ff6600",
      ["==", ["get", "category"], "cargo"], "#0066cc",
      "#00ccff",
    ],
    circleOpacity: ["case", ["==", ["get", "redacted"], true], 0.4, 0.9],
    circleStrokeWidth: ["case", ["==", ["get", "category"], "military"], 2, 1],
    circleStrokeColor: ["case", ["==", ["get", "category"], "military"], "#ffffff", "#1e293b"],
  },

  // Air-raid alerts (C3): pulsing oblast overlay. `highlight` ∈ active|recent_clear|calm.
  air_raid_alerts: {
    fillColor: [
      "match",
      ["get", "highlight"],
      "active", "#ff0000",
      "recent_clear", "#f59e0b",
      "calm", "#00aa00",
      "#94a3b8",
    ],
    fillOpacity: [
      "case",
      ["==", ["get", "highlight"], "active"],
      ["interpolate", ["linear"], ["coalesce", ["get", "intensity"], 0], 0, 0.18, 1, 0.42],
      ["==", ["get", "highlight"], "recent_clear"],
      0.16,
      0.04,
    ],
    fillOutlineColor: [
      "match",
      ["get", "highlight"],
      "active", "#ff0000",
      "recent_clear", "#f59e0b",
      "#15803d",
    ],
  },
  air_raid_alerts_outline: {
    lineColor: [
      "match",
      ["get", "highlight"],
      "active", "#ff0000",
      "recent_clear", "#f59e0b",
      "#00aa00",
    ],
    lineWidth: [
      "case",
      ["all", ["==", ["get", "highlight"], "active"], ["==", ["get", "pulse"], true]],
      ["interpolate", ["linear"], ["zoom"], 4, 1.5, 9, 3.5],
      0.75,
    ],
    lineOpacity: ["case", ["==", ["get", "highlight"], "active"], 0.9, 0.4],
  },

  // Power outages (C4): coverage-driven "lights going out" gradient (registry id keyed;
  // legacy camelCase `powerOutages` above is retained for back-compat).
  power_outages: {
    fillColor: [
      "interpolate",
      ["linear"],
      ["get", "coverage"],
      0, "#fde68a",
      0.25, "#f59e0b",
      0.5, "#b45309",
      0.75, "#3b3a6b",
      1, "#111133",
    ],
    fillOpacity: [
      "interpolate",
      ["linear"],
      ["get", "coverage"],
      0, 0.10,
      0.5, 0.45,
      1, 0.75,
    ],
    fillOutlineColor: "#f59e0b",
  },

  // Communication outages (C4): dashed severity-banded outline + faint affected fill.
  communication_outages: {
    lineColor: [
      "match",
      ["get", "band"],
      5, "#7e22ce",
      4, "#9333ea",
      3, "#a855f7",
      2, "#c084fc",
      1, "#d8b4fe",
      "#660099",
    ],
    lineWidth: ["interpolate", ["linear"], ["zoom"], 5, 1.5, 12, 3],
    lineDasharray: [2, 2],
    lineOpacity: 0.9,
    fillColor: "#660099",
    fillOpacity: [
      "interpolate",
      ["linear"],
      ["get", "index"],
      0, 0.04,
      50, 0.12,
      100, 0.25,
    ],
  },

  // Missiles arc (C6): bold ballistic trajectory line + uncertainty cone, distinct
  // from drones. Companion to the existing `missiles` circle (impact) spec.
  missilesArc: {
    lineColor: [
      "match",
      ["get", "subtype"],
      "hypersonic", "#7c3aed",
      "ballistic", "#dc2626",
      "cruise", "#ef4444",
      "#f87171",
    ],
    lineWidth: ["interpolate", ["linear"], ["zoom"], 4, 1.5, 12, 4],
    lineOpacity: 0.9,
    lineDasharray: [2, 2],
    lineCap: "round",
    coneFillColor: "#ef4444",
    coneFillOpacity: ["interpolate", ["linear"], ["get", "progress"], 0, 0.05, 1, 0.18],
  },

  // Drones arc (C6): animated mission path with trail decay; finer dash + amber hue
  // to read distinctly from missile arcs. Companion to the existing `drones` circle spec.
  dronesArc: {
    lineColor: [
      "match",
      ["get", "state"],
      "intercepted", "#22c55e",
      "ended", "#94a3b8",
      "#f59e0b",
    ],
    lineWidth: ["interpolate", ["linear"], ["zoom"], 5, 0.75, 14, 2.5],
    lineOpacity: ["interpolate", ["linear"], ["get", "progress"], 0, 0.1, 1, 0.8],
    lineDasharray: [1, 1.5],
    lineCap: "round",
  },

  // AI predicted zones (C10): hatched/dashed amber forecast overlay — distinct hue
  // reserved for predictions so it can never read as an observed polygon.
  ai_predicted_zones: {
    fillColor: "#ffcc00",
    fillOpacity: [
      "interpolate",
      ["linear"],
      ["get", "probability"],
      0, 0.04,
      0.5, 0.18,
      1, 0.35,
    ],
    fillOutlineColor: "#ffcc00",
    lineColor: "#d4a300",
    lineWidth: 1.5,
    lineDasharray: [2, 2],
    lineOpacity: 0.9,
  },

  // Social media activity (C10): pulsing orange intensity heatmap (pulse hints consumed
  // by the map animation loop, not GL paint).
  social_media_heatmap: {
    heatmapWeight: ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
    heatmapIntensity: ["interpolate", ["linear"], ["zoom"], 5, 1, 12, 3],
    heatmapColor: [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(255,102,0,0)",
      0.2, "rgba(255,140,0,0.4)",
      0.5, "rgba(255,102,0,0.65)",
      0.8, "rgba(255,69,0,0.85)",
      1, "rgba(255,30,0,0.95)",
    ],
    heatmapRadius: ["interpolate", ["linear"], ["zoom"], 5, 14, 12, 40],
    heatmapOpacity: 0.8,
  },

  // ── Sprint 2.58 data-source layer paint specs (merged from per-cluster handoffs) ──

  // Equipment losses (Oryx): per-region choropleth by cumulative count + status-colored points.
  equipment_losses: {
    fillColor: [
      "interpolate",
      ["linear"],
      ["get", "lossCount"],
      0, "#1f2937",
      5, "#7f1d1d",
      20, "#b91c1c",
      50, "#ef4444",
      100, "#fca5a5",
    ],
    fillOpacity: 0.55,
    fillOutlineColor: "#1e293b",
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 3, 12, 9],
    circleColor: [
      "match",
      ["get", "status"],
      "destroyed", "#b91c1c",
      "damaged", "#f59e0b",
      "abandoned", "#6b7280",
      "captured", "#2563eb",
      "#94a3b8",
    ],
    circleOpacity: 0.85,
    circleStrokeWidth: 1,
    circleStrokeColor: "#0f172a",
  },

  // Frontline control (DeepStateMAP): 3 control states, confidence-aware opacity.
  frontline_control: {
    fillColor: [
      "match",
      ["get", "status"],
      "controlled", "#cc0000",
      "contested", "#f59e0b",
      "liberated", "#0057b7",
      "#9ca3af",
    ],
    fillOpacity: [
      "case",
      ["<", ["get", "confidence"], 0.5], 0.2,
      ["==", ["get", "status"], "contested"], 0.25,
      ["==", ["get", "status"], "liberated"], 0.4,
      0.5,
    ],
    fillOutlineColor: [
      "match",
      ["get", "status"],
      "controlled", "#7f1d1d",
      "contested", "#b45309",
      "liberated", "#1e3a8a",
      "#4b5563",
    ],
  },

  // Cyber incidents (CERT-UA): per-region intensity heatmap + sector-colored fallback circles.
  cyber_incidents: {
    heatmapWeight: ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 100, 1],
    heatmapIntensity: ["interpolate", ["linear"], ["zoom"], 4, 1, 9, 3],
    heatmapRadius: ["interpolate", ["linear"], ["zoom"], 4, 20, 9, 60],
    heatmapColorRamp: [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.2, "#1e3a8a",
      0.4, "#7c3aed",
      0.6, "#f59e0b",
      0.8, "#ef4444",
      1.0, "#dc2626",
    ],
    circleRadius: ["interpolate", ["linear"], ["get", "intensity"], 0, 4, 100, 28],
    circleColor: [
      "match", ["get", "topSector"],
      "energy", "#dc2626",
      "telecom", "#2563eb",
      "finance", "#16a34a",
      "gov", "#7c3aed",
      "media", "#f59e0b",
      "#94a3b8",
    ],
    circleOpacity: ["interpolate", ["linear"], ["get", "intensity"], 0, 0.25, 100, 0.85],
    circleStrokeWidth: 1,
    circleStrokeColor: "#0f172a",
  },

  // Emergencies (DSNS): event-type colored markers; white ring marks an evacuation order.
  emergencies: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 5, 5, 14, 15],
    circleColor: [
      "match",
      ["get", "type"],
      "fire", "#ef4444",
      "explosion", "#dc2626",
      "collapse", "#a16207",
      "rescue", "#0ea5e9",
      "demining", "#16a34a",
      "flood", "#2563eb",
      "hazmat", "#9333ea",
      "evacuation", "#f97316",
      "#94a3b8",
    ],
    circleOpacity: 0.9,
    circleStrokeWidth: 2,
    circleStrokeColor: ["case", ["==", ["get", "evacuationOrdered"], true], "#ffffff", "#1e293b"],
  },

  // Humanitarian (UN OCHA): displacement-intensity choropleth circles.
  humanitarian: {
    circleRadius: ["interpolate", ["linear"], ["get", "intensity"], 0, 8, 1, 40],
    circleColor: [
      "interpolate",
      ["linear"],
      ["get", "intensity"],
      0, "#1d4ed8",
      0.5, "#f59e0b",
      1, "#b91c1c",
    ],
    circleOpacity: 0.45,
    circleBlur: 0.4,
    circleStrokeWidth: 1,
    circleStrokeColor: "#0f172a",
  },

  // Humanitarian aid corridors (UN OCHA): access-status colored lines.
  humanitarian_corridors: {
    lineColor: [
      "match",
      ["get", "access"],
      "open", "#22c55e",
      "constrained", "#f59e0b",
      "blocked", "#dc2626",
      "#94a3b8",
    ],
    lineWidth: ["interpolate", ["linear"], ["zoom"], 5, 2, 12, 6],
    lineDasharray: ["case", ["==", ["get", "access"], "open"], ["literal", [1]], ["literal", [2, 2]]],
    lineOpacity: 0.85,
  },

  // ── Sprint 2.59 data-source layer paint specs (merged from per-cluster handoffs) ──

  // Crisis mapping (Copernicus EMS): polygon extents (flood/burn/affected) + graded points.
  crisis_mapping: {
    fillColor: [
      "match",
      ["get", "kind"],
      "flood_extent", "#2563eb",
      "burn_scar", "#7c2d12",
      "affected_area", "#9ca3af",
      "#b91c1c",
    ],
    fillOpacity: [
      "match",
      ["get", "kind"],
      "flood_extent", 0.35,
      "burn_scar", 0.4,
      "affected_area", 0.2,
      0.3,
    ],
    fillOutlineColor: "#1e293b",
    circleRadius: ["interpolate", ["linear"], ["zoom"], 8, 3, 16, 9],
    circleColor: [
      "match",
      ["get", "grade"],
      "destroyed", "#b91c1c",
      "damaged", "#f59e0b",
      "possibly_damaged", "#fde047",
      "negligible", "#22c55e",
      "#9ca3af",
    ],
    circleStrokeWidth: 1,
    circleStrokeColor: "#111827",
    circleOpacity: 0.9,
  },

  // Belarus flank (Hajun / BYPOL): low-precision POI-centroid sightings; soft blur
  // communicates uncertainty; white ring marks SAR-corroborated sightings.
  belarus_flank: {
    circleRadius: ["interpolate", ["linear"], ["zoom"], 4, 4, 12, 13],
    circleColor: [
      "match",
      ["get", "equipmentClass"],
      "rail_echelon", "#b45309",
      "armor", "#92400e",
      "sam_system", "#0e7490",
      "missile_system", "#dc2626",
      "aircraft", "#2563eb",
      "helicopter", "#3b82f6",
      "uav", "#9333ea",
      "fuel_logistics", "#ca8a04",
      "personnel", "#65a30d",
      "#94a3b8",
    ],
    circleOpacity: 0.55,
    circleBlur: 0.4,
    circleStrokeWidth: 2,
    circleStrokeColor: ["case", ["==", ["get", "sarVerified"], true], "#ffffff", "#1e293b"],
  },
};

/** Return the Mapbox access token from environment. */
export function getMapboxToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? "";
  if (!token && typeof window !== "undefined") {
    console.warn("[map-style] NEXT_PUBLIC_MAPBOX_TOKEN not set — falling back to MapLibre");
  }
  return token;
}

/** Decide whether to use Mapbox or MapLibre based on token availability. */
export function resolveStyleUrl(variant: MapStyleVariant): string {
  const config = MAP_STYLES[variant];
  const hasToken = !!getMapboxToken();
  return hasToken ? config.styleUrl : (config.maplibreStyleUrl ?? config.styleUrl);
}
