/**
 * DSA (EU Digital Services Act) compliance posture for Aegis Lens.
 *
 * Regulation: EU 2022/2065 (Digital Services Act), fully applicable from 2024-02-17
 * Classification: Aegis Lens is an "online platform" (Art. 3(i)) if it hosts UGC.
 *
 * Hosted UGC in scope:
 *   - Analyst-uploaded intelligence notes / case files
 *   - Shared map presets / dashboards (public-share feature)
 *   - Comments / annotations on events (if/when enabled)
 *
 * Obligations at current scale (< 45M EU monthly users = "smaller platform"):
 *   - Transparency reporting (Art. 15 annual report)
 *   - Notice-and-action mechanism (Art. 16)
 *   - Trusted flaggers (Art. 22) — cooperate when designated
 *   - No dark patterns (Art. 25)
 *   - Single point of contact for authorities (Art. 11)
 *
 * Very Large Online Platform (VLOP) obligations (> 45M EU users) — not yet applicable.
 *
 * Sprint 2.73 — compliance implementation.
 */

// ── DSA posture declaration ───────────────────────────────────────────────────

export interface DsaPosture {
  /** Whether Aegis Lens is classified as hosting UGC under DSA */
  hostsUgc: boolean;
  /** DSA tier */
  tier: "not_applicable" | "smaller_platform" | "vlop";
  /** EU single point of contact (Art. 11) */
  contactEmail: string;
  /** Annual transparency report URL (published after first full calendar year) */
  transparencyReportUrl: string | null;
  /** Whether a notice-and-action mechanism is active */
  noticeAndActionEnabled: boolean;
  /** Whether trusted flagger cooperation is implemented */
  trustedFlaggersEnabled: boolean;
  /** Legal representative in EU (Art. 13) */
  euLegalRepresentative: string | null;
}

export const AEGIS_DSA_POSTURE: DsaPosture = {
  hostsUgc: true,
  tier: "smaller_platform",
  contactEmail: "dsa@aegislens.io",
  transparencyReportUrl: null,           // publish after first full year of operation
  noticeAndActionEnabled: true,
  trustedFlaggersEnabled: false,         // implement when designated trusted flaggers engage
  euLegalRepresentative: null,           // TODO: appoint EU legal rep (required if not EU-based)
};

// ── Notice-and-action mechanism ───────────────────────────────────────────────

export type TakedownNoticeType =
  | "illegal_content"          // Art. 16 — content that is illegal under EU or member-state law
  | "csam"                     // Child Sexual Abuse Material — immediate removal
  | "terrorism"                // TERREG regulation — 1-hour removal obligation
  | "copyright"                // Directive 2019/790
  | "defamation"
  | "privacy_violation"
  | "disinformation"           // DSA Art. 34 — systemic risk mitigation
  | "platform_tos";            // Internal policy violation (not DSA-mandated but tracked)

export type TakedownNoticeStatus =
  | "received"
  | "under_review"
  | "escalated_to_legal"
  | "removed"
  | "partially_removed"
  | "rejected"                 // with reasoned explanation to notifier
  | "appealed";

export interface TakedownNotice {
  id: string;
  noticeType: TakedownNoticeType;
  status: TakedownNoticeStatus;
  /** Who submitted the notice (can be anonymous for Art. 16, but trusted flaggers identified) */
  notifierEmail: string | null;
  notifierIsTrustedFlagger: boolean;
  /** URL or ID of the content in question */
  contentRef: string;
  contentDescription: string;
  /** EU member state law alleged to be violated (if applicable) */
  allegedLaw: string | null;
  receivedAt: Date;
  /** DSA Art. 16(4): timely decision — aim for 24h for priority types */
  decidedAt: Date | null;
  /** Reason communicated to the notifier */
  decisionReason: string | null;
  /** Statement of reasons if content removed (Art. 17) */
  statementOfReasons: string | null;
  /** Appeal deadline — 6 months from decision (Art. 20) */
  appealDeadline: Date | null;
}

