/**
 * Source record types for the Institute for the Study of War (ISW) integration.
 *
 * ISW publishes two primary products that this integration ingests:
 *   1. The daily "Russia Offensive Campaign Assessment" (ROCA) — long-form
 *      analytical text, released ~once per day, syndicated via the ISW blog and RSS.
 *   2. The ISW / Critical Threats Project interactive "Control of Terrain" map —
 *      a set of polygons describing assessed control (occupied / claimed / contested).
 *
 * ISW content is © Institute for the Study of War and AEI's Critical Threats Project.
 * See COMPLIANCE.md for the republication / fair-use boundaries that gate this code.
 *
 * EN is canonical. UK summaries are AI-translated and carry a `translationReview`
 * flag (native-review debt — see COMPLIANCE.md §i18n).
 */

/** ISO 3166-2:UA region code (oblast) — matches the rest of the platform. */
export type OblastCode = string;

/**
 * Assessed control state for a piece of terrain.
 * Mirrors ISW's map legend terminology.
 */
export type ControlState =
  | "ua_controlled"        // Ukrainian-controlled territory
  | "ru_occupied"          // Russian-occupied territory
  | "ru_claimed"           // Claimed by Russia / reported but ISW has NOT assessed
  | "ru_advance"           // Assessed Russian advance (newly taken since last map)
  | "contested"            // Contested / "grey zone"
  | "ua_counteroffensive"; // Assessed Ukrainian counter-offensive gains

/** GeoJSON-style polygon ring: array of [lon, lat] coordinate pairs. */
export type PolygonRing = Array<[number, number]>;

/** A control-of-terrain polygon as ingested from the ISW interactive map. */
export interface ControlPolygon {
  /** Stable id derived from ISW feature id + assessment date. */
  polygonId: string;
  /** ISW's own feature identifier, if present in the source. */
  sourceFeatureId?: string;
  controlState: ControlState;
  /** Outer ring + optional holes (GeoJSON winding). */
  rings: PolygonRing[];
  /** Oblast(s) this polygon intersects (best-effort, may be empty). */
  oblastCodes: OblastCode[];
  /** ISO-8601 date (YYYY-MM-DD) of the ISW assessment this polygon belongs to. */
  assessmentDate: string;
  /** Approximate area in km^2 (best-effort planar estimate). */
  areaKm2?: number;
  /** Free-form label from the source (e.g. settlement name near the change). */
  label?: { en?: string; uk?: string };
}

/** A single daily ISW Control-of-Terrain map snapshot. */
export interface ControlMapSnapshot {
  /** ISO-8601 date (YYYY-MM-DD). */
  assessmentDate: string;
  polygons: ControlPolygon[];
  /** Where the polygons were sourced from. */
  sourceUrl: string;
  /** When this snapshot was fetched/ingested. */
  fetchedAt: string;
  /** True if this snapshot is the bundled demo fixture, not a live fetch. */
  isDemo: boolean;
}

/**
 * One ISW Russia Offensive Campaign Assessment (the daily blog post / RSS item).
 */
export interface IswAssessment {
  /** Stable id, e.g. `isw-roca-2026-06-05`. */
  assessmentId: string;
  /** ISO-8601 date (YYYY-MM-DD) the assessment covers. */
  assessmentDate: string;
  /** Title as published (EN canonical). */
  title: { en: string; uk?: string };
  /** Canonical URL of the ISW blog post / RSS item. */
  url: string;
  /** Publication timestamp (ISO-8601), from the RSS pubDate. */
  publishedAt: string;
  /**
   * The full assessment body text (EN). For licensing reasons the product
   * surfaces only short attributed snippets — see COMPLIANCE.md.
   */
  bodyText: string;
  /** ISW's own "Key Takeaways" bullet list, if parsed. */
  keyTakeaways: string[];
  /** Author / byline string as published. */
  byline?: string;
  /** True if produced from the bundled demo fixture, not a live fetch. */
  isDemo: boolean;
}

/** Raw RSS item shape (subset of RSS 2.0 we rely on). */
export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  guid?: string;
}

/** A short, attribution-safe quotable snippet extracted from an assessment. */
export interface AssessmentSnippet {
  assessmentId: string;
  /** Short excerpt (length-capped per COMPLIANCE.md fair-use rules). */
  text: { en: string; uk?: string };
  /** Whether the uk text still needs native review. */
  translationReview: boolean;
  /** Source attribution string, always rendered with the snippet. */
  attribution: string;
  url: string;
}

/** Per-region "ISW today" widget payload. */
export interface IswRegionSummary {
  oblastCode: OblastCode;
  oblastNameEn: string;
  oblastNameUk: string;
  assessmentDate: string;
  /** Headline takeaway relevant to this region (EN canonical + AI uk). */
  headline: { en: string; uk?: string };
  /** Dominant assessed trend for the region. */
  trend: "ru_advance" | "ua_advance" | "stable" | "contested" | "no_change";
  /** Short attributed snippets that mention this region. */
  snippets: AssessmentSnippet[];
  /** Net assessed control change in km^2 today (positive = Russian gain). */
  netRussianGainKm2: number;
  sourceUrl: string;
  /** UK strings are AI-translated and unreviewed unless this is false. */
  translationReview: boolean;
}
