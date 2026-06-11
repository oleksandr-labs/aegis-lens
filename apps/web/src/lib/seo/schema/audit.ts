/**
 * Quarterly schema.org audit.
 *
 * TODO_schema_library.md asks for a recurring audit of the structured-data
 * library. This module is the codeable contract for it (per the brief: a typed
 * data model + compute fn + thresholds, not a UI):
 *
 *   1. enumerate every page TEMPLATE we ship and the `@type`s it is expected to
 *      emit (the master list in TODO_schema_library.md);
 *   2. for each expected `@type`, list its required props (from
 *      {@link required-props}) → a reviewable checklist;
 *   3. given a *sample* JSON-LD document per template (produced by the
 *      generators, captured in CI or a fixture), validate it and roll the
 *      results up into an audit report with a pass/fail + freshness verdict.
 *
 * Pure + no network. Where a real, live "validate against Google Rich Results
 * API" step would plug in, see {@link AuditInput.fetchedDoc} — the audit accepts
 * a pre-fetched document so the fetching (network) stays out of this module.
 */

import {
  type SchemaType,
  REQUIRED_PROPS,
  RECOMMENDED_PROPS,
  validateDocument,
  type NodeValidationResult,
} from "./required-props";

/** A page template and the schema.org types it is expected to emit. */
export interface TemplateSchemaSpec {
  /** Stable template id (route family), e.g. "events/[id]". */
  template: string;
  /** Human label for reports. */
  label: string;
  /** Types this template MUST emit. */
  expects: SchemaType[];
}

/**
 * The enumerated template → expected-types map. Derived from
 * TODO_schema_library.md's master list and the routes that emit JSON-LD today.
 * Extend when a new template ships (the audit will then demand its types).
 */
export const TEMPLATE_SCHEMA_SPECS: TemplateSchemaSpec[] = [
  { template: "*", label: "Site-wide (root layout)", expects: ["Organization", "WebSite"] },
  { template: "events/[id]", label: "Event detail", expects: ["WebPage", "BreadcrumbList", "Event"] },
  { template: "entities/[slug]", label: "Entity profile", expects: ["WebPage", "BreadcrumbList", "Person"] },
  { template: "blog/[slug]", label: "Blog post", expects: ["Article", "BreadcrumbList"] },
  { template: "news/[...]", label: "News article", expects: ["NewsArticle", "BreadcrumbList"] },
  { template: "guides/[slug]", label: "Guide", expects: ["TechArticle", "BreadcrumbList"] },
  { template: "cookbook/[slug]", label: "How-to / recipe", expects: ["HowTo", "BreadcrumbList"] },
  { template: "faq", label: "FAQ", expects: ["FAQPage"] },
  { template: "glossary/[slug]", label: "Glossary term", expects: ["DefinedTerm", "BreadcrumbList"] },
  { template: "glossary", label: "Glossary set", expects: ["DefinedTermSet"] },
  { template: "academy/[slug]", label: "Course", expects: ["Course", "BreadcrumbList"] },
  { template: "academy/[slug]/[lesson]", label: "Lesson", expects: ["LearningResource", "BreadcrumbList"] },
  { template: "videos/[slug]", label: "Video", expects: ["VideoObject", "BreadcrumbList"] },
  { template: "podcast", label: "Podcast series", expects: ["PodcastSeries"] },
  { template: "podcast/[slug]", label: "Podcast episode", expects: ["PodcastEpisode", "BreadcrumbList"] },
  { template: "datasets/[slug]", label: "Dataset", expects: ["Dataset", "BreadcrumbList"] },
  { template: "equipment/[slug]", label: "Equipment (Product, informational)", expects: ["Product", "BreadcrumbList"] },
  { template: "tools/[slug]", label: "Tool (SoftwareApplication)", expects: ["SoftwareApplication", "BreadcrumbList"] },
  { template: "industries/[slug]", label: "Industry directory", expects: ["CollectionPage", "BreadcrumbList"] },
  { template: "regions/[...]", label: "Region/place", expects: ["Place", "BreadcrumbList"] },
  { template: "compare/tools/[pair]", label: "Tool comparison", expects: ["ItemList", "BreadcrumbList"] },
];

/** A single checklist line: a required prop for an expected type. */
export interface ChecklistItem {
  template: string;
  type: SchemaType;
  requiredProps: string[];
  recommendedProps: string[];
}

/**
 * Build the static required-props checklist across all templates — the thing a
 * human reviews each quarter regardless of any sample documents.
 */
