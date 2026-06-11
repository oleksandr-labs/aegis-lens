/**
 * Compliance roadmap: SOC 2, ISO 27001, GDPR, UK GDPR, EU AI Act.
 *
 * Provides:
 *   - ComplianceMilestone — structured roadmap items with status tracking
 *   - COMPLIANCE_ROADMAP  — all milestones covering enterprise requirements
 *   - computeComplianceScore — % done
 *   - COMPLIANCE_TRUST_PAGE_SECTIONS — content stubs for /trust page
 *
 * Дорожня карта відповідності: SOC 2, ISO 27001, GDPR, EU AI Act.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ComplianceMilestone {
  id: string;
  framework:
    | "soc2-type1"
    | "soc2-type2"
    | "iso27001"
    | "gdpr"
    | "uk-gdpr"
    | "eu-ai-act"
    | "pen-test";
  phase: 1 | 2 | 3;
  targetDate?: string;
  status: "not-started" | "in-progress" | "complete";
  description_en: string;
  owner_en: string;
  blockers_en: string[];
}

// ── Roadmap data ──────────────────────────────────────────────────────────────

/**
 * Full compliance roadmap covering all enterprise-readiness requirements.
 * Maps 1:1 to TODO_enterprise_roadmap.md items.
 *
 * Всі milestone для enterprise-готовності.
 */
export const COMPLIANCE_ROADMAP: ComplianceMilestone[] = [
  // ── Phase 1: Foundational ──────────────────────────────────────────────────
  {
    id: "sso",
    framework: "soc2-type1",
    phase: 1,
    targetDate: "2026-09-01",
    status: "in-progress",
    description_en:
      "SSO (SAML 2.0 + OIDC) via WorkOS — single-connection onboarding for enterprise orgs.",
    owner_en: "Engineering",
    blockers_en: [],
  },
  {
    id: "scim",
    framework: "soc2-type1",
    phase: 1,
    targetDate: "2026-09-01",
    status: "in-progress",
    description_en:
      "SCIM 2.0 automated user/group provisioning and deprovisioning from enterprise IdPs.",
    owner_en: "Engineering",
    blockers_en: [],
  },
  {
    id: "rbac",
    framework: "soc2-type1",
    phase: 1,
    targetDate: "2026-09-01",
    status: "in-progress",
    description_en:
      "RBAC (6 org roles) + ABAC geo-fence policies for classified data layers.",
    owner_en: "Engineering",
    blockers_en: [],
  },
  {
    id: "audit-logs",
    framework: "soc2-type1",
    phase: 1,
    targetDate: "2026-09-01",
    status: "in-progress",
    description_en:
      "Tamper-evident audit log with SHA-256 hash chain; exportable for compliance auditors.",
    owner_en: "Engineering",
    blockers_en: [],
  },
  {
    id: "dpa-subprocessors",
    framework: "gdpr",
    phase: 1,
    targetDate: "2026-09-01",
    status: "in-progress",
    description_en:
      "DPA template (v2.1) + subprocessor register (15 vendors); auto-issue on org signup.",
    owner_en: "Legal + Engineering",
    blockers_en: ["Legal review of DPA template wording"],
  },

  // ── Phase 2: Trust & Compliance ────────────────────────────────────────────
  {
    id: "soc2-type1",
    framework: "soc2-type1",
    phase: 2,
    targetDate: "2026-12-01",
    status: "not-started",
    description_en:
      "SOC 2 Type I audit: point-in-time assessment of security controls.",
    owner_en: "Security + Legal",
    blockers_en: ["Audit firm selection", "Evidence collection tooling"],
  },
  {
    id: "soc2-type2",
    framework: "soc2-type2",
    phase: 2,
    targetDate: "2027-06-01",
    status: "not-started",
    description_en:
      "SOC 2 Type II audit: 6-month operating effectiveness period after Type I.",
    owner_en: "Security + Legal",
    blockers_en: ["SOC 2 Type I completion"],
  },
  {
    id: "iso27001",
    framework: "iso27001",
    phase: 2,
    targetDate: "2027-12-01",
    status: "not-started",
    description_en:
      "ISO 27001 ISMS roadmap: gap analysis → risk register → controls → audit.",
    owner_en: "Security",
    blockers_en: ["ISO 27001 consultant engagement"],
  },
  {
    id: "gdpr-uk-swiss",
    framework: "uk-gdpr",
    phase: 2,
    targetDate: "2026-10-01",
    status: "not-started",
    description_en:
      "GDPR / UK GDPR / Swiss nFADP DPA templates; DSR workflow; data residency options.",
    owner_en: "Legal",
    blockers_en: ["Legal review"],
  },
  {
    id: "eu-ai-act",
    framework: "eu-ai-act",
    phase: 2,
    targetDate: "2027-02-01",
    status: "not-started",
    description_en:
      "EU AI Act readiness assessment: classify AI systems, document high-risk use cases.",
    owner_en: "Legal + Product",
    blockers_en: ["EU AI Act application date clarification"],
  },
  {
    id: "pen-test",
    framework: "pen-test",
    phase: 2,
    targetDate: "2026-11-01",
    status: "not-started",
    description_en:
      "External penetration test by CREST-accredited firm; publishable summary report.",
    owner_en: "Security",
    blockers_en: ["Pen-test vendor selection", "Scope definition"],
  },

  // ── Phase 3: Deployment Sovereignty ───────────────────────────────────────
  {
    id: "sovereign-deployment",
    framework: "soc2-type2",
    phase: 3,
    targetDate: "2027-03-01",
    status: "not-started",
    description_en:
      "Sovereign deployment options: SaaS, AWS GovCloud, OVH SecNumCloud (EU), UA-resident, on-prem.",
    owner_en: "DevOps + Sales",
    blockers_en: ["Infra automation", "Customer contracts"],
  },
  {
    id: "air-gapped-installer",
    framework: "soc2-type2",
    phase: 3,
    targetDate: "2027-06-01",
    status: "not-started",
    description_en:
      "Air-gapped installer bundle for classified-network deployment (no egress required).",
    owner_en: "DevOps",
    blockers_en: ["Sovereign deployment completion"],
  },
  {
    id: "custom-data-layers",
    framework: "soc2-type2",
    phase: 3,
    targetDate: "2027-03-01",
    status: "not-started",
    description_en:
      "Customer-managed custom data layers: upload proprietary feeds, private overlays.",
    owner_en: "Product + Engineering",
    blockers_en: [],
  },
  {
    id: "byo-kms",
    framework: "soc2-type2",
    phase: 3,
    targetDate: "2027-03-01",
    status: "not-started",
    description_en:
      "BYO encryption keys (KMS): AWS KMS, Azure Key Vault, HashiCorp Vault integration.",
    owner_en: "Security + Engineering",
    blockers_en: [],
  },
  {
    id: "customer-success",
    framework: "soc2-type2",
    phase: 3,
    targetDate: "2026-12-01",
    status: "not-started",
    description_en:
      "Customer success program for top-50 enterprise accounts: dedicated CSM, QBRs, SLAs.",
    owner_en: "Revenue",
    blockers_en: ["CSM hiring"],
  },
];

