/**
 * Geo Service — Human-Override Channel
 *
 * Reviewers can submit corrections to geo results.
 * Approved corrections are queued for model retraining.
 *
 * Flow: submitOverride() → pending queue → approveOverride() → training queue
 */

import type { GeoResult } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Admin hierarchy level (mirrors AdminRegion.level in types.ts) */
export type AdminLevel = 0 | 1 | 2 | 3 | 4;

export interface GeoOverride {
  id: string;
  originalResult: GeoResult;
  /** WGS-84 [longitude, latitude] */
  correctedCoord: [number, number];
  correctedAdminLevel: AdminLevel;
  reviewer: string;
  reason: string;
  /** ISO-8601 */
  createdAt: string;
}

export type PendingGeoOverride = GeoOverride & { _approved: false };
export type ApprovedGeoOverride = GeoOverride & { _approved: true; approvedAt: string };

type StoredOverride = PendingGeoOverride | ApprovedGeoOverride;

// ── Store interface ───────────────────────────────────────────────────────────

export interface OverrideStore {
  submitOverride(
    override: Omit<GeoOverride, "id" | "createdAt">,
  ): GeoOverride;

  getPendingOverrides(): GeoOverride[];

  approveOverride(id: string): void;

  getTrainingQueue(): GeoOverride[];
}

// ── In-memory implementation ──────────────────────────────────────────────────

let _idSeq = 0;

export class InMemoryOverrideStore implements OverrideStore {
  private readonly store = new Map<string, StoredOverride>();

  submitOverride(
    params: Omit<GeoOverride, "id" | "createdAt">,
  ): GeoOverride {
    const id = `geo-override-${++_idSeq}-${Date.now()}`;
    const override: PendingGeoOverride = {
      id,
      createdAt: new Date().toISOString(),
      originalResult: params.originalResult,
      correctedCoord: params.correctedCoord,
      correctedAdminLevel: params.correctedAdminLevel,
      reviewer: params.reviewer,
      reason: params.reason,
      _approved: false,
    };
    this.store.set(id, override);
    return override;
  }

  getPendingOverrides(): GeoOverride[] {
    return [...this.store.values()]
      .filter((o): o is PendingGeoOverride => !o._approved)
      .map(stripInternalFields);
  }

  approveOverride(id: string): void {
    const entry = this.store.get(id);
    if (!entry) {
      throw new Error(`GeoOverride not found: ${id}`);
    }
    if (entry._approved) {
      // Already approved — idempotent
      return;
    }
    const approved: ApprovedGeoOverride = {
      ...(entry as PendingGeoOverride),
      _approved: true,
      approvedAt: new Date().toISOString(),
    };
    this.store.set(id, approved);
  }

  getTrainingQueue(): GeoOverride[] {
    return [...this.store.values()]
      .filter((o): o is ApprovedGeoOverride => o._approved)
      .map(stripInternalFields);
  }

  /** Total overrides in store */
  get size(): number {
    return this.store.size;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripInternalFields(o: StoredOverride): GeoOverride {
  const { _approved, ...rest } = o as ApprovedGeoOverride;
  void _approved;
  return rest as GeoOverride;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createOverrideStore(): OverrideStore {
  return new InMemoryOverrideStore();
}
