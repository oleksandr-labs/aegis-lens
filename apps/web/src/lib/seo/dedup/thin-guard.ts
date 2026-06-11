/**
 * Per-page unique-data requirement — "no thin variants".
 *
 * Uniqueness (cosine vs siblings) catches pages that are *worded* like a
 * sibling. This guard catches the orthogonal failure: a page that is
 * structurally valid but has no real substance of its own — too few unique
 * data fields filled, or too little body text. Both are gates a page must pass
 * before it is allowed into the index.
 *
 * Pure, deterministic, unit-testable.
 */

export type TemplateThinRule = {
  /** Minimum number of NON-boilerplate fields that must carry real values. */
  minUniqueFields: number;
  /** Minimum word count of the page's main body text. */
  minWords: number;
};

/**
 * Per-template thin-content rules. Listing/index templates can be leaner; deep
 * editorial templates demand more substance.
 */
export const TEMPLATE_THIN_RULES: Record<string, TemplateThinRule> = {
  region: { minUniqueFields: 4, minWords: 120 },
  country: { minUniqueFields: 4, minWords: 120 },
  entity: { minUniqueFields: 5, minWords: 150 },
  topic: { minUniqueFields: 3, minWords: 180 },
  threat: { minUniqueFields: 4, minWords: 150 },
  tool: { minUniqueFields: 5, minWords: 120 },
  company: { minUniqueFields: 5, minWords: 100 },
  industry: { minUniqueFields: 3, minWords: 120 },
  "use-case": { minUniqueFields: 3, minWords: 150 },
  glossary: { minUniqueFields: 2, minWords: 80 },
  guide: { minUniqueFields: 2, minWords: 300 },
  compare: { minUniqueFields: 4, minWords: 120 },
  tag: { minUniqueFields: 2, minWords: 60 },
  sanctions: { minUniqueFields: 5, minWords: 100 },
  generic: { minUniqueFields: 2, minWords: 80 },
};

export const DEFAULT_THIN_RULE: TemplateThinRule = {
  minUniqueFields: 3,
  minWords: 100,
};

export function thinRuleFor(template: string): TemplateThinRule {
  return TEMPLATE_THIN_RULES[template] ?? DEFAULT_THIN_RULE;
}

export type PageContent = {
  template: string;
  /**
   * Page-specific data fields. Only entries with a meaningful value count
   * toward `minUniqueFields`; empty strings, null/undefined, empty arrays, and
   * pure-boilerplate placeholders do not.
   */
  fields: Record<string, unknown>;
  /** The page's main body text (used for the word-count floor). */
  body: string;
};

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/u).filter(Boolean).length;
}

/** A field "counts" only if it carries a non-empty, non-trivial value. */
function isMeaningful(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(isMeaningful);
  if (typeof value === "object") return Object.values(value).some(isMeaningful);
  return false;
}

export function countUniqueFields(fields: Record<string, unknown>): number {
  return Object.values(fields).filter(isMeaningful).length;
}

export type ThinResult = {
  ok: boolean;
  uniqueFields: number;
  words: number;
  rule: TemplateThinRule;
  /** Why it failed, for audit reporting. Empty when ok. */
  reasons: string[];
};

/**
 * Evaluate a page against its template's thin-content rule.
 * A page is "thin" (ok=false) if it lacks unique fields OR body words.
 */
export function evaluateThinContent(page: PageContent): ThinResult {
  const rule = thinRuleFor(page.template);
  const uniqueFields = countUniqueFields(page.fields);
  const words = countWords(page.body);
  const reasons: string[] = [];

  if (uniqueFields < rule.minUniqueFields) {
    reasons.push(
      `only ${uniqueFields}/${rule.minUniqueFields} required unique fields`,
    );
  }
  if (words < rule.minWords) {
    reasons.push(`only ${words}/${rule.minWords} required body words`);
  }

  return {
    ok: reasons.length === 0,
    uniqueFields,
    words,
    rule,
    reasons,
  };
}

/** Boolean shorthand: is this page too thin to index? */
export function isThin(page: PageContent): boolean {
  return !evaluateThinContent(page).ok;
}