export function buildChecklist(specs: TemplateSchemaSpec[] = TEMPLATE_SCHEMA_SPECS): ChecklistItem[] {
  const out: ChecklistItem[] = [];
  for (const spec of specs) {
    for (const type of spec.expects) {
      out.push({
        template: spec.template,
        type,
        requiredProps: REQUIRED_PROPS[type] ?? [],
        recommendedProps: RECOMMENDED_PROPS[type] ?? [],
      });
    }
  }
  return out;
}

/** Audit thresholds — when does the quarter's audit FAIL vs WARN. */
export const AUDIT_THRESHOLDS = {
  /** Any required-prop miss fails the audit. */
  maxRequiredMisses: 0,
  /** Tolerated recommended-prop misses before a WARN escalates. */
  maxRecommendedMisses: 5,
  /** Days since last audit before it is considered overdue (quarterly). */
  staleAfterDays: 92,
} as const;

/** What the auditor receives per template: its spec + an optional sample doc. */
export interface AuditInput {
  spec: TemplateSchemaSpec;
  /**
   * A representative JSON-LD document the template emits (single node, graph,
   * or array). Captured from the generator in CI or a fixture. If omitted, the
   * template is reported as "uncovered" (sample missing) — not validated.
   *
   * A real "live Rich Results API" check would fetch this externally and pass
   * it here; the audit itself stays network-free.
   */
  fetchedDoc?: unknown;
}

export type TemplateVerdict = "pass" | "fail" | "uncovered";

export interface TemplateAuditResult {
  template: string;
  label: string;
  verdict: TemplateVerdict;
  /** Expected types that were not found in the sample document. */
  missingTypes: SchemaType[];
  /** Per-node validation results from {@link validateDocument}. */
  nodes: NodeValidationResult[];
  requiredMisses: number;
  recommendedMisses: number;
}

export interface AuditReport {
  generatedAt: string;
  /** Overall verdict: fail if any template fails or required-miss budget blown. */
  verdict: "pass" | "fail";
  totalTemplates: number;
  passed: number;
  failed: number;
  uncovered: number;
  totalRequiredMisses: number;
  totalRecommendedMisses: number;
  results: TemplateAuditResult[];
  /** True when the previous audit is older than the quarterly threshold. */
  overdue: boolean;
}

/**
 * Run the audit. Pure: callers supply `now` and `lastAuditAt` so it's
 * deterministic and testable; production passes real dates.
 */
export function runAudit(
  inputs: AuditInput[],
  opts: { now?: Date; lastAuditAt?: Date } = {},
): AuditReport {
  const now = opts.now ?? new Date();
  const results: TemplateAuditResult[] = inputs.map((input) => auditTemplate(input));

  const totalRequiredMisses = results.reduce((s, r) => s + r.requiredMisses, 0);
  const totalRecommendedMisses = results.reduce((s, r) => s + r.recommendedMisses, 0);
  const failed = results.filter((r) => r.verdict === "fail").length;
  const passed = results.filter((r) => r.verdict === "pass").length;
  const uncovered = results.filter((r) => r.verdict === "uncovered").length;

  const overdue = opts.lastAuditAt
    ? daysBetween(opts.lastAuditAt, now) > AUDIT_THRESHOLDS.staleAfterDays
    : false;

  const verdict: "pass" | "fail" =
    failed > 0 || totalRequiredMisses > AUDIT_THRESHOLDS.maxRequiredMisses ? "fail" : "pass";

  return {
    generatedAt: now.toISOString(),
    verdict,
    totalTemplates: inputs.length,
    passed,
    failed,
    uncovered,
    totalRequiredMisses,
    totalRecommendedMisses,
    results,
    overdue,
  };
}

function auditTemplate(input: AuditInput): TemplateAuditResult {
  const { spec, fetchedDoc } = input;

  if (fetchedDoc === undefined) {
    return {
      template: spec.template,
      label: spec.label,
      verdict: "uncovered",
      missingTypes: [...spec.expects],
      nodes: [],
      requiredMisses: 0,
      recommendedMisses: 0,
    };
  }

  const nodes = validateDocument(fetchedDoc);
  const foundTypes = new Set(nodes.map((n) => n.type));
  const missingTypes = spec.expects.filter((t) => !foundTypes.has(t));

  const requiredMisses =
    nodes.reduce((s, n) => s + n.missingRequired.length + n.errors.length, 0) +
    missingTypes.length;
  const recommendedMisses = nodes.reduce((s, n) => s + n.missingRecommended.length, 0);

  const verdict: TemplateVerdict =
    requiredMisses > AUDIT_THRESHOLDS.maxRequiredMisses ? "fail" : "pass";

  return {
    template: spec.template,
    label: spec.label,
    verdict,
    missingTypes,
    nodes,
    requiredMisses,
    recommendedMisses,
  };
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}
