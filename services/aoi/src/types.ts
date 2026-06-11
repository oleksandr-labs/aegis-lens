import { z } from "zod";

export const AOIGeometry = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bbox"),
    /** [west, south, east, north] */
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  }),
  z.object({
    type: z.literal("circle"),
    center: z.tuple([z.number(), z.number()]), // [lng, lat]
    radius_km: z.number().positive(),
  }),
  z.object({
    type: z.literal("polygon"),
    /** GeoJSON coordinates: [[[lng,lat],...]] */
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
]);
export type AOIGeometry = z.infer<typeof AOIGeometry>;

export const AOITier = z.enum(["free", "pro", "enterprise"]);
export type AOITier = z.infer<typeof AOITier>;

/** Max AOIs per tier */
export const AOI_QUOTA: Record<AOITier, number> = {
  free: 1,
  pro: 20,
  enterprise: 500,
};

export const AOI = z.object({
  aoi_id: z.string(),
  user_id: z.string(),
  org_id: z.string().optional(),
  name: z.string().min(1).max(120),
  tags: z.array(z.string()).default([]),
  geometry: AOIGeometry,
  /** If true, results are private — never auto-published */
  is_private: z.boolean().default(false),
  /** Satellite change detection cadence (days) */
  satellite_cadence_days: z.number().int().min(1).default(7),
  /** Active alert rule IDs bound to this AOI */
  alert_rule_ids: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type AOI = z.infer<typeof AOI>;

export interface AOIEventMatch {
  aoi_id: string;
  event_id: string;
  matched_at: string;
}

export interface AOIChangeDetectionJob {
  job_id: string;
  aoi_id: string;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  status: "pending" | "running" | "done" | "failed";
  result_url: string | null;
  error: string | null;
}
