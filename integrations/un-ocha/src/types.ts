/**
 * Source record types for the UN OCHA + ReliefWeb humanitarian integration.
 *
 * Sources covered:
 *   - HDX  (Humanitarian Data Exchange, https://data.humdata.org) — CKAN-based dataset catalog.
 *   - ReliefWeb (https://reliefweb.int) — situation reports + crisis updates.
 *   - IOM DTM (Displacement Tracking Matrix, https://dtm.iom.int) — displacement flow/stock figures.
 *   - Humanitarian cluster reports (health / shelter / food security / WASH).
 *
 * EN is canonical. User-facing strings carry localized en/uk summaries.
 *
 * PII NOTE: these source types describe AGGREGATE humanitarian data. Records MUST be
 * passed through `pii-redaction.ts` before they leave the package (fail-closed invariant).
 */

/** Multilingual text field, EN canonical. */
export interface LocalizedSummary {
  en: string;
  uk?: string;
}

/** Open data licenses commonly attached to HDX / ReliefWeb resources. */
export type HumanitarianLicense =
  | "cc-by"
  | "cc-by-igo"
  | "cc-by-sa"
  | "cc-by-nc"
  | "cc-zero"
  | "cc-by-nd"
  | "hdx-other"
  | "other-pd"
  | "other-closed"
  | "unknown";

/** Humanitarian clusters per the IASC cluster system. */
export type HumanitarianCluster =
  | "health"
  | "shelter"
  | "food_security"
  | "wash"
  | "protection"
  | "education"
  | "nutrition"
  | "logistics"
  | "early_recovery"
  | "ccm" // camp coordination & camp management
  | "multi";

// ── HDX (CKAN model) ──────────────────────────────────────────────────────────

/** A downloadable file/resource within an HDX dataset (CKAN `resource`). */
export interface HdxResource {
  id: string;
  name: string;
  format: string;            // CSV | XLSX | GeoJSON | JSON | PDF | ...
  url: string;
  description?: string;
  lastModified?: string;     // ISO-8601
  size?: number;             // bytes
}

/** An HDX dataset (CKAN `package`). */
export interface HdxDataset {
  id: string;
  name: string;              // CKAN slug, e.g. "ukraine-idp-figures"
  title: string;
  notes?: string;            // description / markdown
  organization: string;      // owning org, e.g. "OCHA Ukraine"
  source?: string;
  license: HumanitarianLicense;
  /** Geographic coverage as ISO 3166-1 alpha-2 codes (HDX `groups`). */
  countries: string[];
  tags: string[];
  datasetDate?: string;      // reference date / period (ISO-8601 or range)
  lastModified?: string;     // ISO-8601
  resources: HdxResource[];
  /** HDX HXL/quality flags. */
  hasQuickcharts?: boolean;
  isCrisisRelated?: boolean;
  pageUrl: string;           // human-readable landing page
}

// ── ReliefWeb ─────────────────────────────────────────────────────────────────

export type ReliefWebReportFormat =
  | "situation_report"
  | "news"
  | "analysis"
  | "assessment"
  | "appeal"
  | "map"
  | "infographic"
  | "other";

/** A ReliefWeb report node. */
export interface ReliefWebReport {
  id: string;
  title: string;
  format: ReliefWebReportFormat;
  source: string[];          // publishing orgs, e.g. ["OCHA", "UNHCR"]
  countries: string[];       // ISO 3166-1 alpha-2
  themes: string[];          // e.g. ["Health", "Protection"]
  disasterTypes?: string[];
  /** Cluster classification when the report is cluster-scoped. */
  cluster?: HumanitarianCluster;
  body?: string;             // full text (may contain PII → must be redacted)
  bodyHtml?: string;
  publishedAt: string;       // ISO-8601
  url: string;               // reliefweb.int permalink
  originUrl?: string;        // original publisher URL
  language: string;          // ISO 639-1
}

// ── IOM DTM (Displacement Tracking Matrix) ────────────────────────────────────

export type DisplacementMeasure = "stock" | "flow_in" | "flow_out" | "returnee";

/** A displacement figure for an admin area at a point in time. */
export interface DtmDisplacementRecord {
  id: string;
  country: string;           // ISO 3166-1 alpha-2
  admin1Name: string;        // oblast / region
  admin1Pcode?: string;      // P-code (e.g. UA07)
  admin2Name?: string;       // raion
  admin2Pcode?: string;
  measure: DisplacementMeasure;
  /** Number of individuals (AGGREGATE — never individual records). */
  individuals: number;
  households?: number;
  /** Centroid of the admin area, NOT of any individual. */
  centroid?: { lat: number; lon: number };
  roundNumber?: number;      // DTM assessment round
  reportingDate: string;     // ISO-8601
  source: string;            // e.g. "IOM DTM Ukraine"
  url?: string;
}

// ── Per-cluster reports ───────────────────────────────────────────────────────

/** People-in-need / reached figures for a cluster in an area. */
export interface ClusterReport {
  id: string;
  cluster: HumanitarianCluster;
  country: string;           // ISO 3166-1 alpha-2
  admin1Name?: string;
  admin1Pcode?: string;
  centroid?: { lat: number; lon: number };
  peopleInNeed?: number;
  peopleTargeted?: number;
  peopleReached?: number;
  /** Cluster-specific severity 1–5 (5 = catastrophic). */
  severity: 1 | 2 | 3 | 4 | 5;
  reportingPeriod: string;   // ISO-8601 or "2026-Q1"
  summary: LocalizedSummary;
  source: string;
  url?: string;
}

// ── Subscriptions / ingest ────────────────────────────────────────────────────

export type IngestCadence = "daily" | "weekly" | "on_update";

/** A standing subscription to a set of HDX datasets. */
export interface HdxSubscription {
  id: string;
  /** CKAN dataset slugs OR tag/org queries to watch. */
  datasetNames?: string[];
  tags?: string[];
  organization?: string;
  countries?: string[];      // ISO 3166-1 alpha-2 filter
  cadence: IngestCadence;
  /** Only ingest resources in these formats. */
  formats?: string[];
  /** Last successfully ingested dataset `lastModified` per dataset name. */
  cursor?: Record<string, string>;
  enabled: boolean;
}

/** Result of one ingest run. */
export interface IngestResult {
  subscriptionId?: string;
  startedAt: string;
  finishedAt: string;
  datasetsSeen: number;
  datasetsChanged: number;
  reportsIngested: number;
  recordsRedacted: number;   // count of records that hit the PII redactor
  recordsBlocked: number;    // count fail-closed (dropped because un-redactable)
  errors: string[];
}

/** Stable cluster taxonomy metadata for display. */
export interface ClusterMeta {
  cluster: HumanitarianCluster;
  nameEn: string;
  nameUk: string;
  /** Lead agency (informational). */
  leadAgency: string;
  color: string;             // hex for legends/paint
}
