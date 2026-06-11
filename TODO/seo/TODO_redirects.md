# TODO — Redirects Management at Scale

## Goal
At programmatic scale, broken redirects become an SEO disaster. Engineer the system.

## Progress
- 9 / 9 done

## Tasks
- [x] Central redirect registry (CSV in repo + edge worker) — apps/web/src/data/redirects.csv + apps/web/src/lib/seo/redirects/{registry,io}.ts (loader); edge wiring proposed in c:\tmp\sprint261_shared_REDIRECTS.txt (middleware.ts)
- [x] Per-redirect type (301 / 302 / 410) — apps/web/src/lib/seo/redirects/registry.ts (RedirectStatus, validated in buildRegistry)
- [x] Bulk import / export — apps/web/src/lib/seo/redirects/io.ts (parseRedirectsCsv / exportRedirectsCsv)
- [x] Per-redirect created-at + reason — apps/web/src/lib/seo/redirects/registry.ts (RedirectRule.createdAt + reason)
- [x] Loop / chain detector (CI) — apps/web/src/lib/seo/redirects/chain-detector.ts + chain-detector.test.ts
- [x] Hreflang-aware redirects — apps/web/src/lib/seo/redirects/resolve.ts (resolveRedirect maps EN base rule into requesting locale)
- [x] Locale-prefix redirects — apps/web/src/lib/seo/redirects/resolve.ts (splitLocale/applyLocale; prefixes preserved)
- [x] Old slug → new slug auto-redirect on rename — apps/web/src/lib/seo/redirects/slug-history.ts (rulesForRename / collapseRenameHistory)
- [x] Quarterly redirect audit — apps/web/src/lib/seo/redirects/audit.ts (runAudit + thresholds)

## i18n
- Locale-prefixed paths handled.

### Примітки
A 5-redirect chain kills SEO + UX. Lint at PR time.
