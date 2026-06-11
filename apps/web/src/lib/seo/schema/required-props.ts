/**
 * Required-property contract per schema.org `@type`.
 *
 * The Sprint-0 schema generator (`lib/seo.ts` + per-page inline `@graph`) emits
 * JSON-LD for many templates. This module encodes, ONCE, the properties Google
 * Rich Results / schema.org require (or strongly recommend) for each `@type` we
 * ship. It is the shared contract consumed by:
 *   - the CI test (`schema.test.ts`) — fail the build if a generator drops a
 *     required prop;
 *   - the quarterly audit (`audit.ts`) — enumerate templates -> checklist.
 *
 * Pure data + pure validators. No network (Rich Results validation is done
 * *structurally* here — required-prop presence + a few shape rules — not by
 * calling Google's live API, per the brief's "no network" rule).
 *
 * Scope: the `@type`s in TODO_schema_library.md's master list, restricted to
 * ones we actually generate (verified by grepping the app's inline JSON-LD).
 */

/** schema.org types we generate and validate. */
export type SchemaType =
  | "Organization"
  | "WebSite"
  | "WebPage"
  | "CollectionPage"
  | "BreadcrumbList"
  | "FAQPage"
  | "Article"
  | "NewsArticle"
  | "TechArticle"
  | "HowTo"
  | "Event"
  | "Place"
  | "Product"
  | "Person"
  | "Dataset"
  | "DefinedTerm"
  | "DefinedTermSet"
  | "Course"
  | "LearningResource"
  | "VideoObject"
  | "PodcastSeries"
  | "PodcastEpisode"
  | "Review"
  | "AggregateRating"
  | "ItemList"
  | "SoftwareApplication"
  | "Service"
  | "Book"
  | "JobPosting";

/**
 * Required props per type. These are the props whose ABSENCE makes the markup
 * invalid / ineligible for the corresponding rich result, per Google's
 * structured-data docs. Recommended-but-optional props live in
 * {@link RECOMMENDED_PROPS}.
 *
 * `@context`/`@type` are validated separately (see {@link validateNode}) so we
 * don't repeat them in every list.
 */
export const REQUIRED_PROPS: Record<SchemaType, string[]> = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  WebPage: ["name", "url"],
  CollectionPage: ["name", "url"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Article: ["headline", "author", "publisher"],
  NewsArticle: ["headline", "author", "publisher", "datePublished"],
  TechArticle: ["headline", "author"],
  HowTo: ["name", "step"],
  Event: ["name", "startDate", "location"],
  Place: ["name"],
  Product: ["name"],
  Person: ["name"],
  Dataset: ["name", "description"],
  DefinedTerm: ["name"],
  DefinedTermSet: ["name"],
  Course: ["name", "description", "provider"],
  LearningResource: ["name"],
  VideoObject: ["name", "thumbnailUrl", "uploadDate"],
  PodcastSeries: ["name"],
  PodcastEpisode: ["name"],
  Review: ["author", "reviewRating", "itemReviewed"],
  AggregateRating: ["ratingValue", "ratingCount"],
  ItemList: ["itemListElement"],
  SoftwareApplication: ["name"],
  Service: ["name"],
  Book: ["name", "author"],
  JobPosting: ["title", "datePosted", "hiringOrganization"],
};

/** Recommended (not required) props — surfaced as warnings in the audit. */
export const RECOMMENDED_PROPS: Partial<Record<SchemaType, string[]>> = {
  Organization: ["logo", "description", "sameAs"],
  Article: ["datePublished", "dateModified", "image", "mainEntityOfPage"],
  NewsArticle: ["dateModified", "image"],
  Event: ["endDate", "description", "offers", "eventStatus"],
  Product: ["image", "description", "offers", "brand"],
  Dataset: ["url", "license", "creator", "distribution"],
  VideoObject: ["description", "duration", "contentUrl"],
  Course: ["url", "inLanguage"],
  Person: ["url", "jobTitle", "sameAs"],
  FAQPage: ["inLanguage"],
  BreadcrumbList: [],
};

export interface NodeValidationIssue {
  type: string;
  missingRequired: string[];
  missingRecommended: string[];
  /** Structural errors (wrong @context, empty list, bad ListItem, …). */
  errors: string[];
}

export interface NodeValidationResult extends NodeValidationIssue {
  valid: boolean;
}

const SCHEMA_CONTEXT = "https://schema.org";

/** Is this a `@type` we have a contract for? */
export function isKnownType(t: string): t is SchemaType {
  return t in REQUIRED_PROPS;
}

