/**
 * Email lifecycle types — shared interfaces and union types for all lifecycle emails.
 * Providers: Resend / Postmark (transactional), Customer.io / Loops (lifecycle).
 */

// ── Trigger union ─────────────────────────────────────────────────────────────

export type EmailTrigger =
  // Onboarding
  | "user.registered"
  | "user.first_map_view"
  | "user.first_event_click"
  | "user.day_3"
  | "user.day_7"
  | "user.day_14"
  // Activation nudges
  | "user.no_filter_created"
  | "user.no_alert_configured"
  | "user.watchlist_empty"
  // Re-engagement
  | "user.inactive_14d"
  | "user.inactive_30d"
  | "user.inactive_60d"
  // Trial & billing
  | "trial.started"
  | "trial.ending_in_3d"
  | "trial.ended"
  | "subscription.confirmed"
  | "subscription.canceled"
  | "invoice.paid"
  | "invoice.failed"
  // Expansion
  | "usage.pro_limit_80pct"
  | "usage.team_limit_reached"
  // Security / transactional
  | "auth.email_verification"
  | "auth.magic_link"
  | "auth.password_reset"
  | "auth.new_device"
  | "auth.suspicious_activity"
  // Alerts
  | "alert.critical_event"
  | "alert.daily_digest"
  | "alert.weekly_digest"
  // Reports
  | "report.ready"
  | "grant.approved"
  // Editorial
  | "editorial.weekly_brief"
  | "editorial.monthly_deep_dive"
  | "editorial.region_brief";

// ── Tier gate ─────────────────────────────────────────────────────────────────

export type TierGate = "all" | "free" | "pro" | "team" | "enterprise" | "newsroom";

// ── Persona tag ───────────────────────────────────────────────────────────────

export type PersonaTag =
  | "journalist"
  | "osint-researcher"
  | "ngo-worker"
  | "policy-analyst"
  | "general"
  | "enterprise";

// ── Core interface ────────────────────────────────────────────────────────────

export interface LifecycleEmail {
  /** Unique template ID matching the email provider template slug */
  templateId: string;
  trigger: EmailTrigger;
  /** Hours after trigger to send (0 = immediate) */
  delayHours: number;
  subject_en: string;
  subject_uk: string;
  /** Preview text shown in email client inbox */
  preheader_en?: string;
  preheader_uk?: string;
  /** Persona this email is targeted at. null = all personas */
  personaTag: PersonaTag | null;
  /** Only send to users on this tier. 'all' = no restriction */
  tierGate: TierGate;
  /** Whether this email can be unsubscribed from (false for transactional) */
  canUnsubscribe: boolean;
}
