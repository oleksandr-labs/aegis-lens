/**
 * Client for the DeepStateMAP frontline GeoJSON source.
 *
 * DeepStateMAP serves the live map from an internal API (e.g.
 *   https://deepstatemap.live/api/history/last  → latest snapshot id
 *   https://deepstatemap.live/api/history/<id>/geojson → GeoJSON FeatureCollection
 * ). The exact endpoints/access tier are NOT a documented public contract and are
 * subject to their ToS (see COMPLIANCE.md). This client therefore:
 *
 *   1. Respects ToS by default: a single daily fetch cadence, an identifying
 *      User-Agent, a polite timeout, and NO secrets hardcoded (read from env).
 *   2. Will only hit the network when DEEPSTATE_API_BASE is set AND republication/
 *      ingestion has been cleared. Otherwise it serves a small DEMO fixture so the
 *      pipeline is exercisable without scraping their service.
 *
 * We treat DeepState colour codes as the control signal:
 *   - red-ish fill  → controlled (occupied)
 *   - the absence of an occupied polygon over previously-occupied ground → liberated
 *   - explicitly contested sectors (when present) → contested
 */

import type {
  ControlPolygon,
  ControlStatus,
  ControllingForce,
  DeepStateRawFeature,
  DeepStateRawSnapshot,
  FrontlineSnapshot,
  GeoJsonMultiPolygon,
  GeoJsonPolygon,
} from "./types";
import { buildAttribution } from "./attribution";

export interface DeepStateClientConfig {
  /** e.g. https://deepstatemap.live/api — required for live fetch; absent → demo. */
  apiBase?: string;
  userAgent?: string;
  timeoutMs?: number;
  /** Minimum seconds between live fetches (ToS-friendly daily cadence). */
  minIntervalSec?: number;
}

const DEFAULT_USER_AGENT =
  "AegisLens/1.0 (+https://aegis-lens; OSINT frontline overlay; contact: ops@aegis-lens)";

/** DeepState occupied polygons are red-family; we map that to `controlled` (ru). */
function classifyByFill(fill?: string): { status: ControlStatus; force: ControllingForce } {
  const f = (fill ?? "").toLowerCase();
  // Red / crimson family → occupied by RU.
  if (/^#?(e|f|d|c)[0-9a-f]?[0-3]/.test(f.replace("#", "")) || /red|crimson|b00|c00|e00/.test(f)) {
    return { status: "controlled", force: "ru" };
  }
  // Blue / green family → Ukrainian-held / liberated.
  if (/blue|green|0057|2e8|0a0|008/.test(f)) {
    return { status: "liberated", force: "ua" };
  }
  // Amber / grey → contested (unclear control).
  return { status: "contested", force: "unknown" };
}

/** Confidence heuristic: occupied polygons are well-tracked; contested less so. */
function confidenceFor(status: ControlStatus): number {
  switch (status) {
    case "controlled":
      return 0.9;
    case "liberated":
      return 0.8;
    case "contested":
      return 0.55;
  }
}

function isAreaGeometry(
  g: DeepStateRawFeature["geometry"],
): g is GeoJsonPolygon | GeoJsonMultiPolygon {
  return g.type === "Polygon" || g.type === "MultiPolygon";
}

export class DeepStateMapClient {
  private readonly apiBase?: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly minIntervalSec: number;
  private lastFetchMs = 0;

  constructor(config: DeepStateClientConfig = {}) {
    this.apiBase = config.apiBase ?? process.env.DEEPSTATE_API_BASE;
    this.userAgent = config.userAgent ?? DEFAULT_USER_AGENT;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minIntervalSec = config.minIntervalSec ?? 6 * 3600; // ≥ 6h; daily in practice
  }

  /** True when a live endpoint is configured; otherwise the client is demo-only. */
  get isLive(): boolean {
    return Boolean(this.apiBase);
  }

  /**
   * Fetch the latest daily snapshot and normalize it.
   * Falls back to the DEMO fixture when no apiBase is configured.
   */
  async getLatestSnapshot(): Promise<FrontlineSnapshot> {
    if (!this.isLive) return DEMO_SNAPSHOT;

    const sinceLast = (Date.now() - this.lastFetchMs) / 1000;
    if (this.lastFetchMs !== 0 && sinceLast < this.minIntervalSec) {
      // ToS-friendly: do not re-poll within the cadence window.
      return DEMO_SNAPSHOT;
    }

    const lastId = await this.fetchJson<{ id: number }>("/history/last");
    const raw = await this.fetchJson<DeepStateRawSnapshot>(`/history/${lastId.id}/geojson`);
    this.lastFetchMs = Date.now();
    const date = raw.date ?? new Date().toISOString().slice(0, 10);
    return this.normalize(raw, date);
  }

