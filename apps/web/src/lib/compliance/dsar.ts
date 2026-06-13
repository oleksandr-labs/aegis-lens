/**
 * Data Subject Access Request (DSAR) handler for Aegis Lens.
 *
 * Covers:
 *   - GDPR Article 15 (access) / 16 (rectification) / 17 (erasure) / 20 (portability)
 *   - CCPA equivalent rights (see ccpa.ts)
 *   - UK GDPR (same structure, UK ICO jurisdiction)
 *
 * Workflow:
 *   1. Consumer submits request via /privacy/dsar form or email
 *   2. System sends identity verification email (one-time code)
 *   3. Staff verifies identity (automated + manual for high-risk)
 *   4. Processor collects data from all services within 30 days
 *   5. Response delivered as JSON + CSV export (or deletion confirmed)
 *
 * SLA: 30 days from verified receipt (extendable by 2 months for complex requests,
 *       with notice to the consumer within the first 30 days)
 *
 * Sprint 2.73 — compliance implementation.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type DsarRequestType = "access" | "delete" | "correct" | "portability" | "restrict" | "object";

export type DsarStatus =
  | "received"          // submission accepted
  | "pending_verify"    // waiting for identity verification
  | "verified"          // identity confirmed; processing begins
  | "processing"        // gathering data from all systems
  | "pending_review"    // staff review before delivery/deletion
  | "completed"         // response sent / deletion executed
  | "denied"            // request denied (with reason)
  | "expired"           // requester did not verify in time
  | "on_hold";          // legal hold

export type DsarDenialReason =
  | "identity_not_verified"
  | "not_a_data_subject"   // requester cannot demonstrate they are the subject
  | "manifestly_unfounded"
  | "excessive_frequency"
  | "legal_hold"
  | "data_not_held"
  | "exemption_applies";   // e.g. billing data under legal retention

export interface DsarRequest {
  id: string;
  requestType: DsarRequestType;
  /** Email of the data subject (not necessarily the account holder — third-party agents allowed) */
  subjectEmail: string;
  /** Account userId if matched, null if not yet matched */
  userId: string | null;
  orgId: string | null;
  jurisdiction: "eu-gdpr" | "uk-gdpr" | "ccpa" | "other";
  status: DsarStatus;
  submittedAt: Date;
  verifiedAt: Date | null;
  dueAt: Date;             // 30 days from verifiedAt
  completedAt: Date | null;
  denialReason: DsarDenialReason | null;
  /** Staff-visible note */
  staffNote: string | null;
  /** Consumer-visible note (included in response) */
  publicNote: string | null;
  /** Format for the data export */
  exportFormat: DsarExportFormat[];
  /** URL of the generated export package (time-limited, encrypted) */
  exportUrl: string | null;
}

export type DsarExportFormat = "json" | "csv" | "pdf";

// ── Request handler interface ─────────────────────────────────────────────────

export interface DsarHandler {
  /**
   * Receive and record a new DSAR.
   * Sends verification email automatically.
   * Returns the created request with status "pending_verify".
   */
  receive(opts: {
    requestType: DsarRequestType;
    subjectEmail: string;
    jurisdiction: DsarRequest["jurisdiction"];
    exportFormat?: DsarExportFormat[];
  }): Promise<DsarRequest>;

  /**
   * Verify identity using the one-time code sent to the subject's email.
   * Returns true and transitions request to "verified" if successful.
   */
  verifyIdentity(requestId: string, otpCode: string): Promise<boolean>;

  /**
   * Collect all data for an access/portability request.
   * Pulls from: user_profiles, events (authored), alerts, cases, api_keys, audit_logs, billing.
   */
  collectData(requestId: string): Promise<DsarDataPackage>;

  /**
   * Execute deletion of all personal data for a "delete" request.
   * Respects retention policies (billing data exempt under legal obligation).
   */
  executeDeletion(requestId: string): Promise<DsarDeletionReport>;

  /**
   * Deny a request with a reason. Sends denial notice to the subject.
   */
  deny(requestId: string, reason: DsarDenialReason, publicNote?: string): Promise<DsarRequest>;

  /**
   * Returns the current status of a DSAR by ID.
   */
  getStatus(requestId: string): Promise<DsarRequest | null>;
}

