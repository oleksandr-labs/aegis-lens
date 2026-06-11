/**
 * Breadcrumbs SEO library — barrel.
 *
 * Hierarchical, locale-aware breadcrumb resolution + render policy for Aegis
 * Lens. Extends the Sprint-0 inline breadcrumbs (visible `<nav>` +
 * `BreadcrumbList` JSON-LD) with a single shared source of truth:
 *
 *   hierarchy   — resolve the full ancestor chain for a route (Home … current)
 *   patterns    — per-template ancestor chains (documented contract)
 *   render-rules— current-page-unlinked rule + BreadcrumbList JSON-LD builder
 *   truncate    — collapse the middle of deep trails (visual only)
 *   responsive  — mobile horizontal-scroll class tokens
 *
 * Every export is pure and unit-testable; none import React.
 */

export * from "./hierarchy";
export * from "./render-rules";
export * from "./truncate";
export * from "./responsive";
export * from "./patterns";