// ── Score ─────────────────────────────────────────────────────────────────────

/**
 * Compute % of milestones with status 'complete'.
 *
 * Повертає відсоток виконаних milestone.
 */
export function computeComplianceScore(
  milestones: ComplianceMilestone[],
): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.status === "complete").length;
  return Math.round((done / milestones.length) * 100);
}

// ── Trust page sections ───────────────────────────────────────────────────────

/**
 * Content stubs for the /trust page.
 * Replace content_en with full prose before publishing.
 *
 * Заготовки для сторінки /trust (Trust Center).
 */
export const COMPLIANCE_TRUST_PAGE_SECTIONS: {
  id: string;
  title_en: string;
  content_en: string;
}[] = [
  {
    id: "overview",
    title_en: "Security Overview",
    content_en:
      "Aegis Lens is built with security-first principles. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is governed by role-based and attribute-based controls.",
  },
  {
    id: "soc2",
    title_en: "SOC 2 Compliance",
    content_en:
      "We are pursuing SOC 2 Type I by Q4 2026 and Type II by H1 2027. Our controls span Security, Availability, Confidentiality, and Processing Integrity.",
  },
  {
    id: "iso27001",
    title_en: "ISO 27001",
    content_en:
      "Our ISO 27001 ISMS roadmap begins with a gap analysis in 2026. Certification is targeted for H2 2027.",
  },
  {
    id: "gdpr",
    title_en: "GDPR & UK GDPR",
    content_en:
      "We act as a data processor for customer organisations. Our DPA (v2.1) is available on request. EU data residency is available on Enterprise plans. Data subject requests are handled within 30 days.",
  },
  {
    id: "uk-gdpr",
    title_en: "UK GDPR",
    content_en:
      "Aegis Lens is registered with the ICO. UK customers may elect UK-resident data storage. Our DPA includes UK GDPR addendum.",
  },
  {
    id: "eu-ai-act",
    title_en: "EU AI Act Readiness",
    content_en:
      "We are conducting an EU AI Act classification review of all AI-powered features. High-risk AI system documentation will be published prior to the Act's enforcement dates.",
  },
  {
    id: "pen-test",
    title_en: "Penetration Testing",
    content_en:
      "Annual external penetration tests are conducted by a CREST-accredited firm. An executive summary of findings and remediation status is available to enterprise customers under NDA.",
  },
  {
    id: "subprocessors",
    title_en: "Subprocessors",
    content_en:
      "A full list of subprocessors is maintained and updated whenever a new vendor is added. Enterprise customers are notified 30 days before any new subprocessor is engaged.",
  },
  {
    id: "encryption",
    title_en: "Encryption",
    content_en:
      "Data in transit: TLS 1.3. Data at rest: AES-256. Database encryption: enabled on all managed Postgres instances. BYO KMS (AWS KMS, Azure Key Vault, HashiCorp Vault) available on Sovereign plans.",
  },
  {
    id: "incident-response",
    title_en: "Incident Response",
    content_en:
      "We maintain a documented Incident Response Plan. Security incidents are notified to affected enterprise customers within 72 hours in line with GDPR Art. 33 obligations.",
  },
  {
    id: "access-control",
    title_en: "Access Control",
    content_en:
      "Access to production systems follows least-privilege principles. All engineer access is gated by SSO + MFA. Privileged access is logged and reviewed quarterly.",
  },
  {
    id: "vulnerability-disclosure",
    title_en: "Vulnerability Disclosure",
    content_en:
      "We operate a coordinated disclosure programme. Security researchers may report vulnerabilities to security@aegislens.com. A bug bounty programme (HackerOne) is planned for H2 2026.",
  },
];