// ── Data package structures ───────────────────────────────────────────────────

export interface DsarDataPackage {
  requestId: string;
  exportedAt: Date;
  subject: {
    userId: string;
    email: string;
    name: string;
    createdAt: string;
    plan: string;
  };
  personalDataSections: DsarDataSection[];
  exportFormats: DsarExportFormat[];
}

export interface DsarDataSection {
  category: string;         // e.g. "Account", "API Keys", "Billing", "Audit Log"
  description: string;
  recordCount: number;
  records: Record<string, unknown>[];
  /** Whether this section is included in the export or excluded (with reason) */
  included: boolean;
  exclusionReason?: string;
}

export interface DsarDeletionReport {
  requestId: string;
  executedAt: Date;
  deletedSections: Array<{
    dataClass: string;
    recordsDeleted: number;
    method: "hard_delete" | "anonymise" | "redact";
  }>;
  exemptSections: Array<{
    dataClass: string;
    reason: string;
    retentionUntil: Date | null;
  }>;
}

// ── SLA constants ─────────────────────────────────────────────────────────────

/** Initial response window in days (GDPR Art. 12(3)) */
export const DSAR_INITIAL_RESPONSE_DAYS = 30;

/** Maximum extension in days (GDPR Art. 12(3) — complex/numerous requests) */
export const DSAR_EXTENSION_DAYS = 60;

/** Identity verification code validity in minutes */
export const DSAR_VERIFY_CODE_TTL_MINUTES = 60;

/** Maximum DSARs from one email per rolling period */
export const DSAR_RATE_LIMIT = { count: 3, periodDays: 90 };

/**
 * Computes the initial due date from a verified timestamp.
 */
export function computeDsarDueDate(verifiedAt: Date, extended = false): Date {
  const days = extended ? DSAR_INITIAL_RESPONSE_DAYS + DSAR_EXTENSION_DAYS : DSAR_INITIAL_RESPONSE_DAYS;
  return new Date(verifiedAt.getTime() + days * 24 * 60 * 60 * 1000);
}

// ── Data systems to query for access requests ─────────────────────────────────

/**
 * List of internal systems / services that hold personal data.
 * Each must implement a collector interface when building the full data package.
 */
export const DSAR_DATA_SYSTEMS = [
  { id: "user_profiles",   description: "Account profile, preferences, tier",      retainedUnder: "user_profiles" },
  { id: "events_authored", description: "Events created or tagged by the user",     retainedUnder: "events" },
  { id: "alerts",          description: "Alert subscriptions and history",           retainedUnder: "events" },
  { id: "cases",           description: "Investigation cases",                       retainedUnder: "events" },
  { id: "api_keys",        description: "API key names and metadata (not hashes)",   retainedUnder: "api_key_hashes" },
  { id: "audit_log",       description: "User action log",                           retainedUnder: "audit_logs" },
  { id: "billing",         description: "Invoices, payment methods (last 4 only)",   retainedUnder: "billing" },
  { id: "support",         description: "Support ticket history",                    retainedUnder: "support_tickets" },
  { id: "dsar_history",    description: "Previous DSAR requests",                    retainedUnder: "dsar_requests" },
] as const;

// ── Export utilities ──────────────────────────────────────────────────────────

/**
 * Converts a DsarDataPackage to a flat CSV string.
 * Each section becomes its own CSV block with a header row.
 */
export function packageToCsv(pkg: DsarDataPackage): string {
  const lines: string[] = [
    `# DSAR Data Export`,
    `# Request ID: ${pkg.requestId}`,
    `# Exported at: ${pkg.exportedAt.toISOString()}`,
    `# Subject: ${pkg.subject.email}`,
    "",
  ];

  for (const section of pkg.personalDataSections) {
    if (!section.included) {
      lines.push(`## ${section.category} — EXCLUDED: ${section.exclusionReason ?? "N/A"}`);
      lines.push("");
      continue;
    }
    lines.push(`## ${section.category}`);
    if (section.records.length === 0) {
      lines.push("(no records)");
    } else {
      const headers = Object.keys(section.records[0]).join(",");
      lines.push(headers);
      for (const record of section.records) {
        const row = Object.values(record)
          .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : String(v ?? "")))
          .join(",");
        lines.push(row);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
