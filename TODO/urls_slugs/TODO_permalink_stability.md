# TODO — Permalink Stability

## Goal
URLs are forever. Never break a link without a redirect.

## Progress
- 10 / 10 done

## Tasks
- [x] Entity-ID stored separately from slug (slug can change, ID does not) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.entityIdSeparateFromSlug)
- [x] Every slug change generates an auto-301 redirect — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.autoRedirectOnSlugChange)
- [x] Redirect registry centralized → see [../seo/TODO_redirects.md](../seo/TODO_redirects.md) — apps/web/src/lib/seo/urls/permalink-stability.ts (PermalinkRedirectStore)
- [x] No 4-redirect chains (collapse to direct) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.maxRedirectChainLength + collapseRedirectChain)
- [x] Deleted entities → 410 Gone (not 404) where intentional — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.deletedEntities)
- [x] Archived investigations stay live (no take-downs without retraction explanation) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.archivedInvestigations)
- [x] URL versioning policy: never use `v2/` in user-facing URLs (API only) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.noVersionInUserFacingUrls)
- [x] Slug-rename governance: requires content-owner approval + redirect plan — apps/web/src/lib/seo/urls/permalink-stability.ts (SLUG_RENAME_GOVERNANCE_EN/UK)
- [x] Annual permalink audit (broken-link scanner) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.annualAudit)
- [x] Per-CMS field validation (no slug change without confirmation) — apps/web/src/lib/seo/urls/permalink-stability.ts (PERMALINK_RULES.perCmsFieldValidation)

## i18n
- Per-locale permalinks stable independently.

### Примітки
A 404 on a previously-ranked URL = lost compounding link equity. Treat permalinks as data.
