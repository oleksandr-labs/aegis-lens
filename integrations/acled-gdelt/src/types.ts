/**
 * Source record types for the academic event-dataset cluster:
 *   - ACLED  (Armed Conflict Location & Event Data)
 *   - GDELT  (Global Database of Events, Language, and Tone — BigQuery)
 *   - UCDP   (Uppsala Conflict Data Program)
 *
 * These are *raw* shapes as published by each provider (subset of fields we use).
 * `adapter.ts` (and the per-dataset adapters) normalise them to the canonical
 * Aegis Event v1 in `@ua-map/event-schema`.
 *
 * NOTE on licensing: republication of raw ACLED rows is restricted (see
 * COMPLIANCE.md). Raw records are kept ingest-only; only derived/aggregated
 * trend metrics + properly-attributed citations are exposed publicly.
 */

// ── Shared ──────────────────────────────────────────────────────────────────

/** Which academic dataset a record / metric originates from. */
export type DatasetId = "acled" | "gdelt" | "ucdp";

/** Licensing tier required to use a dataset for a given purpose. */
export type LicenseTier =
  | "open"            // free + republishable with attribution (e.g. UCDP, GDELT)
  | "attribution"     // free but attribution mandatory, derived-only republish
  | "academic"        // free for registered academic / non-commercial use
  | "commercial";     // paid licence required for commercial republication

/** Localized text (en + uk), matching the canonical schema's LocalizedText. */
export interface L10nText {
  en: string;
  uk: string;
}

/**
 * Canonical Aegis Event v1 `EventClass`, mirrored locally.
 *
 * The canonical definition lives in `@aegis/event-schema` (`packages/event-schema/src/v1.ts`).
 * This workspace has no path aliases / cross-package type resolution wired for the
 * integration packages (see how `integrations/missiles` mirrors the schema rather
 * than importing it), so we re-declare the union here to keep the package
 * self-contained and compile-safe. It MUST stay in sync with the canonical union.
 */
export type EventClass =
  | "drone"
  | "missile"
  | "airstrike"
  | "artillery"
  | "ground_combat"
  | "explosion"
  | "fire"
  | "infrastructure_damage"
  | "power_outage"
  | "comms_outage"
  | "humanitarian"
  | "displacement"
  | "protest"
  | "cyberattack"
  | "chemical"
  | "radiation"
  | "other";

// ── ACLED ───────────────────────────────────────────────────────────────────

/**
 * Raw ACLED event row (subset). Mirrors the ACLED API / bulk-export columns.
 * Docs: https://acleddata.com/resources/general-guides/
 */
export interface AcledRawEvent {
  event_id_cnty: string;     // e.g. "UKR12345"
  event_date: string;        // "YYYY-MM-DD"
  year: number;
  /** High-level category, e.g. "Battles", "Explosions/Remote violence". */
  event_type: string;
  /** Finer category, e.g. "Shelling/artillery/missile attack". */
  sub_event_type: string;
  actor1: string;
  actor2?: string;
  /** ACLED disorder grouping, e.g. "Political violence". */
  disorder_type?: string;
  country: string;
  iso3?: string;             // ISO 3166-1 alpha-3, e.g. "UKR"
  admin1?: string;           // region / oblast name
  location?: string;
  latitude: number;
  longitude: number;
  /** Geographic precision 1 (exact) – 3 (province-level). */
  geo_precision?: 1 | 2 | 3;
  fatalities: number;
  notes?: string;
  source?: string;           // reporting source string
  source_scale?: string;
  timestamp?: number;        // unix seconds of last DB update
}

// ── GDELT ───────────────────────────────────────────────────────────────────

/**
 * Raw GDELT 2.0 Events row (subset of the 61-column schema as exposed by the
 * BigQuery public dataset `gdelt-bq.gdeltv2.events`).
 * Docs: https://www.gdeltproject.org/data.html#documentation
 */
