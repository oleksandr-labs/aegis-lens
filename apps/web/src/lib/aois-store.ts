import "server-only";

export type AOIGeometryType = "polygon" | "circle" | "bbox";

export interface AOIGeometry {
  type: AOIGeometryType;
  coordinates?: number[][][];  // polygon
  center?: [number, number];   // circle: [lon, lat]
  radiusKm?: number;           // circle
  bbox?: [number, number, number, number];  // [minLon, minLat, maxLon, maxLat]
}

export interface AOI {
  aoiId: string;
  name: string;
  tags: string[];
  geometry: AOIGeometry;
  isPrivate: boolean;
  satelliteCadenceDays: number;
  alertRuleIds: string[];
  userId: string;
  orgId?: string;
  createdAt: string;
  updatedAt: string;
}

export const aoiStore = new Map<string, AOI>();

// Seed demo AOIs
aoiStore.set("aoi_demo_001", {
  aoiId: "aoi_demo_001",
  name: "Kharkiv Oblast",
  tags: ["kharkiv", "frontline"],
  geometry: {
    type: "bbox",
    bbox: [35.4, 49.4, 37.4, 50.4],
  },
  isPrivate: false,
  satelliteCadenceDays: 3,
  alertRuleIds: ["rule_demo_001"],
  userId: "demo",
  createdAt: new Date(Date.now() - 86400_000 * 14).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000 * 14).toISOString(),
});

aoiStore.set("aoi_demo_002", {
  aoiId: "aoi_demo_002",
  name: "Zaporizhzhia Nuclear Plant buffer",
  tags: ["nuclear", "critical-infrastructure"],
  geometry: {
    type: "circle",
    center: [34.587, 47.507],
    radiusKm: 30,
  },
  isPrivate: false,
  satelliteCadenceDays: 1,
  alertRuleIds: [],
  userId: "demo",
  createdAt: new Date(Date.now() - 86400_000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000 * 7).toISOString(),
});