/**
 * Structurally validate a single JSON-LD node against its required/recommended
 * props plus a few `@type`-specific shape rules. Pure; no network.
 *
 * `requireContext` should be true only for a top-level node (the `@context` is
 * usually set once on the graph root, not on every `@graph` member).
 */
export function validateNode(
  node: Record<string, unknown>,
  opts: { requireContext?: boolean } = {},
): NodeValidationResult {
  const errors: string[] = [];
  const rawType = node["@type"];
  const type = typeof rawType === "string" ? rawType : "";

  if (!type) {
    return {
      type: "",
      valid: false,
      missingRequired: [],
      missingRecommended: [],
      errors: ['node is missing "@type"'],
    };
  }

  if (opts.requireContext) {
    const ctx = node["@context"];
    if (ctx !== SCHEMA_CONTEXT) {
      errors.push(`@context must be "${SCHEMA_CONTEXT}" on the root node`);
    }
  }

  if (!isKnownType(type)) {
    // Unknown to our contract — not an error, but report it so the audit can
    // decide whether the master list needs extending.
    return {
      type,
      valid: errors.length === 0,
      missingRequired: [],
      missingRecommended: [],
      errors: [...errors, `no required-prop contract for @type "${type}"`],
    };
  }

  const required = REQUIRED_PROPS[type];
  const recommended = RECOMMENDED_PROPS[type] ?? [];

  const missingRequired = required.filter((p) => !hasValue(node[p]));
  const missingRecommended = recommended.filter((p) => !hasValue(node[p]));

  // Type-specific shape rules.
  if (type === "BreadcrumbList" || type === "ItemList") {
    const list = node.itemListElement;
    if (Array.isArray(list)) {
      if (list.length === 0) errors.push(`${type}.itemListElement must not be empty`);
      list.forEach((el, i) => {
        const item = el as Record<string, unknown>;
        if (item?.["@type"] !== "ListItem") {
          errors.push(`${type}.itemListElement[${i}] must be a ListItem`);
        }
        if (typeof item?.position !== "number") {
          errors.push(`${type}.itemListElement[${i}] missing numeric position`);
        }
        if (!hasValue(item?.name)) {
          errors.push(`${type}.itemListElement[${i}] missing name`);
        }
      });
      // Positions must be 1-based and contiguous.
      const positions = list
        .map((el) => (el as Record<string, unknown>)?.position)
        .filter((p): p is number => typeof p === "number");
      positions.forEach((p, i) => {
        if (p !== i + 1) {
          errors.push(`${type}.itemListElement positions must be 1-based contiguous (got ${p} at index ${i})`);
        }
      });
    }
  }

  if (type === "FAQPage") {
    const main = node.mainEntity;
    if (Array.isArray(main)) {
      main.forEach((q, i) => {
        const question = q as Record<string, unknown>;
        if (question?.["@type"] !== "Question") errors.push(`FAQPage.mainEntity[${i}] must be a Question`);
        if (!hasValue(question?.name)) errors.push(`FAQPage.mainEntity[${i}] missing name`);
        const ans = question?.acceptedAnswer as Record<string, unknown> | undefined;
        if (!ans || ans["@type"] !== "Answer" || !hasValue(ans.text)) {
          errors.push(`FAQPage.mainEntity[${i}] missing valid acceptedAnswer`);
        }
      });
    }
  }

  return {
    type,
    valid: missingRequired.length === 0 && errors.length === 0,
    missingRequired,
    missingRecommended,
    errors,
  };
}

/**
 * Validate a full JSON-LD document. Handles the three shapes we emit:
 *   - a single node `{ "@context", "@type", ... }`
 *   - a graph `{ "@context", "@graph": [ ...nodes ] }`
 *   - a bare array of nodes
 */
export function validateDocument(doc: unknown): NodeValidationResult[] {
  if (Array.isArray(doc)) {
    return doc.map((n) => validateNode(n as Record<string, unknown>));
  }
  const obj = (doc ?? {}) as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    const graph = obj["@graph"] as Record<string, unknown>[];
    // Context lives on the wrapper; require it there.
    const ctxOk = obj["@context"] === SCHEMA_CONTEXT;
    const results = graph.map((n) => validateNode(n));
    if (!ctxOk) {
      results.push({
        type: "@graph",
        valid: false,
        missingRequired: [],
        missingRecommended: [],
        errors: [`@graph wrapper must set @context to "${SCHEMA_CONTEXT}"`],
      });
    }
    return results;
  }
  return [validateNode(obj, { requireContext: true })];
}

/** A value "counts" as present if it's not null/undefined/empty-string/empty-array. */
function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
