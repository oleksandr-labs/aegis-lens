/**
 * Data Processing Agreement (DPA) registry.
 *
 * Tracks:
 *   - DPA lifecycle per customer org (draft → signed → active → expired)
 *   - Subprocessor list for GDPR Art. 28 / UK GDPR compliance
 *
 * Subprocessors are pre-populated from the list of all third-party
 * services used by Aegis Lens. This list MUST be kept up to date
 * whenever a new vendor is added.
 *
 * DPA реєстр: угоди про обробку даних + список субобробників.
 */

import "server-only";

// ── DPA status ────────────────────────────────────────────────────────────────

export type DpaStatus = "draft" | "signed" | "active" | "expired" | "terminated";

// ── Subprocessor ──────────────────────────────────────────────────────────────

export interface SubprocessorEntry {
  name: string;
  purpose_en: string;
  dataTypes: string[];
  /** Country / jurisdiction of data processing. */
  jurisdiction: string;
  securityMeasures: string[];
  /** Link to the vendor's own DPA or privacy terms. */
  dpaUrl?: string;
  reviewedAt: string;
}

/**
 * Canonical list of Aegis Lens subprocessors.
 * Update whenever a new vendor is added or removed.
 *
 * Список субобробників персональних даних Aegis Lens.
 */
export const DPA_SUBPROCESSORS: SubprocessorEntry[] = [
  {
    name: "Vercel",
    purpose_en: "Web application hosting and edge infrastructure",
    dataTypes: ["IP addresses", "request logs", "session data"],
    jurisdiction: "USA (SCCs / DPF)",
    securityMeasures: ["SOC 2 Type II", "ISO 27001", "TLS in transit", "WAF"],
    dpaUrl: "https://vercel.com/legal/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Supabase",
    purpose_en: "PostgreSQL database (primary data store)",
    dataTypes: ["user data", "org data", "event data", "audit logs"],
    jurisdiction: "USA / EU (choose region on plan)",
    securityMeasures: ["SOC 2 Type II", "AES-256 at rest", "TLS in transit", "Row-level security"],
    dpaUrl: "https://supabase.com/privacy",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Neon",
    purpose_en: "Serverless PostgreSQL (optional secondary DB)",
    dataTypes: ["user data", "org data"],
    jurisdiction: "USA / EU",
    securityMeasures: ["SOC 2 Type II", "AES-256 at rest", "TLS in transit"],
    dpaUrl: "https://neon.tech/privacy-policy",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Upstash",
    purpose_en: "Redis-compatible cache (rate limiting, session tokens)",
    dataTypes: ["session tokens", "rate-limit counters"],
    jurisdiction: "USA / EU (choose region)",
    securityMeasures: ["TLS in transit", "AES-256 at rest", "SOC 2"],
    dpaUrl: "https://upstash.com/trust/dpa.pdf",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Resend",
    purpose_en: "Transactional email delivery",
    dataTypes: ["email addresses", "email content"],
    jurisdiction: "USA",
    securityMeasures: ["TLS in transit", "SPF/DKIM/DMARC"],
    dpaUrl: "https://resend.com/legal/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Stripe",
    purpose_en: "Payment processing and subscription management",
    dataTypes: ["billing info", "email", "name", "IP address"],
    jurisdiction: "USA / EU (DPF)",
    securityMeasures: ["PCI DSS Level 1", "SOC 2 Type II", "ISO 27001"],
    dpaUrl: "https://stripe.com/legal/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "WorkOS",
    purpose_en: "Enterprise SSO, directory sync (SCIM), and audit log",
    dataTypes: ["user identity", "SSO tokens", "directory entries"],
    jurisdiction: "USA",
    securityMeasures: ["SOC 2 Type II", "TLS in transit", "SAML 2.0 / OIDC"],
    dpaUrl: "https://workos.com/legal/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Anthropic",
    purpose_en: "AI Copilot — Claude API for OSINT analysis and summarisation",
    dataTypes: ["query text", "event snippets (no PII by design)"],
    jurisdiction: "USA",
    securityMeasures: ["SOC 2 Type II", "TLS in transit", "data not used for training by default"],
    dpaUrl: "https://www.anthropic.com/legal/privacy",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Cloudflare",
    purpose_en: "CDN, DDoS protection, DNS, WAF",
    dataTypes: ["IP addresses", "request logs"],
    jurisdiction: "USA / global PoPs",
    securityMeasures: ["SOC 2 Type II", "ISO 27001", "PCI DSS"],
    dpaUrl: "https://www.cloudflare.com/cloudflare-customer-dpa/",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Amazon Web Services (AWS)",
    purpose_en: "Optional cloud infrastructure (S3, Lambda, KMS)",
    dataTypes: ["application data", "backups"],
    jurisdiction: "EU-WEST-1 (Ireland) or customer-chosen region",
    securityMeasures: ["ISO 27001", "SOC 2 Type II", "PCI DSS", "CSA STAR"],
    dpaUrl: "https://aws.amazon.com/agreement/",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Qdrant",
    purpose_en: "Vector database for semantic / embedding search",
    dataTypes: ["vector embeddings", "metadata"],
    jurisdiction: "EU (Germany) / self-hosted option",
    securityMeasures: ["TLS in transit", "AES-256 at rest", "RBAC"],
    dpaUrl: "https://qdrant.tech/legal/privacy-policy/",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Plausible Analytics",
    purpose_en: "Privacy-first website analytics (no cookies, no PII)",
    dataTypes: ["page views", "referrer", "country (aggregated)"],
    jurisdiction: "EU (Germany)",
    securityMeasures: ["No PII stored", "EU servers", "GDPR-compliant by design"],
    dpaUrl: "https://plausible.io/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "PostHog",
    purpose_en: "Product analytics and feature flags",
    dataTypes: ["session events", "user properties", "feature flag state"],
    jurisdiction: "USA / EU Cloud (customer choice)",
    securityMeasures: ["SOC 2 Type II", "TLS in transit", "self-host option"],
    dpaUrl: "https://posthog.com/dpa",
    reviewedAt: "2026-01-01",
  },
  {
    name: "Sentry",
    purpose_en: "Error monitoring and performance tracing",
    dataTypes: ["stack traces", "request URLs", "anonymised user IDs"],
    jurisdiction: "USA / EU (customer choice)",
    securityMeasures: ["SOC 2 Type II", "TLS in transit", "PII scrubbing"],
    dpaUrl: "https://sentry.io/legal/dpa/",
    reviewedAt: "2026-01-01",
  },
  {
    name: "OpenTelemetry Collector (self-hosted)",
    purpose_en: "Observability: metrics, traces, logs",
    dataTypes: ["service metrics", "trace spans", "log lines"],
    jurisdiction: "Self-hosted on Hetzner (Frankfurt, DE)",
    securityMeasures: ["ISO 27001 data center", "TLS in transit", "access-controlled"],
    reviewedAt: "2026-01-01",
  },
];

