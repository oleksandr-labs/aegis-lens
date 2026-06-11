/**
 * Shared types for the Copernicus Emergency Management Service (EMS) integration.
 *
 * EMS (https://emergency.copernicus.eu) is the EU's free, public-domain crisis
 * mapping service. It produces, per ACTIVATION, georeferenced maps and vector /
 * raster products for floods, fires, earthquakes, conflict damage and other
 * disasters. Two product lines are relevant here:
 *   - Rapid Mapping (EMSR…) — on-demand, fast crisis maps (the bulk of UA work).
 *   - Risk & Recovery Mapping (EMSN…) — slower, planning / recovery analysis.
 *
 * These are the codeable contracts for the cluster: activation list / RSS model,
 * product-portfolio model, and typed per-activation AOI / vector / raster outputs.
 * Live downloads are provided by `client.ts`; the package is fully usable with
 * demo fixtures and no secrets.
 */

/** A localized user-facing string (this is a UA product — always provide both). */
export interface I18nText {
  en: string;
  uk: string;
}

/** ISO 3166-1 alpha-2 country code. */
export type CountryCode = string;

/** EMS service / product line. */
export type EmsService =
  | "rapid_mapping" // EMSR — on-demand crisis maps
  | "risk_recovery" // EMSN — Risk & Recovery Mapping
  | "validation"; // EGMS / validation products (rare)

/** Hazard category an activation responds to. */
export type EmsHazardType =
  | "flood"
  | "fire" // wildfire
  | "earthquake"
  | "storm"
  | "landslide"
  | "volcanic"
  | "industrial" // industrial / technological accident
  | "conflict" // humanitarian / armed-conflict damage (UA-relevant)
  | "other";

/** Lifecycle state of an activation. */
export type ActivationStatus =
  | "requested"
  | "ongoing"
  | "completed"
  | "closed";

/** Product type within an activation (Rapid Mapping nomenclature). */
export type EmsProductType =
  | "reference" // pre-event reference map
  | "first_estimate" // FEP — first estimate product
  | "delineation" // affected-area extent (e.g. flood extent)
  | "grading" // damage grading / assessment
  | "monitoring"; // repeated monitoring product

/** Output artefact format attached to a product. */
export type EmsOutputFormat =
  | "vector" // GeoJSON / shapefile / GeoPackage (delineation, grading polygons)
  | "raster" // GeoTIFF (classified extent, before/after)
  | "pdf" // cartographic map sheet
  | "json"; // metadata / attributes only

/** EMS damage-grade scale (used by grading products). */
export type DamageGrade =
  | "destroyed"
  | "damaged"
  | "possibly_damaged"
  | "negligible"
  | "not_applicable";

// ── Activation / portfolio models ──────────────────────────────────────────────

/** One Copernicus EMS activation (e.g. EMSR700). */
export interface EmsActivation {
  /** Activation code, e.g. "EMSR700" (Rapid) or "EMSN200" (Risk & Recovery). */
  code: string;
  service: EmsService;
  title: string; // EMS-assigned EN title (original)
  hazard: EmsHazardType;
  status: ActivationStatus;
  /** Affected country/countries (ISO-2). */
  countries: CountryCode[];
  /** Date the activation was triggered (ISO-8601). */
  activatedAt: string;
  /** Approximate event/AOI centroid [lon, lat] (coarse). */
  centroid?: [number, number];
  /** Canonical EMS activation page. */
  url: string;
  /** Number of products published so far (if known). */
  productCount?: number;
}

/** An item in the Rapid Mapping RSS / activation feed. */
export interface EmsFeedItem {
  code: string;
  title: string;
  link: string;
  publishedAt: string;
  hazard: EmsHazardType;
  countries: CountryCode[];
}

/** A product portfolio entry (Risk & Recovery line is portfolio-oriented). */
export interface EmsPortfolioProduct {
  activationCode: string;
  service: EmsService;
  productId: string; // e.g. "EMSR700_AOI01_GRADING_v1"
  type: EmsProductType;
  title: string;
  /** Area-of-interest label. */
  aoi?: string;
  hazard: EmsHazardType;
  releasedAt: string;
  url: string;
}

