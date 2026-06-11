/**
 * Per-domain CSS extraction rules for the Aegis Lens crawler.
 *
 * Rules define how to pull structured fields out of raw HTML for known
 * domains. The fallback path uses generic article/news selectors.
 */

// ── Types ─────────────────────────────────────────────────────────────────

/** A single CSS selector mapped to a named output field. */
export interface CssSelector {
  field:
    | "title"
    | "body"
    | "author"
    | "publishedAt"
    | "summary"
    | "url"
    | "imageUrl";
  /** CSS selector string. */
  selector: string;
  /**
   * If set, extract `element.getAttribute(attribute)` instead of
   * `element.textContent`. E.g. `"href"` for links, `"src"` for images.
   */
  attribute?: string;
  /** If true, extraction fails the job when this field is missing. */
  required: boolean;
}

/** Full extraction rule for a domain. */
export interface ExtractionRule {
  domain: string;
  selectors: CssSelector[];
  /** Tried in order if the primary selectors return empty. */
  fallbackSelectors?: CssSelector[];
  /** Optional post-processing transform applied to raw extracted strings. */
  postProcess?: (raw: string) => string;
}

// ── Shared helpers ────────────────────────────────────────────────────────

/** Strip excess whitespace and normalise unicode spaces. */
function trimWhitespace(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

// ── Rule definitions ──────────────────────────────────────────────────────

export const EXTRACTION_RULES: ExtractionRule[] = [
  // ── Generic news / article fallback ──────────────────────────────────
  {
    domain: "_default",
    selectors: [
      { field: "title",       selector: "h1",                    required: true  },
      { field: "body",        selector: "article p",             required: false },
      { field: "author",      selector: '[rel="author"]',        required: false },
      { field: "publishedAt", selector: "time[datetime]",        attribute: "datetime", required: false },
      { field: "summary",     selector: 'meta[name="description"]', attribute: "content", required: false },
      { field: "imageUrl",    selector: 'meta[property="og:image"]', attribute: "content", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Ukrainian Pravda ──────────────────────────────────────────────────
  {
    domain: "pravda.com.ua",
    selectors: [
      { field: "title",       selector: "h1.post_title",            required: true  },
      { field: "body",        selector: ".post_text p",             required: true  },
      { field: "author",      selector: ".post_author",             required: false },
      { field: "publishedAt", selector: "time.post_time[datetime]", attribute: "datetime", required: false },
      { field: "summary",     selector: 'meta[name="description"]', attribute: "content", required: false },
      { field: "imageUrl",    selector: ".post_photo img",          attribute: "src",     required: false },
    ],
    fallbackSelectors: [
      { field: "body", selector: "article p", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Ukrinform ─────────────────────────────────────────────────────────
  {
    domain: "ukrinform.ua",
    selectors: [
      { field: "title",       selector: "h1.newsHeading",            required: true  },
      { field: "body",        selector: ".newsText p",               required: true  },
      { field: "publishedAt", selector: "time.newsDate[datetime]",   attribute: "datetime", required: false },
      { field: "author",      selector: ".newsAuthor",               required: false },
      { field: "imageUrl",    selector: ".newsImage img",            attribute: "src", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Suspilne Media ────────────────────────────────────────────────────
  {
    domain: "suspilne.media",
    selectors: [
      { field: "title",       selector: "h1.article__title",            required: true  },
      { field: "body",        selector: ".article__content p",          required: true  },
      { field: "publishedAt", selector: "time.article__date[datetime]", attribute: "datetime", required: false },
      { field: "author",      selector: ".article__author",             required: false },
      { field: "imageUrl",    selector: ".article__image img",          attribute: "src", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Wikipedia (any language subdomain) ───────────────────────────────
  {
    domain: "wikipedia.org",
    selectors: [
      { field: "title",    selector: "#firstHeading",      required: true  },
      { field: "body",     selector: "#mw-content-text p", required: true  },
      { field: "summary",  selector: "#mw-content-text > .mw-parser-output > p:first-of-type", required: false },
      { field: "imageUrl", selector: ".infobox img",       attribute: "src", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Ukrainian government (.gov.ua) ────────────────────────────────────
  {
    domain: "gov.ua",
    selectors: [
      { field: "title",       selector: "h1.entry-title, h1.page-title, h1", required: true  },
      { field: "body",        selector: ".content p, .entry-content p",       required: false },
      { field: "publishedAt", selector: 'time[datetime], meta[property="article:published_time"]', attribute: "datetime", required: false },
    ],
    postProcess: trimWhitespace,
  },

  // ── Oryx (equipment loss tracking) ───────────────────────────────────
  {
    domain: "oryx.com",
    selectors: [
      { field: "title",       selector: "h1.post-title, h1",    required: true  },
      { field: "body",        selector: ".post-body p",          required: true  },
      { field: "publishedAt", selector: ".date-header span",     required: false },
      { field: "imageUrl",    selector: ".post-body img",        attribute: "src", required: false },
    ],
    postProcess: trimWhitespace,
  },
];

// ── Match helper ──────────────────────────────────────────────────────────

/**
 * Find the best-matching ExtractionRule for a domain.
 *
 * Matching order:
 *   1. Exact domain match
 *   2. Suffix match (e.g. "gov.ua" matches "www.president.gov.ua")
 *   3. Returns null — caller should fall back to the "_default" rule
 *      or handle the missing rule explicitly.
 *
 * Note: the "_default" rule is intentionally excluded from suffix matching
 * so callers can decide whether to use it.
 */
export function matchExtractionRule(domain: string): ExtractionRule | null {
  const rules = EXTRACTION_RULES.filter((r) => r.domain !== "_default");

  // 1. Exact match
  const exact = rules.find((r) => r.domain === domain);
  if (exact) return exact;

  // 2. Suffix match — longest suffix wins
  const suffixMatches = rules.filter(
    (r) => domain.endsWith(`.${r.domain}`) || domain === r.domain,
  );
  if (suffixMatches.length === 0) return null;

  return suffixMatches.reduce((best, current) =>
    current.domain.length >= best.domain.length ? current : best,
  );
}