// ── DPA record ────────────────────────────────────────────────────────────────

export interface DPARecord {
  orgId: string;
  /** Semantic version of the DPA template (e.g. "2.1"). */
  version: string;
  signedAt?: string;
  status: DpaStatus;
  jurisdiction: "eu-gdpr" | "uk-gdpr" | "swiss-dpa" | "us-ccpa";
}

// ── Store ─────────────────────────────────────────────────────────────────────

/** Current DPA template version. Bump when the template changes. */
const CURRENT_DPA_VERSION = "2.1";

/**
 * In-memory DPA store.
 * For production back with Postgres and a document signing service
 * (e.g. HelloSign / DocuSign).
 *
 * Зберігає DPA-угоди по orgId; синглтон.
 */
export class DpaStore {
  private readonly records = new Map<string, DPARecord>();

  /**
   * Issue a draft DPA for a new org.
   * Determines jurisdiction from org locale / billing address.
   *
   * Видає чернетку DPA для нової організації.
   */
  issue(
    orgId: string,
    jurisdiction: DPARecord["jurisdiction"] = "uk-gdpr",
  ): DPARecord {
    const existing = this.records.get(orgId);
    if (existing && existing.status !== "expired" && existing.status !== "terminated") {
      return existing;
    }

    const record: DPARecord = {
      orgId,
      version: CURRENT_DPA_VERSION,
      status: "draft",
      jurisdiction,
    };

    this.records.set(orgId, record);
    return record;
  }

  /**
   * Mark a DPA as signed and set status to active.
   *
   * Позначає DPA як підписану та активну.
   */
  sign(orgId: string): void {
    const record = this.records.get(orgId);
    if (!record) throw new Error(`No DPA found for org "${orgId}"`);

    this.records.set(orgId, {
      ...record,
      status: "active",
      signedAt: new Date().toISOString(),
    });
  }

  /**
   * Get the active DPA for an org, or null.
   *
   * Повертає активну DPA або null.
   */
  getActive(orgId: string): DPARecord | null {
    const record = this.records.get(orgId);
    if (!record || record.status !== "active") return null;
    return record;
  }

  /** Get any DPA (any status) for an org. */
  get(orgId: string): DPARecord | null {
    return this.records.get(orgId) ?? null;
  }

  /** Expire a DPA (e.g. when org churns or template version changes). */
  expire(orgId: string): void {
    const record = this.records.get(orgId);
    if (record) this.records.set(orgId, { ...record, status: "expired" });
  }

  /** List all records (for admin compliance dashboard). */
  list(): DPARecord[] {
    return Array.from(this.records.values());
  }
}

/** Singleton DPA store instance. */
export const dpaStore = new DpaStore();
