/**
 * Bulk Data Licensing — Aegis Lens / Ukrainian MAP
 *
 * Products for redistribution, academic research, and downstream ML training.
 * Distinct from SaaS API (end-application use) — this is redistribution rights.
 * Ціна на порядки вища за API.
 *
 * All monetary values in USD.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Stable SKU identifiers for each data product. */
export type DataLicenseSku =
  | "historical-event-archive"
  | "geocoded-incidents"
  | "entity-kg-dump"
  | "verified-media-corpus"
  | "custom-slice"
  | "ml-training-license";

/**
 * A bulk data product available for licensing.
 *
 * Продукт масового ліцензування даних.
 */
export interface DataProduct {
  /** Product SKU. */
  id: DataLicenseSku;
  /** Product name in English. */
  name_en: string;
  /** Product description in English. */
  description_en: string;
  /** File formats in which the data is delivered. */
  format: string[];
  /** Geographic / temporal coverage description. */
  coverage: string;
  /** How often the dataset is updated after purchase. */
  updateCadence: string;
  /** One-off snapshot price range in USD. */
  pricingOneOff: { min: number; max: number };
  /** Annual subscription price range in USD. */
  pricingAnnual: { min: number; max: number };
  /** Per-row metered pricing in USD (undefined for flat-fee only products). */
  pricingPerRow?: { min: number; max: number };
  /** Academic / non-profit discount percentage (0–100). */
  academicDiscountPct: number;
  /** Whether the licensee may redistribute the data to third parties. */
  redistributionAllowed: boolean;
  /** Whether the data may be used for ML model training. */
  mlTrainingAllowed: boolean;
  /** Whether an NDA is required before purchase. */
  requiresNDA: boolean;
}

// ── Data product catalog ──────────────────────────────────────────────────────

/**
 * All bulk data products available for licensing.
 *
 * Каталог продуктів масового ліцензування.
 */
export const DATA_PRODUCTS: DataProduct[] = [
  {
    id: "historical-event-archive",
    name_en: "Historical Event Archive (Bulk)",
    description_en:
      "Full corpus of verified conflict events from 2014 to present: structured records with coordinates, timestamps, event types, source URLs, and confidence scores. Daily snapshots on S3, delivered in Parquet and JSONL.",
    format: ["Parquet", "JSONL", "CSV"],
    coverage: "Ukraine + adjacent conflict zones, 2014–present, updated daily",
    updateCadence: "Daily delta + weekly full snapshot",
    pricingOneOff: { min: 2_000, max: 50_000 },
    pricingAnnual: { min: 25_000, max: 100_000 },
    pricingPerRow: { min: 0.001, max: 0.01 },
    academicDiscountPct: 90,
    redistributionAllowed: false,
    mlTrainingAllowed: false,
    requiresNDA: false,
  },
  {
    id: "geocoded-incidents",
    name_en: "Geocoded Incidents Dataset",
    description_en:
      "Verified-only subset of events with high-confidence geocoding: each record carries a lat/lon, confidence radius in metres, and at least two independent source confirmations. Ideal for GIS and spatial analytics.",
    format: ["GeoJSON", "Parquet", "Shapefile"],
    coverage: "Ukraine, 2022–present, ~340,000 verified incidents",
    updateCadence: "Weekly",
    pricingOneOff: { min: 5_000, max: 30_000 },
    pricingAnnual: { min: 25_000, max: 75_000 },
    pricingPerRow: { min: 0.002, max: 0.01 },
    academicDiscountPct: 90,
    redistributionAllowed: false,
    mlTrainingAllowed: false,
    requiresNDA: false,
  },
  {
    id: "entity-kg-dump",
    name_en: "Entity Knowledge Graph Dump",
    description_en:
      "Structured snapshot of the Aegis Lens knowledge graph: entities (organisations, persons, equipment, locations), relations, temporal bounds, and provenance metadata. Supports KG-RAG and graph analytics pipelines.",
    format: ["Parquet", "RDF/N-Triples", "JSON-LD"],
    coverage: "Global entities relevant to Ukraine conflict, 2022–present",
    updateCadence: "Quarterly",
    pricingOneOff: { min: 10_000, max: 50_000 },
    pricingAnnual: { min: 40_000, max: 150_000 },
    pricingPerRow: undefined,
    academicDiscountPct: 90,
    redistributionAllowed: false,
    mlTrainingAllowed: true,
    requiresNDA: true,
  },
  {
    id: "verified-media-corpus",
    name_en: "Verified Media Corpus",
    description_en:
      "Curated collection of photographs and videos with verified metadata: geolocation fix, timestamp, event context, and source credibility rating. Subject to upstream source licenses. Faces and civilian PII redacted.",
    format: ["ZIP (media + JSONL manifest)"],
    coverage: "Ukraine conflict media, 2022–present, ~640,000 items",
    updateCadence: "Monthly",
    pricingOneOff: { min: 20_000, max: 50_000 },
    pricingAnnual: { min: 50_000, max: 250_000 },
    pricingPerRow: { min: 0.01, max: 0.05 },
    academicDiscountPct: 90,
    redistributionAllowed: false,
    mlTrainingAllowed: true,
    requiresNDA: true,
  },
  {
    id: "custom-slice",
    name_en: "Custom Data Slice",
    description_en:
      "Bespoke dataset cut by date range, geographic bounding box, event category, or entity type. Delivered within 5–10 business days after scope agreement. Priced by slice size and complexity.",
    format: ["JSONL", "Parquet", "CSV", "GeoJSON"],
    coverage: "Any subset of Aegis Lens data holdings — quoted per request",
    updateCadence: "One-time unless subscription upgrade agreed",
    pricingOneOff: { min: 2_000, max: 50_000 },
    pricingAnnual: { min: 25_000, max: 250_000 },
    pricingPerRow: { min: 0.001, max: 0.01 },
    academicDiscountPct: 90,
    redistributionAllowed: false,
    mlTrainingAllowed: false,
    requiresNDA: false,
  },
  {
    id: "ml-training-license",
    name_en: "ML Training License (Special)",
    description_en:
      "Explicit grant for machine learning model training on any Aegis Lens data product. Includes carve-outs for upstream source licenses, PII scrub certification, provenance metadata, and contractual prohibited-use clauses. Requires NDA and legal review.",
    format: ["Same as underlying data product"],
    coverage: "Scoped to agreed data product(s)",
    updateCadence: "Per underlying product cadence",
    pricingOneOff: { min: 50_000, max: 500_000 },
    pricingAnnual: { min: 100_000, max: 1_000_000 },
    pricingPerRow: undefined,
    academicDiscountPct: 30,
    redistributionAllowed: false,
    mlTrainingAllowed: true,
    requiresNDA: true,
  },
];

