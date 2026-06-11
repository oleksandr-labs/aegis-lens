/**
 * Internal Link Suggestions — keyword-overlap heuristic that recommends
 * up to LINK_SUGGESTION_MAX internal links for a piece of content.
 *
 * Пропозиції внутрішніх посилань — евристика перетину ключових слів,
 * що рекомендує до LINK_SUGGESTION_MAX внутрішніх посилань для контенту.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Maximum number of internal link suggestions to return per content document.
 *
 * Максимальна кількість пропозицій внутрішніх посилань для документа.
 */
export const LINK_SUGGESTION_MAX = 5;

// ── Stop words ────────────────────────────────────────────────────────────────

/** Common English stop words excluded from keyword extraction. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "this", "that", "these", "those", "it", "its",
  "as", "into", "not", "no", "so", "if", "then", "than", "about",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InternalLinkSuggestion {
  /** Slug of the suggested target document. / Slug цільового документа. */
  slug: string;
  /**
   * Overlap score: number of shared non-stop keywords between source and slug.
   *
   * Оцінка перетину: кількість спільних ключових слів джерела та slug.
   */
  score: number;
  /** Keywords that triggered this suggestion. / Ключові слова, що спричинили пропозицію. */
  matchedKeywords: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract meaningful keywords from a text string (lowercase, no stop words).
 *
 * Видобуває значущі ключові слова з тексту (малі літери, без стоп-слів).
 */
function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

/**
 * Tokenise a slug into keywords (split on - and _).
 *
 * Розбиває slug на ключові слова (розподіл за - і _).
 */
function slugToKeywords(slug: string): Set<string> {
  return new Set(
    slug
      .toLowerCase()
      .split(/[-_/]+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

// ── Suggester ─────────────────────────────────────────────────────────────────

/**
 * Suggest internal links for `content` from the pool of `allSlugs`.
 * Uses keyword-overlap between the content text and each slug.
 * Returns up to LINK_SUGGESTION_MAX results ordered by descending score.
 *
 * Пропонує внутрішні посилання для `content` з пулу `allSlugs`.
 * Використовує перетин ключових слів між текстом контенту та кожним slug.
 * Повертає до LINK_SUGGESTION_MAX результатів за спаданням оцінки.
 */
export function suggestInternalLinks(
  content: string,
  allSlugs: string[],
): InternalLinkSuggestion[] {
  if (!content.trim() || allSlugs.length === 0) return [];

  const contentKeywords = extractKeywords(content);
  if (contentKeywords.size === 0) return [];

  const suggestions: InternalLinkSuggestion[] = [];

  for (const slug of allSlugs) {
    const slugKeywords = slugToKeywords(slug);
    const matched: string[] = [];

    for (const kw of slugKeywords) {
      if (contentKeywords.has(kw)) {
        matched.push(kw);
      }
    }

    if (matched.length > 0) {
      suggestions.push({ slug, score: matched.length, matchedKeywords: matched });
    }
  }

  // Sort descending by score, then alphabetically by slug for stable ordering
  suggestions.sort(
    (a, b) => b.score - a.score || a.slug.localeCompare(b.slug),
  );

  return suggestions.slice(0, LINK_SUGGESTION_MAX);
}
