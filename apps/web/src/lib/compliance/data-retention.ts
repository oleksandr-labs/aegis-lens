/**
 * Data retention policy for Aegis Lens.
 *
 * Principles:
 *   - Retain data only as long as necessary for the stated purpose
 *   - Align with GDPR Article 5(1)(e) (storage limitation)
 *   - Meet legal minimum retention (e.g. billing/tax records: 7 years)
 *   - Automated deletion scheduled via cron job / background worker
 *
 * Data classes and retention windows:
 *   events          2 years    (OSINT/war events — primary product data)
 *   raw_archive     5 years    (raw ingested source data — legal + appeals)
 *   analytics       18 months  (usage metrics, funnel data)
 *   logs            90 days    (application + API logs)
 *   billing         7 years    (invoices, payment records — tax law)
 *   user_profiles   until deletion request or account closure + 30 days
 *   audit_logs      3 years    (SOC 2 + ISO 27001 requirement)
 *   session_tokens  per TTL    (7 days max; see session.ts)
 *   support_tickets 2 years    (after ticket closure)
 *
 * Sprint 2.73 — compliance implementation.
 */

// ── Data class types ──────────────────────────────────────────────────────────

export type DataClass =
  | "events"
  | "raw_archive"
  | "analytics"
  | "logs"
  | "billing"
  | "user_profiles"
  | "audit_logs"
  | "session_tokens"
  | "support_tickets"
  | "dsar_requests"
  | "mfa_recovery_codes"
  | "api_key_hashes";

export type RetentionUnit = "days" | "months" | "years" | "ttl";

export interface DataRetentionPolicy {
  dataClass: DataClass;
  retentionAmount: number;
  retentionUnit: RetentionUnit;
  /** Computed retention in days (for scheduling) */
  retentionDays: number;
  legalBasis: string;
  /** Whether deletion requires human approval (for safety-critical classes) */
  requiresApproval: boolean;
  /** Whether data should be anonymised rather than deleted */
  anonymiseOnExpiry: boolean;
  /** Which GDPR article / principle applies */
  gdprBasis: string;
  notes: string;
}

// ── Retention schedule ────────────────────────────────────────────────────────

