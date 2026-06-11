# TODO — API Versioning Strategy

## Goal
Long-lived major versions, additive minor changes, predictable deprecations.

## Progress
- 8 / 8 done

## Tasks
- [x] URL-based major version (`/v1`, `/v2`) — `apps/web/src/app/api/v1/` routes: events, search, layers, regions, sources, alerts, aois, cases, webhooks, travel-risk, review, copilot, health
- [x] Additive non-breaking by default — v1 aliases re-export main route handlers; new endpoints added without breaking changes
- [x] Breaking changes only across major versions — `apps/web/src/lib/api-version-guard.ts` (assertNonBreaking, BREAKING_CHANGE_POLICY) + `docs/api/breaking-change-policy.md`
- [x] Deprecation policy: 12 months minimum — documented in `/api/v1/route.ts` (sunsetAt: null, deprecatedAt: null, Deprecation header)
- [x] Per-endpoint deprecation header — `Deprecation: false` + `Aegis-API-Version: v1` on all v1 responses
- [x] Customer notification cadence (60d, 30d, 7d) — `apps/web/src/lib/deprecation-notifier.ts` (NOTIFICATION_CADENCE_DAYS, shouldNotifyToday, getDueNotifications, DEPRECATION_REGISTRY)
- [x] Migration guides per major version — `docs/api/migration-guide-template.md` with step-by-step template covering URL change, response parsing, pagination, SDK upgrade, parallel-running period
- [x] Per-version usage analytics → kill-switch by usage threshold — `apps/web/src/lib/version-analytics.ts` (recordVersionUsage, getVersionUsageCounts, checkKillSwitch, KILL_SWITCH_CONFIG)

## i18n
- Migration guides in EN + UK.

### Примітки
A 12-month deprecation policy is a sales feature for enterprise.
