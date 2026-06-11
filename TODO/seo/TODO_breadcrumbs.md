# TODO — Breadcrumbs (UX + SEO)

## Goal
Visible breadcrumbs everywhere + schema.org `BreadcrumbList`. UX win + SERP rich-snippet.

## Progress
- 8 / 8 done

## Tasks
- [x] Visible breadcrumb component on every non-root page ✓ Sprint 0
- [x] Schema.org `BreadcrumbList` JSON-LD ✓ Sprint 0
- [x] Locale-aware breadcrumbs ✓ Sprint 0
- [x] Hierarchical hierarchy (not just back-button) — apps/web/src/lib/seo/breadcrumbs/hierarchy.ts (per-route ancestor chain resolver: homeCrumb/sectionCrumb/currentCrumb/chain/resolveFromPath, locale-aware via urls.*)
- [x] Last segment unlinked (current page) — apps/web/src/lib/seo/breadcrumbs/render-rules.ts (applyCurrentPageRule + toCrumbViews force last crumb hrefless / aria-current; breadcrumbListJsonLd omits `item` on current page)
- [x] Truncation rules for deep paths — apps/web/src/lib/seo/breadcrumbs/truncate.ts (truncateCrumbs collapses middle to an ellipsis sentinel, keeps head+tail; visual-only, JSON-LD stays full)
- [x] Mobile-friendly (horizontal scroll if needed) — apps/web/src/lib/seo/breadcrumbs/responsive.ts (breadcrumbClasses tokens: overflow-x-auto/whitespace-nowrap/scrollbar-none/snap; .scrollbar-none CSS recipe noted in module doc)
- [x] Per-template breadcrumb pattern documented — apps/web/src/lib/seo/breadcrumbs/patterns.ts (BREADCRUMB_PATTERNS per template + BREADCRUMB_PATTERN_DOCS "Home > … > Current" docstrings, en+uk labels)

## i18n
- Crumb labels localized; URLs follow locale paths.

### Примітки
Breadcrumbs in SERP boost CTR. Free win.