export interface GdeltRawEvent {
  GLOBALEVENTID: number;
  /** SQLDATE — event date as integer YYYYMMDD. */
  SQLDATE: number;
  Actor1Code?: string;       // CAMEO actor code
  Actor1Name?: string;
  Actor1CountryCode?: string;
  Actor2Code?: string;
  Actor2Name?: string;
  Actor2CountryCode?: string;
  /** CAMEO event code, e.g. "190" (use conventional military force). */
  EventCode: string;
  /** Root CAMEO code (first 2 digits), e.g. "19". */
  EventRootCode?: string;
  /** QuadClass 1–4: VerbalCoop, MaterialCoop, VerbalConflict, MaterialConflict. */
  QuadClass: 1 | 2 | 3 | 4;
  /** Goldstein scale −10..+10 (conflict ↔ cooperation). */
  GoldsteinScale?: number;
  NumMentions?: number;
  NumSources?: number;
  NumArticles?: number;
  /** Average article tone −100..+100. */
  AvgTone?: number;
  ActionGeo_CountryCode?: string;   // FIPS country code
  ActionGeo_FullName?: string;
  ActionGeo_Lat?: number;
  ActionGeo_Long?: number;
  /** Source document URL or mention. */
  SOURCEURL?: string;
  /** DATEADDED — ingest timestamp YYYYMMDDHHMMSS. */
  DATEADDED?: number;
}

// ── UCDP ────────────────────────────────────────────────────────────────────

/**
 * Raw UCDP GED (Georeferenced Event Dataset) row (subset).
 * Docs: https://ucdp.uu.se/downloads/  (GED Codebook)
 */
export interface UcdpRawEvent {
  id: number;
  /** UCDP conflict (dyad) id. */
  conflict_new_id?: number;
  /** "state-based" | "non-state" | "one-sided". */
  type_of_violence: 1 | 2 | 3;
  side_a: string;
  side_b: string;
  /** ISO date of event start, "YYYY-MM-DD". */
  date_start: string;
  date_end?: string;
  year: number;
  country: string;
  country_id?: number;
  region?: string;
  adm_1?: string;
  latitude: number;
  longitude: number;
  /** Spatial precision 1 (exact) – 7 (country). */
  where_prec?: number;
  /** Best estimate of deaths. */
  best: number;
  low?: number;
  high?: number;
  deaths_civilians?: number;
  source_article?: string;
}

// ── Normalised intermediate (pre-canonical) ─────────────────────────────────

/**
 * A dataset-agnostic intermediate the per-dataset adapters produce before the
 * shared `toCanonicalEvent` step maps it into Aegis Event v1. Keeping this thin
 * layer lets trend/aggregation code work uniformly across all three sources.
 */
export interface NormalisedDatasetEvent {
  dataset: DatasetId;
  /** Stable id namespaced by dataset, e.g. "acled:UKR12345". */
  sourceEventId: string;
  occurredAt: string;        // ISO-8601 UTC
  country: string;           // ISO 3166-1 alpha-2
  regionName?: string;
  lat?: number;
  lon?: number;
  uncertaintyM?: number;
  /** Canonical Aegis EventClass we mapped this record to. */
  eventClass: EventClass;
  subclass?: string;
  fatalities?: number;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;        // 0–1
  titleEn: string;
  titleUk: string;
  summaryEn?: string;
  actors?: string[];
  sourceUrl?: string;
  rawPayload: AcledRawEvent | GdeltRawEvent | UcdpRawEvent;
}

// ── Trend / aggregation outputs ──────────────────────────────────────────────

/** A single time-bucketed metric point for trend pages. */
export interface TrendPoint {
  /** Bucket key — "YYYY", "YYYY-MM" or "YYYY-Www" depending on granularity. */
  period: string;
  events: number;
  fatalities: number;
  /** Mean GDELT tone, if the series is tone-bearing (else undefined). */
  avgTone?: number;
}

export type TrendGranularity = "year" | "month" | "week";

export interface TrendSeries {
  dataset: DatasetId;
  country: string;
  granularity: TrendGranularity;
  points: TrendPoint[];
  /** Inclusive ISO date range covered. */
  from: string;
  to: string;
}
