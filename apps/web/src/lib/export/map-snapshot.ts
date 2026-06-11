/**
 * Map snapshot export (PNG / SVG) — job queue, config types, defaults, and notes.
 * Експорт знімків карти (PNG / SVG) — черга завдань, типи конфігурації, типові значення та нотатки.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MapSnapshotConfig {
  /** Bounding box [west, south, east, north] in WGS84 degrees */
  bbox: [number, number, number, number];
  zoom: number;
  layers: string[];
  width: number;
  height: number;
  format: "png" | "svg";
  includeWatermark: boolean;
}

export interface MapSnapshotJob {
  jobId: string;
  config: MapSnapshotConfig;
  status: "queued" | "rendering" | "done" | "failed";
  downloadUrl?: string;
  createdAt: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const MAP_SNAPSHOT_DEFAULTS = {
  width: 1200,
  height: 800,
  format: "png" as const,
  includeWatermark: true,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Server-side Mapbox Static Images API renders the snapshot without a browser */
export const MAP_SNAPSHOT_NOTE_API_EN =
  "Server-side rendering via the Mapbox Static Images API — no headless browser required; supports all active map layers including heatmaps, AOIs, and event markers.";
export const MAP_SNAPSHOT_NOTE_API_UK =
  "Серверний рендер через Mapbox Static Images API — headless-браузер не потрібен; підтримує всі активні шари карти, включаючи теплові карти, AOI та маркери подій.";

/** Enterprise plans can disable the Aegis Lens watermark */
export const MAP_SNAPSHOT_NOTE_WATERMARK_EN =
  "Enterprise plans can disable the Aegis Lens watermark overlay; set includeWatermark to false to produce clean exports for embedding in external reports or publications.";
export const MAP_SNAPSHOT_NOTE_WATERMARK_UK =
  "Enterprise-плани можуть вимкнути накладення водяного знаку Aegis Lens; встановіть includeWatermark у false для отримання чистих експортів для вбудовування у зовнішні звіти або публікації.";

export const MAP_SNAPSHOT_NOTES_EN = [
  MAP_SNAPSHOT_NOTE_API_EN,
  MAP_SNAPSHOT_NOTE_WATERMARK_EN,
];
export const MAP_SNAPSHOT_NOTES_UK = [
  MAP_SNAPSHOT_NOTE_API_UK,
  MAP_SNAPSHOT_NOTE_WATERMARK_UK,
];

// ── Queue ─────────────────────────────────────────────────────────────────────

/**
 * In-memory map snapshot export job queue.
 * Черга завдань експорту знімків карти в пам'яті.
 */
export class MapSnapshotQueue {
  private readonly jobs = new Map<string, MapSnapshotJob>();

  /** Submit a new map snapshot job and return the created job record. */
  submit(config: MapSnapshotConfig): MapSnapshotJob {
    const job: MapSnapshotJob = {
      jobId: `snap_${randomUUID()}`,
      config,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  /** Get the current status of a snapshot job by ID. */
  getStatus(jobId: string): MapSnapshotJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  listJobs(limit = 50): MapSnapshotJob[] {
    const all = Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return all.slice(0, limit);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory map snapshot queue singleton. */
export const mapSnapshotQueue = new MapSnapshotQueue();
