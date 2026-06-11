/**
 * Faceted-search guardrails — don't index every combination (TODO #9).
 *
 * Faceted templates (companies × industry × city, threats × country,
 * topics × country/year, …) explode combinatorially. Indexing every combo is
 * the canonical programmatic-spam footprint. Policy:
 *  - Maintain an ALLOW-LIST of facet *shapes* that are indexable (i.e. which
 *    facet dimensions may be combined, and how many at once).
 *  - A combo is indexable only if its filled dimensions match an allowed shape
 *    AND each value is on that dimension's own allow-list (when constrained).
 *  - Everything else → noindex,follow (canonical still points at a base facet).
 *
 * Pure, no network. The value allow-lists are seeded small and conservative;
 * an audit/curation step (see `audit.ts`) widens them as combos prove they earn
 * traffic.
 */

/** A facet combination: dimension → selected value (slug). */
export type FacetCombo = Record<string, string>;

/**
 * An allowed facet shape. `dimensions` is the exact set of facet keys that may
 * be present together. If `values` is given for a dimension, only those values
 * are indexable for that dimension.
 */
export type FacetShape = {
  /** Stable id for reporting. */
  id: string;
  /** Exactly these dimensions must be present (no more, no fewer). */
  dimensions: string[];
  /** Optional per-dimension value allow-list. Omit → any value allowed. */
  values?: Record<string, readonly string[]>;
};

/**
 * Indexable facet shapes. Single-dimension facets are broadly allowed; two-way
 * combos are gated to curated high-value pairings; three+ way combos are never
 * indexable by default.
 */
export const INDEXABLE_FACET_SHAPES: FacetShape[] = [
  { id: "industry", dimensions: ["industry"] },
  { id: "city", dimensions: ["city"] },
  { id: "country", dimensions: ["country"] },
  { id: "year", dimensions: ["year"] },
  // Curated two-way combos that map to real landing templates in url-builder
  // (e.g. urls.industryCity, urls.topicCountry, urls.threatCountry).
  { id: "industry+city", dimensions: ["industry", "city"] },
  { id: "topic+country", dimensions: ["topic", "country"] },
  { id: "threat+country", dimensions: ["threat", "country"] },
  { id: "topic+year", dimensions: ["topic", "year"] },
];

function filledDimensions(combo: FacetCombo): string[] {
  return Object.keys(combo)
    .filter((k) => {
      const v = combo[k];
      return typeof v === "string" && v.trim().length > 0;
    })
    .sort();
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = [...b].sort();
  return [...a].sort().every((x, i) => x === sb[i]);
}

export type FacetIndexResult = {
  indexable: boolean;
  /** Matched shape id, or null when none. */
  shapeId: string | null;
  reason: string;
};

/**
 * Decide whether a faceted combo may be indexed.
 */
export function evaluateFacetCombo(
  combo: FacetCombo,
  shapes: FacetShape[] = INDEXABLE_FACET_SHAPES,
): FacetIndexResult {
  const dims = filledDimensions(combo);

  if (dims.length === 0) {
    return { indexable: true, shapeId: "base", reason: "no facets (base listing)" };
  }
  if (dims.length > 2) {
    return {
      indexable: false,
      shapeId: null,
      reason: `${dims.length}-way combo exceeds 2-way indexable limit`,
    };
  }

  for (const shape of shapes) {
    if (!sameSet(dims, shape.dimensions)) continue;
    // Dimension set matches — now check value allow-lists where present.
    if (shape.values) {
      for (const dim of shape.dimensions) {
        const allowed = shape.values[dim];
        if (allowed && !allowed.includes(combo[dim])) {
          return {
            indexable: false,
            shapeId: shape.id,
            reason: `value "${combo[dim]}" not on allow-list for "${dim}"`,
          };
        }
      }
    }
    return { indexable: true, shapeId: shape.id, reason: `matches shape ${shape.id}` };
  }

  return {
    indexable: false,
    shapeId: null,
    reason: `facet shape [${dims.join("+")}] not on allow-list`,
  };
}

/** Boolean shorthand. */
export function isIndexableFacet(combo: FacetCombo): boolean {
  return evaluateFacetCombo(combo).indexable;
}
