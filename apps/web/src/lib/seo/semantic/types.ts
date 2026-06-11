/**
 * Semantic SEO & Knowledge Graph types — Aegis Lens.
 *
 * Typed vocabulary for entity mentions, sameAs links, page-level semantic
 * schemas, and inline entity schemas used throughout the SEO pipeline.
 */

/**
 * Schema.org @type values supported by Aegis Lens pages.
 * Extend as new templates are introduced.
 */
export type SchemaEntityType =
  | "Place"
  | "Organization"
  | "Person"
  | "Product"
  | "Event"
  | "GeoShape"
  | "FAQPage"
  | "HowTo"
  | "Article";

/** A single sameAs link with provenance metadata. */
export interface SameAsLink {
  /** Absolute URL of the external authoritative resource. */
  url: string;
  /** Which knowledge base this link points to. */
  source: "wikidata" | "wikipedia" | "dbpedia" | "geonames";
}

/**
 * A named entity mentioned in page content, with enough metadata to
 * produce an inline schema.org snippet and populate `mentions` / `about`.
 */
export interface EntityMention {
  /** Stable internal identifier (slug or UUID). */
  entityId: string;
  /** Schema.org type for this entity. */
  entityType: SchemaEntityType;
  /** The surface form of the mention as it appears in text. */
  text: string;
  /** Character offset of the first character in the source text. */
  position: number;
  /** External authoritative URIs for `sameAs`. */
  sameAs: SameAsLink[];
}

/**
 * Semantic annotation for a single page:
 * - `about`    — the primary topic entities
 * - `mentions` — secondary / referenced entities
 * - `speakable` — CSS selectors for speakable schema
 * - `faqItems` — FAQ pairs rendered as FAQPage JSON-LD
 */
export interface SemanticPageSchema {
  about?: EntityMention[];
  mentions: EntityMention[];
  speakable?: string[];
  faqItems?: { question: string; answer: string }[];
}

/**
 * Inline schema.org entity block suitable for embedding in a @graph or
 * as a standalone JSON-LD script tag.
 */
export interface InlineEntitySchema {
  "@type": SchemaEntityType;
  name: string;
  sameAs?: string[];
  description?: {
    en: string;
    uk?: string;
  };
}