export const DATA_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    dataClass: "events",
    retentionAmount: 2,
    retentionUnit: "years",
    retentionDays: 730,
    legalBasis: "Contract performance — event data is the core deliverable",
    requiresApproval: true,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(b) — contract; Art. 6(1)(f) — legitimate interest",
    notes: "Enterprise orgs may have custom contractual retention (up to 10y). Override per orgId.",
  },
  {
    dataClass: "raw_archive",
    retentionAmount: 5,
    retentionUnit: "years",
    retentionDays: 1825,
    legalBasis: "Source dispute resolution, legal hold, data lineage",
    requiresApproval: true,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(f) — legitimate interest (legal defence)",
    notes: "Stored in cold storage (S3 Glacier / Backblaze B2). Separate deletion process.",
  },
  {
    dataClass: "analytics",
    retentionAmount: 18,
    retentionUnit: "months",
    retentionDays: 548,
    legalBasis: "Product analytics, retention modelling, usage attribution",
    requiresApproval: false,
    anonymiseOnExpiry: true,    // aggregate by cohort before deletion
    gdprBasis: "Art. 6(1)(f) — legitimate interest",
    notes: "Anonymise to cohort-level aggregates after retention window. No user_id retained.",
  },
  {
    dataClass: "logs",
    retentionAmount: 90,
    retentionUnit: "days",
    retentionDays: 90,
    legalBasis: "Security incident investigation, debugging",
    requiresApproval: false,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(f) — legitimate interest (security)",
    notes: "Application + API logs. Extended to 1 year if a security incident is active (legal hold).",
  },
  {
    dataClass: "billing",
    retentionAmount: 7,
    retentionUnit: "years",
    retentionDays: 2555,
    legalBasis: "UK tax law (Companies Act 2006), EU VAT Directive, IRS requirements",
    requiresApproval: true,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(c) — legal obligation",
    notes: "Cannot be deleted before 7-year window expires regardless of DSAR. Inform users of this limitation.",
  },
  {
    dataClass: "user_profiles",
    retentionAmount: 30,
    retentionUnit: "days",
    retentionDays: 30,
    legalBasis: "Deletion request / account closure grace period",
    requiresApproval: false,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 17 — right to erasure",
    notes: "30-day soft-delete window for accidental deletion recovery. Hard-delete after 30 days.",
  },
  {
    dataClass: "audit_logs",
    retentionAmount: 3,
    retentionUnit: "years",
    retentionDays: 1095,
    legalBasis: "SOC 2 CC7.2, ISO 27001 A.12.4, accountability principle",
    requiresApproval: true,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(c) — legal obligation; Art. 6(1)(f) — legitimate interest",
    notes: "Audit logs must be immutable (append-only). Deletion requires dual-approval.",
  },
  {
    dataClass: "session_tokens",
    retentionAmount: 7,
    retentionUnit: "days",
    retentionDays: 7,
    legalBasis: "Session management (active use only)",
    requiresApproval: false,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 5(1)(e) — storage limitation",
    notes: "Expire automatically via TTL (Redis / DB). No separate deletion job needed.",
  },
  {
    dataClass: "support_tickets",
    retentionAmount: 2,
    retentionUnit: "years",
    retentionDays: 730,
    legalBasis: "Customer dispute resolution",
    requiresApproval: false,
    anonymiseOnExpiry: true,
    gdprBasis: "Art. 6(1)(f) — legitimate interest",
    notes: "Anonymise customer PII in ticket body after closure + 2 years.",
  },
  {
    dataClass: "dsar_requests",
    retentionAmount: 3,
    retentionUnit: "years",
    retentionDays: 1095,
    legalBasis: "Accountability — demonstrate compliance with DSAR obligations",
    requiresApproval: false,
    anonymiseOnExpiry: true,
    gdprBasis: "Art. 5(2) — accountability principle",
    notes: "Keep request metadata (ID, date, type, outcome) but anonymise personal data.",
  },
  {
    dataClass: "mfa_recovery_codes",
    retentionAmount: 1,
    retentionUnit: "days",
    retentionDays: 1,
    legalBasis: "One-time use; expire immediately on use or regeneration",
    requiresApproval: false,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 5(1)(e) — storage limitation",
    notes: "Stored as bcrypt hashes. Delete old set immediately when user regenerates codes.",
  },
  {
    dataClass: "api_key_hashes",
    retentionAmount: 90,
    retentionUnit: "days",
    retentionDays: 90,
    legalBasis: "Audit trail for API key usage; key rotation policy",
    requiresApproval: false,
    anonymiseOnExpiry: false,
    gdprBasis: "Art. 6(1)(f) — legitimate interest",
    notes: "Only hashes stored. Revoked keys retained for 90 days for abuse investigation.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const GDPR_RETENTION_CLASSES: DataClass[] = DATA_RETENTION_POLICIES
  .filter((p) => p.gdprBasis.includes("Art."))
  .map((p) => p.dataClass);

export function getRetentionPolicy(dataClass: DataClass): DataRetentionPolicy | undefined {
  return DATA_RETENTION_POLICIES.find((p) => p.dataClass === dataClass);
}

export function retentionExpiryDate(dataClass: DataClass, createdAt: Date): Date | null {
  const policy = getRetentionPolicy(dataClass);
  if (!policy) return null;
  return new Date(createdAt.getTime() + policy.retentionDays * 24 * 60 * 60 * 1000);
}

export function isExpired(dataClass: DataClass, createdAt: Date): boolean {
  const expiry = retentionExpiryDate(dataClass, createdAt);
  if (!expiry) return false;
  return Date.now() > expiry.getTime();
}

// ── Deletion scheduling ───────────────────────────────────────────────────────

export interface RetentionDeletionJob {
  jobId: string;
  dataClass: DataClass;
  orgId: string;
  scheduledFor: Date;
  status: "pending" | "approved" | "running" | "completed" | "failed" | "held";
  /** Legal hold prevents deletion even after retention window */
  legalHold: boolean;
  createdAt: Date;
}

/**
 * Schedule a retention deletion job for a data class and org.
 *
 * In production: insert into `retention_deletion_jobs` table.
 * Worker picks up pending (non-held) jobs past scheduledFor date.
 *
 * If `requiresApproval`, the job starts in "pending" status and needs
 * a staff member to approve it before the worker executes it.
 */
export function scheduleRetentionDeletion(
  dataClass: DataClass,
  orgId: string,
): RetentionDeletionJob {
  const policy = getRetentionPolicy(dataClass);
  const scheduledFor = new Date(Date.now() + (policy?.retentionDays ?? 365) * 24 * 60 * 60 * 1000);

  const job: RetentionDeletionJob = {
    jobId: `rdj_${dataClass}_${orgId}_${Date.now()}`,
    dataClass,
    orgId,
    scheduledFor,
    status: policy?.requiresApproval ? "pending" : "approved",
    legalHold: false,
    createdAt: new Date(),
  };

  // TODO: persist to DB
  // await db.retention_deletion_jobs.create({ data: job });

  return job;
}

/**
 * Places a legal hold on a deletion job, preventing it from executing.
 * Used during litigation, regulatory investigation, or audit.
 */
export function placeLegalHold(jobId: string): void {
  // TODO: db.retention_deletion_jobs.update({ where: { jobId }, data: { legalHold: true, status: "held" } });
  void jobId;
}
