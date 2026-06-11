/**
 * Source record types for the data.gov.ua + civic-tech integration.
 *
 * Sources covered:
 *   - data.gov.ua (https://data.gov.ua) — Ukraine's national open-data portal,
 *     CKAN-based; catalogs EDR (ЄДР/ЄДРПОУ company registry), address registers,
 *     infrastructure datasets.
 *   - OpenDataBot (https://opendatabot.ua) — company-registry enrichment / business
 *     intelligence built on the state registers.
 *   - YouControl (https://youcontrol.com.ua) — entity verification / due-diligence
 *     analytics on Ukrainian legal entities.
 *   - Texty.org.ua (https://texty.org.ua) — data-journalism datasets & investigations.
 *   - Prozorro (https://prozorro.gov.ua) — public-procurement transparency
 *     (tenders, awards, suppliers) via the openprocurement API.
 *
 * EN is canonical for code; user-facing strings carry localized en/uk text.
 * The Ukrainian source language is UK; EN translations are provided for the
 * international audience.
 *
 * COMPLIANCE NOTE: every source has its own license/ToS. Republication of a
 * normalized record is gated on `isRedistributable(license)` — see
 * `data-gov-client.ts` and `COMPLIANCE.md`. Personal-data minimization applies:
 * we ingest *legal-entity* registry facts (company name, ЄДРПОУ, status,
 * address, activity), not natural-person PII beyond what the public registry
 * itself publishes for a registered company (director name as a public officer).
 */

// ── Localized text (EN canonical) ─────────────────────────────────────────────

export interface LocalizedText {
  en: string;
  uk?: string;
}

// ── Open-data licenses seen across these sources ──────────────────────────────

export type OpenDataLicense =
  | "cc-by"          // CC BY 4.0
  | "cc-by-sa"       // CC BY-SA 4.0
  | "cc-zero"        // CC0 / public domain
  | "cc-by-nc"       // non-commercial — NOT redistributed
  | "cc-by-nd"       // no-derivatives — NOT redistributed (our normalization is a derivative)
  | "ogl-ua"         // Ukrainian open-data portal default reuse terms (CMU 835)
  | "other-open"     // some other open license (treated as redistributable w/ attribution)
  | "proprietary"    // vendor data (OpenDataBot/YouControl analytics) — link-out only
  | "unknown";

/** Licenses we consider safe to RE-HOST (normalized) with attribution. */
export const REDISTRIBUTABLE_LICENSES: ReadonlySet<OpenDataLicense> = new Set<OpenDataLicense>([
  "cc-by",
  "cc-by-sa",
  "cc-zero",
  "ogl-ua",
  "other-open",
]);

export function isRedistributable(license: OpenDataLicense): boolean {
  return REDISTRIBUTABLE_LICENSES.has(license);
}

/** Map a raw CKAN `license_id` (or vendor label) → our enum. */
export function mapLicense(licenseId?: string): OpenDataLicense {
  switch ((licenseId ?? "").toLowerCase().trim()) {
    case "cc-by":
    case "cc-by-4.0":
      return "cc-by";
    case "cc-by-sa":
    case "cc-by-sa-4.0":
      return "cc-by-sa";
    case "cc-zero":
    case "cc0-1.0":
    case "public-domain":
      return "cc-zero";
    case "cc-by-nc":
    case "cc-by-nc-4.0":
      return "cc-by-nc";
    case "cc-by-nd":
    case "cc-by-nd-4.0":
      return "cc-by-nd";
    case "ogl-ua":
    case "open-data-ua":
    case "cmu-835":
      return "ogl-ua";
    case "proprietary":
    case "commercial":
      return "proprietary";
    case "":
    case "notspecified":
    case "none":
      return "unknown";
    default:
      return licenseId?.startsWith("cc-") ? "other-open" : "unknown";
  }
}

// ── data.gov.ua (CKAN) dataset catalog ────────────────────────────────────────

export interface DataGovResource {
  id: string;
  name: string;
  /** UPPERCASE format, e.g. CSV / XLSX / JSON / XML / GEOJSON. */
  format: string;
  url: string;
  description?: string;
  lastModified?: string;
  size?: number;
}

/** Broad topical tag for catalog datasets relevant to entity enrichment. */
export type DataGovTopic =
  | "edr"            // company / NGO registry (ЄДР/ЄДРПОУ)
  | "addresses"     // address registers
  | "infrastructure"
  | "budget"
  | "transport"
  | "other";

export interface DataGovDataset {
  id: string;
  /** CKAN slug. */
  name: string;
  title: string;
  notes?: string;
  organization: string;
  topic: DataGovTopic;
  license: OpenDataLicense;
  tags: string[];
  datasetDate?: string;
  lastModified?: string;
  resources: DataGovResource[];
  pageUrl: string;
}

// ── Company registry record (the heart of entity enrichment) ──────────────────

/** Company / legal-entity status from the state register. */
export type CompanyStatus =
  | "active"          // зареєстровано / активна
  | "terminating"     // в стані припинення
  | "terminated"      // припинено
  | "bankrupt"        // банкрутство
  | "suspended"
  | "unknown";

/** Where a registry fact came from. */
export type RegistryProvider =
  | "data-gov-ua"     // EDR open dataset on the portal
  | "opendatabot"
  | "youcontrol"
  | "prozorro"
  | "texty";

/** A registered public officer (director / signatory) — public registry role,
 * not arbitrary PII. Only the role + name as published in the state register. */
