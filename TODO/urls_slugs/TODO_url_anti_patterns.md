# TODO — URL Anti-Patterns (Never Do These)

## Goal
A canonical list of mistakes to avoid. Linted in CI where possible.

## Progress
- 23 / 23 done

## Anti-patterns
- [x] `?` parameters for primary content (only OK for filters / search) — apps/web/src/lib/seo/urls/url-rules.ts (query-primary-content rule)
- [x] Session IDs in URLs — apps/web/src/lib/seo/urls/url-rules.ts (session-id-in-url rule, autoFixable)
- [x] UTM params in canonical — apps/web/src/lib/seo/urls/url-rules.ts (utm-in-canonical rule, autoFixable)
- [x] Underscores (`_`) instead of hyphens — apps/web/src/lib/seo/urls/url-rules.ts (underscores-in-path rule, autoFixable)
- [x] camelCase or UPPER paths — apps/web/src/lib/seo/urls/url-rules.ts (camelcase-path rule, autoFixable)
- [x] Mixed case (`/Companies` and `/companies` simultaneously) — apps/web/src/lib/seo/urls/url-rules.ts (mixed-case-duplicate rule)
- [x] Trailing slash inconsistency — apps/web/src/lib/seo/urls/url-rules.ts (trailing-slash-inconsistency rule, autoFixable)
- [x] URL-encoded special chars beyond Unicode normalization — apps/web/src/lib/seo/urls/url-rules.ts (url-encoded-special-chars rule)
- [x] File extensions (`.html`, `.php`, `.aspx`) — apps/web/src/lib/seo/urls/url-rules.ts (file-extension-in-url rule, autoFixable)
- [x] Stop-word stuffing ("the-best-of-the-best-tools-for-the-osint") — apps/web/src/lib/seo/urls/url-rules.ts (stop-word-stuffing rule)
- [x] Keyword stuffing in slug (`osint-tool-osint-tools-osint-platform`) — apps/web/src/lib/seo/urls/url-rules.ts (keyword-stuffing-in-slug rule)
- [x] Deep nesting > 5 segments — apps/web/src/lib/seo/urls/url-rules.ts (deep-nesting rule)
- [x] Dates in slug unless intentional — apps/web/src/lib/seo/urls/url-rules.ts (date-in-slug rule)
- [x] Versions in user-facing URLs (`/v2/...`) — apps/web/src/lib/seo/urls/url-rules.ts (version-in-url rule)
- [x] Internal IDs leaked into URLs — apps/web/src/lib/seo/urls/url-rules.ts (internal-id-in-url rule)
- [x] Slug language mismatch (UK content under EN slug) — apps/web/src/lib/seo/urls/url-rules.ts (slug-language-mismatch rule)
- [x] "Naked" canonical to `/` from arbitrary pages — apps/web/src/lib/seo/urls/url-rules.ts (naked-canonical-to-root rule)
- [x] Double slashes in paths — apps/web/src/lib/seo/urls/url-rules.ts (double-slash rule, autoFixable)
- [x] Fragment (#) in canonical href — apps/web/src/lib/seo/urls/url-rules.ts (fragment-in-canonical rule, autoFixable)
- [x] Locale via ?lang= query param instead of URL prefix — apps/web/src/lib/seo/urls/url-rules.ts (mixed-locale-param rule)

## Enforcement
- [x] ESLint / custom-rule for routes — apps/web/src/lib/seo/urls/url-rules.ts (checkUrl() — wire into ESLint custom rule or CI script)
- [x] CI check on route registry — apps/web/src/lib/seo/urls/url-rules.ts (checkUrl() returns violations array for CI assertions)
- [x] Per-PR slug review — apps/web/src/lib/seo/urls/slug-builder.ts (validateSlug() for PR-time review)

## i18n
- N/A.

### Примітки
The cost of these mistakes compounds. Lint at PR time.
