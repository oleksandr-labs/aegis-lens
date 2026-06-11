# TODO — Rate Limiting & Quotas

## Goal
Fair, predictable limits. Abuse-resistant. Enterprise-customizable.

## Progress
- 9 / 9 done

## Tasks
- [x] Per-tier limits (Free / Pro / Team / Enterprise) — `TIER_LIMITS` in `apps/web/src/lib/rate-limit.ts` with anonymous/free/pro/enterprise/internal tiers
- [x] Sliding-window counter (in-memory; Redis swap in Sprint 2) ✓ Sprint 1.7
- [x] Per-IP accounting via X-Forwarded-For / X-Real-IP ✓ Sprint 1.7
- [x] 429 with `Retry-After` + `X-RateLimit-*` headers ✓ Sprint 1.7 + `Retry-After` added to 429 responses
- [x] Burst vs sustained limits — `burst` field per endpoint-family in `TIER_LIMITS`
- [x] Per-endpoint policies (some heavier) — `rateLimitTier(key, tier, endpoint)` selects per-family limits (events/search/copilot/export/layers)
- [x] Quota dashboard for customers — `apps/web/src/lib/quota-dashboard.ts` (QuotaMetric/QuotaDashboard types, buildQuotaDashboard, getQuotaWarnings) + `apps/web/src/app/api/v1/quota/route.ts` (GET /api/v1/quota)
- [x] Abuse signals → temporary block + customer notification — `apps/web/src/lib/abuse-block.ts` (AbuseSignal enum, AbuseBlock type, recordAbuseSignal, isBlocked, unblock, notifyAbuse, BLOCK_DURATIONS)
- [x] Enterprise custom limits via contract — `apps/web/src/lib/enterprise-limits.ts` (EnterpriseContract, EnterpriseLimitConfig, getEffectiveLimits, upsertContract, getContract)

## i18n
- Error messages localized.

### Примітки
Limit early, observe, then raise. Lower limits are easier than tightening loud customers.
