/**
 * Per-template canonical resolver (TODO #4).
 *
 * One place that, given a template + the current request URL, returns the
 * canonical PATH the page should declare. It composes the lower-level rules:
 *  - strip tracking/filter/sort params (`param-canonical`)
 *  - collapse `?page=1` and self-canonicalize page N (`pagination-canonical`)
 *  - keep canonical self-referential per locale (locale handling stays in
 *    `buildMetadata`/`hreflangs`; this resolver works on the already-localized
 *    path so it never crosses locales).
 *
 * The metadata builder (`apps/web/src/lib/seo.ts`) currently derives canonical
 * directly from `pathFor(locale)`. Wiring this resolver in is a SHARED-ENTRY
 * change → proposed via the handoff file, not edited here.
 *
 * Pure, no network.
 */

import { toCanonicalPath, type ParamCanonicalOptions } from "./param-canonical";
import { withPageParam } from "./pagination-canonical";

export type CanonicalTemplate =
  | "listing" // paginated index (news, entities, topics, …) — keep `page`
  | "detail" // single resource (entity, topic, threat, …) — drop all params
  | "search" // ?q= pages — base path only (also noindex, handled elsewhere)
  | "compare" // identity param like ?oblasts= matters — keep identity only
  | "static"; // marketing/docs — drop everything

export type CanonicalRuleInput = {
  template: CanonicalTemplate;
  /** Current request path + query (already locale-prefixed). */
  url: string;
  /** Override param policy if a template needs it. */
  paramOptions?: ParamCanonicalOptions;
};

/**
 * Resolve the canonical path for a page of a given template.
 * Returns a path (locale-prefixed, query normalized) — NOT an absolute URL;
 * `absoluteUrl(SITE.url, path)` produces the final canonical.
 */
export function resolveCanonicalPath(input: CanonicalRuleInput): string {
  switch (input.template) {
    case "detail":
    case "static":
      // No query params are ever canonical for these.
      return toCanonicalPath(input.url, {
        ...input.paramOptions,
        identityParams: [],
        dropPagination: true,
      });

    case "search":
      // Drop everything incl. q — the canonical of a search page is its base
      // (the page itself is noindex via noindex-policy, but it still needs a
      // clean self-canonical).
      return toCanonicalPath(input.url, {
        ...input.paramOptions,
        identityParams: [],
        dropPagination: true,
      });

    case "compare":
      // Keep identity params (e.g. oblasts), drop tracking/filter/sort + page.
      return toCanonicalPath(input.url, {
        identityParams: ["oblasts"],
        dropPagination: true,
        ...input.paramOptions,
      });

    case "listing":
    default: {
      // Keep pagination, normalize `?page=1` away.
      const cleaned = toCanonicalPath(input.url, {
        identityParams: ["page"],
        ...input.paramOptions,
      });
      const u = new URL(cleaned, "https://canonical.local");
      const pageRaw = u.searchParams.get("page");
      const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
      const base = u.pathname.replace(/\/+$/, "") || "/";
      return withPageParam(base, Number.isFinite(page) ? page : 1);
    }
  }
}

/**
 * Map our richer `TemplateId` space onto the small canonical-template set, so
 * callers can pass a single template id throughout the dedup pipeline.
 */
export function canonicalTemplateFor(template: string): CanonicalTemplate {
  switch (template) {
    case "news":
    case "entities":
    case "topics":
    case "tags":
    case "listing":
    case "investigations":
    case "reports":
      return "listing";
    case "search":
    case "help":
      return "search";
    case "compare":
      return "compare";
    case "about":
    case "pricing":
    case "docs":
    case "static":
      return "static";
    default:
      return "detail";
  }
}
