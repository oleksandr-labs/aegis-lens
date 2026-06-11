/**
 * Breadcrumb truncation for deep paths.
 *
 * Deep templates (e.g. `/regions/ua/kharkivska/kharkiv`,
 * `/use-cases/<vertical>/<task>/in/<country>`,
 * `/news/archive/<year>/<month>/<day>`) produce long trails that wrap or
 * overflow on small screens. The SERP/UX convention is to **keep the head and
 * tail and collapse the middle behind an ellipsis** ("Home / First / … / Parent
 * / Current").
 *
 * IMPORTANT: truncation is a *visual* concern only. The `BreadcrumbList`
 * JSON-LD must still contain the FULL chain (Google expects the complete
 * hierarchy), so this operates on the view layer and is kept separate from
 * {@link render-rules.breadcrumbListJsonLd}, which always uses the untruncated
 * chain.
 *
 * Pure, no React — unit-testable.
 */

import { type CrumbView } from "./render-rules";

/** Sentinel marking the collapsed middle. Render as an ellipsis / disclosure. */
export interface EllipsisCrumb {
  ellipsis: true;
  /** The crumb views hidden behind the ellipsis (for a popover / expand). */
  collapsed: CrumbView[];
  key: "__ellipsis__";
}

export type TruncatedCrumb = CrumbView | EllipsisCrumb;

export function isEllipsis(c: TruncatedCrumb): c is EllipsisCrumb {
  return (c as EllipsisCrumb).ellipsis === true;
}

export interface TruncateOptions {
  /** Max visible items INCLUDING the ellipsis sentinel. Default 5. */
  maxItems?: number;
  /** How many leading crumbs to always keep (incl. Home). Default 1. */
  head?: number;
  /** How many trailing crumbs to always keep (incl. current). Default 2. */
  tail?: number;
}

/**
 * Collapse the middle of a long crumb trail.
 *
 * Returns the original array (no sentinel) when it already fits within
 * `maxItems`. Otherwise returns `[...head, ellipsis, ...tail]` where the
 * ellipsis carries the hidden crumbs so a UI can offer "expand".
 *
 * Invariants:
 *  - head + tail < maxItems (the ellipsis occupies one slot); if the caller
 *    passes degenerate values we clamp so at least one crumb is collapsed.
 *  - The current page (last crumb) is always in the tail, always visible.
 */
export function truncateCrumbs(
  crumbs: CrumbView[],
  opts: TruncateOptions = {},
): TruncatedCrumb[] {
  const maxItems = Math.max(3, opts.maxItems ?? 5);
  let head = Math.max(1, opts.head ?? 1);
  let tail = Math.max(1, opts.tail ?? 2);

  // No truncation needed.
  if (crumbs.length <= maxItems) return [...crumbs];

  // Ensure head + tail leave room for the single ellipsis slot.
  while (head + tail > maxItems - 1 && head + tail > 2) {
    if (tail > head) tail -= 1;
    else head -= 1;
  }

  const headPart = crumbs.slice(0, head);
  const tailPart = crumbs.slice(crumbs.length - tail);
  const collapsed = crumbs.slice(head, crumbs.length - tail);

  const ellipsis: EllipsisCrumb = {
    ellipsis: true,
    collapsed,
    key: "__ellipsis__",
  };

  return [...headPart, ellipsis, ...tailPart];
}

/** Localized aria-label / tooltip for the ellipsis disclosure. */
export function ellipsisLabel(locale: "en" | "uk" | string): string {
  return locale === "uk" ? "Показати проміжні розділи" : "Show intermediate levels";
}
