import { slugify } from "./index";

/**
 * Phase 1 stop-word filter for slug generation.
 *
 * Words in this set are removed from slugs before normalization to keep
 * URLs short and keyword-rich (≤ 75 char target).
 *
 * EN + UK stop-words included; extend as needed per language sprint.
 */
export const STOP_WORDS = new Set([
  // English articles / prepositions / conjunctions
  "a", "an", "the",
  "and", "or", "but", "nor", "so", "yet",
  "at", "by", "for", "from", "in", "into", "of", "on", "onto",
  "out", "over", "to", "up", "with",
  // Common English filler
  "about", "after", "as", "be", "been", "being",
  "between", "during", "how", "if", "its", "near",
  "than", "that", "their", "them", "there", "these",
  "this", "those", "through", "under", "until", "via",
  "was", "were", "what", "when", "where", "which", "while",
  "who", "whose", "will", "within", "without",
  // Ukrainian articles / prepositions / conjunctions
  "та", "і", "й", "або", "але", "чи", "а",
  "від", "до", "з", "із", "зі", "за", "на", "над",
  "під", "про", "при", "по", "між", "для", "без",
  "у", "в", "через", "перед", "після", "під",
  // Ukrainian filler
  "бути", "є", "цей", "ця", "це", "той", "та", "те",
  "який", "яка", "яке", "де", "коли", "що", "як",
]);

/**
 * Remove stop-words from a raw name/title before slugification.
 * Splits on whitespace, filters, then rejoins.
 *
 * @example
 *   removeStopWords("The Art of War")   // "Art War"
 *   removeStopWords("Атака на Grid")    // "Атака Grid"
 */
export function removeStopWords(slug: string): string {
  return slug
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.has(word.toLowerCase()))
    .join(" ");
}

// ---------- Per-entity slug builders ----------
// Each builder: normalize name → remove stop-words → slugify → prepend prefix.

/**
 * Slug for a threat entity.
 * @example threatSlug("Shahed Strikes") → "/threats/shahed-strikes"
 */
export function threatSlug(name: string): string {
  return `/threats/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for a trend entity. Year is intentionally excluded from the slug;
 * use canonical URL params or archive routes for year-specific views.
 * @example trendSlug("Grid Attacks 2024") → "/trends/grid-attacks-2024"
 */
export function trendSlug(name: string): string {
  return `/trends/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for a military unit (public OOB data only).
 * @example unitSlug("36th Marine Brigade") → "/units/36th-marine-brigade"
 */
export function unitSlug(name: string): string {
  return `/units/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for a person page. Restricted to public figures / named experts.
 * Private individuals MUST NOT be published — enforce access-control upstream.
 * @example personSlug("Mykhailo Zabrodskyi") → "/experts/mykhailo-zabrodskyi"
 */
export function personSlug(name: string): string {
  return `/experts/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for a service listing page.
 * @example serviceSlug("Threat Intelligence API") → "/services/threat-intelligence-api"
 */
export function serviceSlug(name: string): string {
  return `/services/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for a guide page.
 * @example guideSlug("Getting Started with OSINT") → "/guides/getting-started-osint"
 */
export function guideSlug(name: string): string {
  return `/guides/${slugify(removeStopWords(name))}`;
}

/**
 * Slug for an investigation page.
 * @example investigationSlug("Wagner Group Financing") → "/investigations/wagner-group-financing"
 */
export function investigationSlug(name: string): string {
  return `/investigations/${slugify(removeStopWords(name))}`;
}

/**
 * Append a numeric collision suffix to a base slug.
 * Uses `-2`, `-3`, etc. — never a random hash — so URLs remain deterministic
 * and human-readable.
 *
 * @param base  already-slugified base (e.g. "kharkiv-oblast")
 * @param index 1-based counter; index=1 returns base unchanged, index=2 → "-2", etc.
 *
 * @example
 *   collisionSlug("kharkiv-oblast", 1)  // "kharkiv-oblast"
 *   collisionSlug("kharkiv-oblast", 2)  // "kharkiv-oblast-2"
 *   collisionSlug("kharkiv-oblast", 3)  // "kharkiv-oblast-3"
 */
export function collisionSlug(base: string, index: number): string {
  if (index <= 1) return base;
  return `${base}-${index}`;
}
