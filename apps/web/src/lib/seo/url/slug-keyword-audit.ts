/**
 * Primary-keyword-in-slug audit per page-template.
 *
 * For each programmatic template we define the primary keyword(s) that SHOULD
 * appear in the slug (the strongest on-page SEO signal). This module checks a
 * batch of generated slugs against that expectation and reports coverage.
 *
 * See TODO/seo/TODO_url_seo.md. Pure + testable. A real run would feed it the
 * slugs emitted by `@aegis/url-builder` for live entities.
 */

/** A template and the keyword tokens we expect inside its entity slugs. */
export interface TemplateKeywordRule {
  /** Template id, e.g. "topic", "threat", "tool". */
  template: string;
  /**
   * Tokens (kebab fragments) expected in the slug. `mode: "all"` requires every
   * token; `"any"` requires at least one. Tokens are matched case-insensitively
   * against the hyphen-split slug.
   */
  keywords: string[];
  mode?: "all" | "any";
}

export interface SlugSample {
  template: string;
  slug: string;
}

export interface KeywordAuditResult {
  template: string;
  slug: string;
  ok: boolean;
  missing: string[];
}

export interface KeywordAuditSummary {
  results: KeywordAuditResult[];
  /** Per-template coverage ratio 0..1. */
  coverageByTemplate: Record<string, number>;
  ok: boolean;
}

function tokensOf(slug: string): Set<string> {
  return new Set(slug.toLowerCase().split("-").filter(Boolean));
}

export function auditSlugKeyword(sample: SlugSample, rule: TemplateKeywordRule): KeywordAuditResult {
  const tokens = tokensOf(sample.slug);
  const mode = rule.mode ?? "all";
  const present = rule.keywords.filter((k) => tokens.has(k.toLowerCase()));
  const missing = rule.keywords.filter((k) => !tokens.has(k.toLowerCase()));
  const ok = mode === "any" ? present.length > 0 : missing.length === 0;
  return { template: sample.template, slug: sample.slug, ok, missing: ok ? [] : missing };
}

/**
 * Audit a batch of slugs against per-template keyword rules. Slugs whose
 * template has no rule are skipped (not penalized).
 */
export function auditSlugKeywords(
  samples: SlugSample[],
  rules: TemplateKeywordRule[],
): KeywordAuditSummary {
  const ruleByTemplate = new Map(rules.map((r) => [r.template, r]));
  const results: KeywordAuditResult[] = [];
  const tally = new Map<string, { ok: number; total: number }>();

  for (const s of samples) {
    const rule = ruleByTemplate.get(s.template);
    if (!rule) continue;
    const res = auditSlugKeyword(s, rule);
    results.push(res);
    const t = tally.get(s.template) ?? { ok: 0, total: 0 };
    t.total++;
    if (res.ok) t.ok++;
    tally.set(s.template, t);
  }

  const coverageByTemplate: Record<string, number> = {};
  for (const [tpl, { ok, total }] of tally) {
    coverageByTemplate[tpl] = total === 0 ? 1 : ok / total;
  }

  return { results, coverageByTemplate, ok: results.every((r) => r.ok) };
}
