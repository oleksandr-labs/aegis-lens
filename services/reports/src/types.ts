/**
 * Intelligence report types.
 *
 * Four canonical report kinds, each with a structured schema.
 * Content is always AI-assisted but must pass human review
 * before any public-facing publication.
 */

export type ReportKind = "regional" | "incident" | "weekly" | "custom";

export type ReportStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "retracted";

export type ReportLocale = "en" | "uk" | "ru" | string;

export interface ReportCitation {
  event_id: string;
  summary: string;
  occurred_at: string;
  source_url?: string;
}

export interface ReportSection {
  heading: Record<ReportLocale, string>;
  body: Record<ReportLocale, string>;
  citations: ReportCitation[];
}

export interface Report {
  report_id: string;
  kind: ReportKind;
  title: Record<ReportLocale, string>;
  /** ISO 3166-1 alpha-2 region codes covered */
  regions: string[];
  /** Event class filter that scoped this report */
  eventClasses: string[];
  /** Earliest event included */
  periodStart: string;
  /** Latest event included */
  periodEnd: string;
  sections: ReportSection[];
  status: ReportStatus;
  /** Analyst who approved (required before publish) */
  approvedBy?: string;
  approvedAt?: string;
  /** AI model used for drafting */
  model: string;
  createdAt: string;
  updatedAt: string;
  /** SHA-256 of final published content (immutable once published) */
  contentHash?: string;
}

// ── Template types ────────────────────────────────────────────────────────────

export interface ReportTemplate {
  kind: ReportKind;
  sectionKeys: string[];
  /** Prompt fragment per section for the LLM */
  sectionPrompts: Record<string, string>;
  /** Required citations minimum per section */
  minCitationsPerSection: number;
}

export const REPORT_TEMPLATES: Record<ReportKind, ReportTemplate> = {
  regional: {
    kind: "regional",
    sectionKeys: ["executive_summary", "security_situation", "infrastructure", "humanitarian", "key_entities", "outlook"],
    sectionPrompts: {
      executive_summary: "Provide a 2-3 sentence executive summary of the security situation in the specified region during the report period.",
      security_situation: "Describe the overall military situation: active fronts, significant engagements, air threats, and territorial changes.",
      infrastructure: "Summarize infrastructure damage and restoration: energy, transport, water, telecommunications.",
      humanitarian: "Describe humanitarian situation: displacement, casualties, aid access, shelter.",
      key_entities: "List key military units, organizations, or individuals that featured prominently in events.",
      outlook: "Based on observable trends, provide a brief directional outlook for the next 24-72 hours. Avoid point predictions.",
    },
    minCitationsPerSection: 2,
  },
  incident: {
    kind: "incident",
    sectionKeys: ["incident_summary", "timeline", "impact", "verification_status", "source_analysis"],
    sectionPrompts: {
      incident_summary: "Provide a concise summary of the incident: what happened, where, when, and who was involved.",
      timeline: "Reconstruct the incident timeline from available sources, noting gaps and uncertainties.",
      impact: "Describe confirmed impact: casualties, damage, affected systems or areas.",
      verification_status: "Assess the verification level of claims. Flag disputed details.",
      source_analysis: "Evaluate source reliability and note any coordination between accounts.",
    },
    minCitationsPerSection: 3,
  },
  weekly: {
    kind: "weekly",
    sectionKeys: ["week_summary", "top_events", "threat_trends", "infrastructure_snapshot", "humanitarian_snapshot", "next_week_watch"],
    sectionPrompts: {
      week_summary: "Summarize the most significant developments of the week in 3-5 sentences.",
      top_events: "List the 5 most significant events with brief descriptions and citations.",
      threat_trends: "Identify threat trends: changing patterns in attack types, timing, or geography.",
      infrastructure_snapshot: "Snapshot of infrastructure status at week end vs prior week.",
      humanitarian_snapshot: "Key humanitarian metrics change week-over-week.",
      next_week_watch: "Identify 2-3 indicators to watch next week based on current trends.",
    },
    minCitationsPerSection: 2,
  },
  custom: {
    kind: "custom",
    sectionKeys: ["summary", "analysis", "recommendations"],
    sectionPrompts: {
      summary: "Summarize the requested analysis scope.",
      analysis: "Provide detailed analysis as requested.",
      recommendations: "Provide actionable recommendations based on the analysis.",
    },
    minCitationsPerSection: 1,
  },
};
