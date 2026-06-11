import { z } from "zod";

// ── Alert rule ────────────────────────────────────────────────────────────────

export const AlertChannel = z.enum([
  "in_app",
  "web_push",
  "email",
  "telegram",
  "slack",
  "webhook",
  "sms",
]);
export type AlertChannel = z.infer<typeof AlertChannel>;

export const AlertPriority = z.enum(["critical", "high", "medium", "low"]);
export type AlertPriority = z.infer<typeof AlertPriority>;

export const AlertRuleCondition = z.object({
  /** Taxonomy event class to filter */
  event_class: z.string().optional(),
  event_subclass: z.string().optional(),
  /** Minimum danger score (0-100) */
  min_danger_score: z.number().min(0).max(100).optional(),
  /** Minimum confidence (0-1) */
  min_confidence: z.number().min(0).max(1).optional(),
  /** Match events inside this GeoJSON polygon or circle */
  geo_filter: z
    .object({
      type: z.enum(["bbox", "polygon", "circle"]),
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
      center: z.tuple([z.number(), z.number()]).optional(),
      radius_km: z.number().optional(),
    })
    .optional(),
  /** Keyword match in event summary */
  keyword: z.string().optional(),
  /** Severity minimum */
  min_severity: z.number().min(0).max(5).optional(),
});
export type AlertRuleCondition = z.infer<typeof AlertRuleCondition>;

export const AlertSchedule = z.object({
  /** Quiet hours in user's timezone: "22:00-07:00" */
  quiet_hours: z.string().optional(),
  /** Override quiet hours for critical alerts */
  critical_override: z.boolean().default(true),
  /** Digest mode: null = immediate, "hourly"|"daily" */
  digest_mode: z.enum(["immediate", "hourly", "daily"]).default("immediate"),
});
export type AlertSchedule = z.infer<typeof AlertSchedule>;

export const AlertRule = z.object({
  rule_id: z.string(),
  user_id: z.string(),
  org_id: z.string().optional(),
  name: z.string(),
  condition: AlertRuleCondition,
  channels: z.array(AlertChannel).min(1),
  priority: AlertPriority.default("medium"),
  schedule: AlertSchedule,
  /** Dedup window: suppress duplicate alerts for same event within N seconds */
  dedup_window_s: z.number().default(300),
  /** Per-rule throttle: max N alerts per hour */
  max_per_hour: z.number().default(60),
  enabled: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type AlertRule = z.infer<typeof AlertRule>;

// ── Alert delivery ────────────────────────────────────────────────────────────

export const AlertDeliveryStatus = z.enum([
  "pending",
  "sent",
  "failed",
  "suppressed_dedup",
  "suppressed_throttle",
  "suppressed_quiet_hours",
]);
export type AlertDeliveryStatus = z.infer<typeof AlertDeliveryStatus>;

export const AlertDeliveryRecord = z.object({
  delivery_id: z.string(),
  rule_id: z.string(),
  event_id: z.string(),
  channel: AlertChannel,
  status: AlertDeliveryStatus,
  attempted_at: z.string().datetime(),
  delivered_at: z.string().datetime().optional(),
  error: z.string().optional(),
  retry_count: z.number().default(0),
});
export type AlertDeliveryRecord = z.infer<typeof AlertDeliveryRecord>;

// ── Notification payload sent to channels ────────────────────────────────────

export interface AlertNotification {
  rule_id: string;
  event_id: string;
  priority: AlertPriority;
  title: string;
  body: string;
  url: string;
  /** ISO timestamp of the triggering event */
  event_time: string;
  danger_score: number;
  confidence: number;
  locale: string;
}