// ── License agreement interface ───────────────────────────────────────────────

/**
 * A signed data license agreement record.
 *
 * Запис підписаного договору ліцензування даних.
 */
export interface DataLicenseAgreement {
  /** Unique agreement ID. */
  id: string;
  /** Purchasing organisation name. */
  buyerOrg: string;
  /** SKUs of the data products licensed under this agreement. */
  productIds: DataLicenseSku[];
  /** License type. */
  licenseType: "one-off" | "annual" | "perpetual" | "ml-training";
  /** ISO 8601 date when the agreement was signed. */
  signedAt?: string;
  /** ISO 8601 date when the license expires (undefined = perpetual). */
  expiresAt?: string;
  /** Total contract value in USD. */
  totalAmountUsd: number;
  /** Whether the buyer has redistribution rights for this agreement. */
  redistributionRights: boolean;
  /** Whether an NDA has been signed. */
  ndaSigned: boolean;
}

// ── Academic discount ─────────────────────────────────────────────────────────

/**
 * Academic / non-profit discount configuration.
 * 90% off for verified academic institutions, capped at $5,000.
 *
 * Академічна знижка: 90% для верифікованих закладів, не більше $5 000.
 */
export const DATA_ACADEMIC_DISCOUNT: {
  pct: number;
  verification: "edu-email" | "institutional-letter";
  maxValueUsd: number;
} = {
  pct: 90,
  verification: "institutional-letter",
  maxValueUsd: 5_000,
};

// ── Prohibited uses ───────────────────────────────────────────────────────────

/**
 * Uses that are prohibited under all Aegis Lens data licenses.
 * Included by reference in every license agreement.
 *
 * Заборонені способи використання в усіх договорах ліцензування даних.
 */
export const DATA_LICENSING_PROHIBITED_USES: string[] = [
  "Developing, training, or improving autonomous weapons systems or targeting algorithms",
  "Mass surveillance of civilian populations, including predictive policing at scale",
  "Doxxing, identifying, tracking, or harassing private individuals",
  "Re-selling or redistributing licensed data to third parties without written consent",
  "Circumventing international sanctions, export controls, or anti-money laundering regulations",
  "Training models whose primary purpose is generating disinformation or propaganda",
  "Any use by entities on US OFAC, EU, UK, or UN sanctions lists",
  "Insurance redlining or algorithmic discrimination based on geographic proximity to conflict",
  "Commercial competitive intelligence against Aegis Lens Ltd or its subsidiaries",
];

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Look up a data product by its SKU.
 * Пошук продукту за SKU.
 */
export function getDataProduct(sku: DataLicenseSku): DataProduct | undefined {
  return DATA_PRODUCTS.find((p) => p.id === sku);
}

/**
 * Compute quoted price for a data product taking into account license type
 * and academic discount.
 *
 * Розрахунок орієнтовної ціни з урахуванням типу ліцензії та знижки.
 */
export function quoteDataProduct(
  sku: DataLicenseSku,
  licenseType: "one-off" | "annual",
  isAcademic: boolean,
): { min: number; max: number } {
  const product = getDataProduct(sku);
  if (!product) return { min: 0, max: 0 };

  const range =
    licenseType === "annual"
      ? product.pricingAnnual
      : product.pricingOneOff;

  if (!isAcademic) return range;

  const discountMultiplier = 1 - product.academicDiscountPct / 100;
  const minDiscounted = Math.min(
    Math.round(range.min * discountMultiplier),
    DATA_ACADEMIC_DISCOUNT.maxValueUsd,
  );
  const maxDiscounted = Math.min(
    Math.round(range.max * discountMultiplier),
    DATA_ACADEMIC_DISCOUNT.maxValueUsd,
  );

  return { min: minDiscounted, max: maxDiscounted };
}
