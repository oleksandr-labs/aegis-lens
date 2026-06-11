import "server-only";
import { randomUUID } from "crypto";

export interface MapViewState {
  center: [number, number]; // [lon, lat]
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface WorkspacePreset {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  ownerId: string;
  orgId: string;
  isPublic: boolean;
  /** Active layer IDs at time of save */
  activeLayers: string[];
  /** Serialised filter state */
  filters: Record<string, unknown>;
  /** Map viewport */
  mapView: MapViewState;
  /** ISO 8601 timeline window */
  timelineWindow?: { from: string; to: string };
  /** AOI IDs pinned in this preset */
  aoiIds: string[];
  /** Share token for signed URL sharing */
  shareToken?: string;
  /** ISO 8601 expiry for share link */
  shareExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PresetCreate = Omit<WorkspacePreset, "id" | "shareToken" | "shareExpiresAt" | "createdAt" | "updatedAt">;
export type PresetUpdate = Partial<Omit<WorkspacePreset, "id" | "createdAt" | "updatedAt">>;

const store = new Map<string, WorkspacePreset>();

// --- demo presets ---
const now = new Date().toISOString();

store.set("preset-001", {
  id: "preset-001",
  name: "Eastern Front Overview",
  description: "All verified military events in Donetsk + Zaporizhzhia, last 7 days.",
  tags: ["military", "eastern-front", "analyst"],
  ownerId: "user-system",
  orgId: "org-public",
  isPublic: true,
  activeLayers: ["military_action", "civilian_alerts", "power_outages"],
  filters: { class: ["military_action"], regions: ["UA-14", "UA-23"], hours: 168 },
  mapView: { center: [37.5, 48.0], zoom: 7 },
  aoiIds: [],
  createdAt: now,
  updatedAt: now,
});

store.set("preset-002", {
  id: "preset-002",
  name: "Kyiv Metro Area — Civilian",
  description: "Air alerts, power outages, and infrastructure damage for Kyiv city and oblast.",
  tags: ["civilian", "kyiv", "alerts"],
  ownerId: "user-system",
  orgId: "org-public",
  isPublic: true,
  activeLayers: ["civilian_alerts", "power_outages", "infrastructure"],
  filters: { regions: ["UA-30", "UA-32"] },
  mapView: { center: [30.52, 50.45], zoom: 10 },
  aoiIds: [],
  createdAt: now,
  updatedAt: now,
});

export function listPresets(opts?: {
  ownerId?: string;
  orgId?: string;
  isPublic?: boolean;
  tag?: string;
}): WorkspacePreset[] {
  let items = Array.from(store.values());
  if (opts?.ownerId) items = items.filter((p) => p.ownerId === opts.ownerId || p.isPublic);
  if (opts?.orgId) items = items.filter((p) => p.orgId === opts.orgId || p.isPublic);
  if (opts?.isPublic != null) items = items.filter((p) => p.isPublic === opts.isPublic);
  if (opts?.tag) items = items.filter((p) => p.tags.includes(opts.tag!));
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPreset(id: string): WorkspacePreset | undefined {
  return store.get(id);
}

export function getPresetByShareToken(token: string): WorkspacePreset | undefined {
  return Array.from(store.values()).find((p) => p.shareToken === token);
}

export function createPreset(data: PresetCreate): WorkspacePreset {
  const id = randomUUID();
  const ts = new Date().toISOString();
  const preset: WorkspacePreset = { ...data, id, createdAt: ts, updatedAt: ts };
  store.set(id, preset);
  return preset;
}

export function updatePreset(id: string, data: PresetUpdate): WorkspacePreset | null {
  const existing = store.get(id);
  if (!existing) return null;
  const updated: WorkspacePreset = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  store.set(id, updated);
  return updated;
}

export function deletePreset(id: string): boolean {
  return store.delete(id);
}

export function generateShareToken(id: string, expiresInHours = 168): WorkspacePreset | null {
  const preset = store.get(id);
  if (!preset) return null;
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + expiresInHours * 3600_000).toISOString();
  return updatePreset(id, { shareToken: token, shareExpiresAt: expiresAt });
}