/**
 * Creates a new takedown notice record.
 */
export function createTakedownNotice(opts: Omit<TakedownNotice, "id" | "status" | "decidedAt" | "decisionReason" | "statementOfReasons" | "appealDeadline">): TakedownNotice {
  return {
    ...opts,
    id: `tn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "received",
    decidedAt: null,
    decisionReason: null,
    statementOfReasons: null,
    appealDeadline: null,
  };
}

/**
 * Decision SLA targets by notice type.
 * TERREG (terrorism content) requires removal within 1 hour.
 * CSAM: immediate.
 * Standard: 24–72 hours.
 */
export const TAKEDOWN_SLA_HOURS: Record<TakedownNoticeType, number> = {
  csam: 1,
  terrorism: 1,
  illegal_content: 24,
  copyright: 48,
  defamation: 72,
  privacy_violation: 48,
  disinformation: 72,
  platform_tos: 72,
};

// ── Content liability framework ───────────────────────────────────────────────

export interface ContentLiabilityFramework {
  /** DSA Art. 6 — conditional exemption from liability for hosting UGC */
  intermediaryLiabilityPosition: string;
  /** TERREG Regulation compliance note */
  terregCompliance: string;
  /** CSAR regulation note */
  chatControlNote: string;
  /** Internal moderation policy summary */
  moderationPolicySummary: string;
}

export const CONTENT_LIABILITY_FRAMEWORK: ContentLiabilityFramework = {
  intermediaryLiabilityPosition:
    "Aegis Lens claims the hosting service exemption under DSA Article 6 (formerly e-Commerce Directive Art. 14). " +
    "We do not have general monitoring obligations. Liability exemption is conditional on: " +
    "(a) no actual knowledge of illegal content, and " +
    "(b) expeditious removal upon receiving a notice that meets Art. 16 requirements. " +
    "Active editorial curation of specific events may reduce exemption scope — legal review required " +
    "before implementing AI-assisted content ranking on UGC.",

  terregCompliance:
    "Terrorist content (TERREG EU 2021/784) must be removed within 1 hour of a Removal Order from a " +
    "competent authority. Aegis Lens must designate a 24/7 point of contact for TERREG orders. " +
    "Specific Measures must be in place after a first Removal Order. " +
    "Contact: dsa@aegislens.io — target for <1h response SLA.",

  chatControlNote:
    "Proposed CSAR ('Chat Control') regulation — Aegis Lens does not provide messaging services " +
    "in scope of the current proposal. Monitor for updates if chat/annotation features are added.",

  moderationPolicySummary:
    "Content moderation applies to: (1) public-share presets/dashboards, (2) case file annotations " +
    "shared externally, (3) source submissions. " +
    "Moderation workflow: automated classifier → human review queue → decision + notice to uploader. " +
    "Appeals: users may appeal via support ticket; second review by a different staff member.",
};

// ── Transparency report skeleton ──────────────────────────────────────────────

export interface DsaTransparencyReport {
  periodStart: string;   // ISO 8601 date
  periodEnd: string;
  publishedAt: string | null;
  noticesReceived: number;
  noticesActedUpon: number;
  noticesRejected: number;
  averageDecisionTimeHours: number;
  contentRemovedCount: number;
  contentRestoredOnAppeal: number;
  trustedFlaggerNotices: number;
  authorityOrdersReceived: number;
  authorityOrdersComplied: number;
  activeUserCountEu: number | null;
}

export function createEmptyTransparencyReport(periodStart: string, periodEnd: string): DsaTransparencyReport {
  return {
    periodStart,
    periodEnd,
    publishedAt: null,
    noticesReceived: 0,
    noticesActedUpon: 0,
    noticesRejected: 0,
    averageDecisionTimeHours: 0,
    contentRemovedCount: 0,
    contentRestoredOnAppeal: 0,
    trustedFlaggerNotices: 0,
    authorityOrdersReceived: 0,
    authorityOrdersComplied: 0,
    activeUserCountEu: null,
  };
}