export interface RegistryOfficer {
  /** Full name as published in the public register. */
  name: string;
  /** Role label, e.g. "director", "head", "signatory". */
  role: LocalizedText;
}

/** KVED / NACE economic-activity classification. */
export interface EconomicActivity {
  /** KVED code, e.g. "62.01". */
  code: string;
  name: LocalizedText;
  /** True if this is the primary (основний) activity. */
  primary?: boolean;
}

/**
 * Normalized company / institution record keyed by ЄДРПОУ (EDRPOU) code.
 * This is the canonical "registry fact" the KG enrichment hangs off of.
 */
export interface CompanyRecord {
  /** 8-digit ЄДРПОУ (EDRPOU) code — Ukraine's legal-entity registry number. */
  edrpou: string;
  name: LocalizedText;
  /** Short / trade name if distinct from the full legal name. */
  shortName?: LocalizedText;
  status: CompanyStatus;
  /** Registered legal address (city-level retained; full street as published). */
  address?: LocalizedText;
  /** Registered officers (public role-holders). */
  officers?: RegistryOfficer[];
  /** KVED economic-activity codes. */
  activities?: EconomicActivity[];
  /** Registration date (ISO-8601). */
  registeredAt?: string;
  /** Authorized capital, in UAH, if published. */
  authorizedCapitalUah?: number;
  /** True if the entity appears on a sanctions / risk list (verification signal). */
  flaggedRisk?: boolean;
  /** Provenance: which providers contributed to this record. */
  providers: RegistryProvider[];
  /** Source citations (one per contributing provider). */
  sources: RegistrySource[];
  /** Last time any provider refreshed this record (ISO-8601). */
  updatedAt: string;
}

export interface RegistrySource {
  provider: RegistryProvider;
  url?: string;
  license: OpenDataLicense;
  capturedAt: string;
}

// ── Prozorro (public procurement) ─────────────────────────────────────────────

export type ProcurementStatus =
  | "active.tendering"
  | "active.qualification"
  | "active.awarded"
  | "complete"
  | "cancelled"
  | "unsuccessful";

export interface ProcurementTender {
  /** OCDS tender id (openprocurement). */
  tenderId: string;
  title: LocalizedText;
  status: ProcurementStatus;
  /** Procuring entity (buyer) ЄДРПОУ + name. */
  buyerEdrpou?: string;
  buyerName: LocalizedText;
  /** Winning supplier ЄДРПОУ + name, if awarded. */
  supplierEdrpou?: string;
  supplierName?: LocalizedText;
  amountUah?: number;
  date: string;
  url: string;
}

// ── Texty.org.ua (data-journalism dataset descriptors) ────────────────────────

export interface TextyDataset {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  /** Investigation / dataset URL. */
  url: string;
  publishedAt?: string;
  tags: string[];
  license: OpenDataLicense;
  /** ЄДРПОУ codes referenced by the investigation (for cross-linking). */
  relatedEdrpou?: string[];
}

// ── Knowledge-Graph entity (enrichment target) ────────────────────────────────

export type KgEntityType = "company" | "institution" | "ngo";

/**
 * KG entity enriched with registry data. `entityId`/`slug` join to existing
 * entity pages (see apps/web `/entities/<slug>`). Additive shape mirroring the
 * conventions used by oryx `kg-mapping.ts` (slug + localized name + sources),
 * ready to adapt to the canonical KG type when one lands.
 */
export interface RegistryEntity {
  /** KG entity id, namespaced: `company:<edrpou>` / `institution:<edrpou>`. */
  entityId: string;
  /** Slug for the entity page (`edrpou-<code>`). */
  slug: string;
  entityType: KgEntityType;
  edrpou: string;
  name: LocalizedText;
  status: CompanyStatus;
  address?: LocalizedText;
  /** Primary economic activity, if known. */
  primaryActivity?: EconomicActivity;
  /** Procurement footprint (counts + total UAH won/issued). */
  procurement?: {
    tendersAsBuyer: number;
    tendersAsSupplier: number;
    totalAwardedUah: number;
  };
  /** Investigations / datasets that reference this entity. */
  investigationLinks?: InvestigationLink[];
  /** All registry sources backing this entity. */
  sources: RegistrySource[];
  /** Localized human-readable summary line. */
  description: LocalizedText;
  flaggedRisk?: boolean;
  updatedAt: string;
}

/** A cross-link from an entity to an investigation / data-journalism piece. */
export interface InvestigationLink {
  /** Stable id of the investigation/dataset. */
  investigationId: string;
  title: LocalizedText;
  url: string;
  /** Why it links (e.g. "named in dataset", "procurement counterparty"). */
  relation: LocalizedText;
  source: RegistryProvider;
}

// ── Validation helper ─────────────────────────────────────────────────────────

/** Ukraine's ЄДРПОУ codes are 8 digits (natural-person entrepreneurs use a
 * 10-digit РНОКПП; we accept 8 here and tolerate the 10-digit form). */
export function isValidEdrpou(code: string): boolean {
  return /^\d{8}$/.test(code) || /^\d{10}$/.test(code);
}

export function normalizeEdrpou(code: string): string {
  const digits = (code ?? "").replace(/\D/g, "");
  // ЄДРПОУ is canonically zero-padded to 8 digits.
  return digits.length < 8 ? digits.padStart(8, "0") : digits;
}