  /** Fetch a specific historical snapshot id, normalized. */
  async getSnapshotById(id: number | string): Promise<FrontlineSnapshot> {
    if (!this.isLive) return DEMO_SNAPSHOT;
    const raw = await this.fetchJson<DeepStateRawSnapshot>(`/history/${id}/geojson`);
    const date = raw.date ?? new Date().toISOString().slice(0, 10);
    return this.normalize(raw, date);
  }

  /** Normalize a raw DeepState FeatureCollection into our control-polygon model. */
  normalize(raw: DeepStateRawSnapshot, date: string): FrontlineSnapshot {
    const polygons: ControlPolygon[] = [];

    for (const feature of raw.features) {
      if (!isAreaGeometry(feature.geometry)) continue; // skip point markers here
      const { status, force } = classifyByFill(feature.properties.fill);
      const name = feature.properties.name;
      polygons.push({
        id: String(feature.id ?? `${date}-${polygons.length}`),
        status,
        force,
        geometry: feature.geometry,
        snapshotDate: date,
        confidence: confidenceFor(status),
        label: name ? { uk: name } : undefined,
        sourceFill: feature.properties.fill,
      });
    }

    const counts: Record<ControlStatus, number> = {
      controlled: polygons.filter((p) => p.status === "controlled").length,
      contested: polygons.filter((p) => p.status === "contested").length,
      liberated: polygons.filter((p) => p.status === "liberated").length,
    };

    return {
      date,
      fetchedAt: new Date().toISOString(),
      polygons,
      counts,
      attribution: buildAttribution(),
    };
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const url = `${this.apiBase}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": this.userAgent, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new DeepStateApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class DeepStateApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`DeepStateMAP API error ${status}: ${body.slice(0, 200)}`);
    this.name = "DeepStateApiError";
  }
}

// ── DEMO fixture ──────────────────────────────────────────────────────────────
// Small, illustrative control polygons near the eastern frontline. Synthetic — NOT
// real DeepState data — so the pipeline + map are usable without touching their API.

const DEMO_DATE = new Date().toISOString().slice(0, 10);

const DEMO_POLYGONS: ControlPolygon[] = [
  {
    id: "demo-occupied-donetsk",
    status: "controlled",
    force: "ru",
    snapshotDate: DEMO_DATE,
    confidence: 0.9,
    label: { en: "Occupied area (Donetsk sector)", uk: "Окупована територія (Донецький напрямок)" },
    sourceFill: "#cc0000",
    geometry: {
      type: "Polygon",
      coordinates: [[[37.6, 47.9], [38.4, 47.9], [38.4, 48.4], [37.6, 48.4], [37.6, 47.9]]],
    },
  },
  {
    id: "demo-contested-bakhmut",
    status: "contested",
    force: "unknown",
    snapshotDate: DEMO_DATE,
    confidence: 0.55,
    label: { en: "Contested zone (Bakhmut direction)", uk: "Зона бойових дій (Бахмутський напрямок)" },
    sourceFill: "#f59e0b",
    geometry: {
      type: "Polygon",
      coordinates: [[[37.95, 48.55], [38.15, 48.55], [38.15, 48.65], [37.95, 48.65], [37.95, 48.55]]],
    },
  },
  {
    id: "demo-liberated-kharkiv",
    status: "liberated",
    force: "ua",
    snapshotDate: DEMO_DATE,
    confidence: 0.8,
    label: { en: "Liberated area (Kharkiv sector)", uk: "Звільнена територія (Харківський напрямок)" },
    sourceFill: "#0057b7",
    geometry: {
      type: "Polygon",
      coordinates: [[[36.6, 49.7], [37.2, 49.7], [37.2, 50.1], [36.6, 50.1], [36.6, 49.7]]],
    },
  },
];

export const DEMO_SNAPSHOT: FrontlineSnapshot = {
  date: DEMO_DATE,
  fetchedAt: new Date().toISOString(),
  polygons: DEMO_POLYGONS,
  counts: { controlled: 1, contested: 1, liberated: 1 },
  attribution: buildAttribution(),
};