// ── Per-activation outputs (AOI / vector / raster) ──────────────────────────────

/** A bounding box [west, south, east, north] in WGS-84. */
export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** A typed area-of-interest within an activation. */
export interface ActivationAOI {
  activationCode: string;
  aoiId: string; // e.g. "AOI01"
  name?: string;
  bbox: BBox;
  centroid: [number, number]; // [lon, lat]
  country: CountryCode;
}

/**
 * A vector output (delineation extent or damage-grading polygons). Geometry is
 * carried as GeoJSON Polygon/MultiPolygon coordinate rings; properties hold the
 * EMS attributes we care about (grade, area, notation).
 */
export interface VectorOutput {
  activationCode: string;
  aoiId: string;
  productId: string;
  type: EmsProductType;
  hazard: EmsHazardType;
  /** GeoJSON-style features. */
  features: VectorFeature[];
  /** Source download (GeoJSON / shapefile package). */
  url: string;
  releasedAt: string;
}

export interface VectorFeature {
  /** Polygon rings [[ [lon,lat], … ]] or MultiPolygon. */
  geometry:
    | { type: "Polygon"; coordinates: Array<Array<[number, number]>> }
    | { type: "MultiPolygon"; coordinates: Array<Array<Array<[number, number]>>> }
    | { type: "Point"; coordinates: [number, number] };
  properties: {
    /** For grading products. */
    grade?: DamageGrade;
    /** Affected area (m²) where EMS reports it. */
    areaM2?: number;
    /** Free-form EMS notation. */
    notation?: string;
    [k: string]: unknown;
  };
}

/** A raster output (classified extent / before-after GeoTIFF). */
export interface RasterOutput {
  activationCode: string;
  aoiId: string;
  productId: string;
  type: EmsProductType;
  hazard: EmsHazardType;
  /** What the raster encodes. */
  band: "flood_extent" | "burn_scar" | "damage_class" | "rgb" | "change";
  bbox: BBox;
  resolutionM: number;
  /** S3 key / URL of the GeoTIFF. */
  url: string;
  releasedAt: string;
}

/** Everything published for one activation (AOIs + vector + raster). */
export interface ActivationOutputs {
  activationCode: string;
  aois: ActivationAOI[];
  vectors: VectorOutput[];
  rasters: RasterOutput[];
}

// ── Display labels (en/uk) ──────────────────────────────────────────────────────

export const HAZARD_LABELS: Record<EmsHazardType, I18nText> = {
  flood: { en: "Flood", uk: "Повінь" },
  fire: { en: "Wildfire", uk: "Лісова пожежа" },
  earthquake: { en: "Earthquake", uk: "Землетрус" },
  storm: { en: "Storm", uk: "Шторм" },
  landslide: { en: "Landslide", uk: "Зсув" },
  volcanic: { en: "Volcanic activity", uk: "Вулканічна активність" },
  industrial: { en: "Industrial accident", uk: "Промислова аварія" },
  conflict: { en: "Conflict / war damage", uk: "Воєнні руйнування" },
  other: { en: "Other hazard", uk: "Інша загроза" },
};

export const PRODUCT_TYPE_LABELS: Record<EmsProductType, I18nText> = {
  reference: { en: "Reference map", uk: "Довідкова карта" },
  first_estimate: { en: "First estimate", uk: "Перша оцінка" },
  delineation: { en: "Delineation (affected extent)", uk: "Делінеація (зона ураження)" },
  grading: { en: "Damage grading", uk: "Оцінка руйнувань" },
  monitoring: { en: "Monitoring", uk: "Моніторинг" },
};

export const DAMAGE_GRADE_LABELS: Record<DamageGrade, I18nText> = {
  destroyed: { en: "Destroyed", uk: "Знищено" },
  damaged: { en: "Damaged", uk: "Пошкоджено" },
  possibly_damaged: { en: "Possibly damaged", uk: "Ймовірно пошкоджено" },
  negligible: { en: "Negligible / no damage", uk: "Незначні / без пошкоджень" },
  not_applicable: { en: "Not applicable", uk: "Не застосовно" },
};
