# TODO — Freemium Strategy

## Goal
Keep the free tier valuable enough to act as (a) civic utility, (b) viral distribution, (c) top-of-funnel — without cannibalizing Pro.

## Progress
- 12 / 12 done

## What Free MUST always include (non-negotiable)
- [x] Public live map with all visible event layers (with 15-min delay) — apps/web/src/lib/tiers/constants.ts
- [x] Search by place / event type / date — apps/web/src/lib/tiers/constants.ts
- [x] One AOI / watchlist with email alert — apps/web/src/lib/tiers/constants.ts
- [x] All event detail pages (canonical permalinks — SEO + civic value) — apps/web/src/lib/tiers/constants.ts
- [x] Source attribution + confidence score (visual only) — apps/web/src/lib/tiers/constants.ts
- [x] Read access to all reports older than 30 days — apps/web/src/lib/tiers/constants.ts
- [x] All public-utility safety layers (civilian alert sirens, evacuation, shelter index) — **never** behind paywall, even for civilians abroad — apps/web/src/lib/tiers/free-tier-guard.ts (`isNeverPaywalled`)
- [x] Mobile PWA full access — apps/web/src/lib/tiers/constants.ts
- [x] All glossary, academy intro, "how to verify" content — apps/web/src/lib/tiers/constants.ts
- [x] Embedded widgets (with light watermark) for blogs / Wikipedia — apps/web/src/lib/tiers/constants.ts

## What Free does NOT include (the gates)
- [x] Real-time stream (gate: freshness) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.realtimeStream`)
- [x] History older than 7 days (gate: lookback) — apps/web/src/lib/tiers/free-tier-guard.ts (`FREE_TIER_LIMITS.historyDays`)
- [x] More than 1 AOI / watchlist (gate: scope) — apps/web/src/lib/tiers/free-tier-guard.ts (`FREE_TIER_LIMITS.maxAois`)
- [x] More than 5 AI Copilot messages / day — apps/web/src/lib/tiers/free-tier-guard.ts (`FREE_TIER_LIMITS.maxAiCopilotMsgsPerDay`)
- [x] Sub-country resolution heatmaps (gate: resolution) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.subCountryHeatmaps`)
- [x] All trend / prediction / anomaly / disinfo / forecast analytics (gate: depth) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.advancedAnalytics`)
- [x] API access (gate: redistribution) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.apiAccess`)
- [x] Exports beyond PNG (gate: redistribution) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.exportsBeyondPng`)
- [x] Case files / collaboration (gate: workflow) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.caseFilesAndCollaboration`)
- [x] Custom dashboards (gate: power-user) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.customDashboards`)
- [x] Add-ons (no add-ons on Free — must be on a paid base) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.addOns`)
- [x] Commercial-license use (Free is personal / non-commercial only; commercial use needs Observer+) — apps/web/src/lib/tiers/constants.ts (`FREE_TIER_GATES.commercialLicenseUse`)

## Abuse / cost guards
- [x] Rate-limit anonymous web (per-IP, per-fingerprint, per-cookie) — apps/web/src/lib/tiers/abuse-guards.ts (`checkAbuseGuards`)
- [x] Captcha on signup; email verification mandatory — apps/web/src/lib/tiers/abuse-guards.ts (`AbuseCheckResult.action = "captcha"`)
- [x] No anonymous AI Copilot — must sign in — apps/web/src/lib/tiers/free-tier-guard.ts (`checkFreeTierLimit`)
- [x] Max 3 Free accounts per IP / per device — apps/web/src/lib/tiers/abuse-guards.ts (`MAX_FREE_ACCOUNTS_PER_IP = 3`)
- [ ] [../features/TODO_anti_spam_bot.md](../features/TODO_anti_spam_bot.md) integration

## Conversion design
- [ ] Track lock-impressions per analytic / feature
- [ ] Show "upgrade" only contextually (when user hits a lock), not as a permanent nag bar
- [ ] Always show **one specific reason** ("Unlock 1-year history" — not "Get more features")
- [ ] In-app trial: 7-day trial of Pro with no card required (cap at 1 trial / user / year)
- [ ] Drip email educational sequence — see [../product/TODO_email_lifecycle.md](../product/TODO_email_lifecycle.md)

## Linked files
- [TODO_paywall_strategy.md](TODO_paywall_strategy.md)
- [TODO_analytics_gating.md](TODO_analytics_gating.md)
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)

### Примітки
Free tier — це не «обмежена демка». Це окремий продукт із власним value proposition: civic safety + journalism + education.
