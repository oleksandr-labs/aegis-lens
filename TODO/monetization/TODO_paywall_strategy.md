# TODO — Paywall & Gating Strategy (UX)

## Goal
Define how locked features look, when upgrade prompts trigger, and what is forbidden (dark patterns).

## Progress
- 14 / 14 done

## Gate types
- [x] **Soft gate** — feature visible, can be opened, returns a teaser + upgrade CTA. Used for: most analytics, history, exports. — apps/web/src/lib/paywall/gate-types.ts (`GateType = "soft"`)
- [x] **Hard gate** — feature hidden from menu entirely. Used for: gov-only modules, enterprise admin tools. — apps/web/src/lib/paywall/gate-types.ts (`GateType = "hard"`)
- [x] **Quota gate** — feature works, runs out at a number (5/day, 100/mo). Modal at 100%. Used for: AI Copilot, alerts, exports, reports. — apps/web/src/lib/paywall/gate-types.ts (`GateType = "quota"`)
- [x] **Throttle gate** — feature works slower for lower tiers (e.g. real-time becomes 15-min delay). Used for: freshness axis. — apps/web/src/lib/paywall/gate-types.ts (`GateType = "throttle"`)
- [x] **Watermark gate** — feature works but output is watermarked / branded. Used for: free embeds, screenshots. — apps/web/src/lib/paywall/gate-types.ts (`GateType = "watermark"`)

## Teaser content rules
- [x] Show locked analytic with **real shape, blurred values** — never fake data — apps/web/src/lib/paywall/gate-types.ts (`TeaserShape = "blurred_visual"`)
- [x] Show **rounded headline number** ("≈ 1.2k events" not "1,247") — apps/web/src/lib/paywall/gate-types.ts (`TeaserShape = "rounded_number"`)
- [x] Show **last public datapoint** (e.g. "last update 14:32 — real-time available in Pro") — apps/web/src/lib/paywall/gate-types.ts (`TeaserShape = "last_public_datapoint"`)
- [x] Show **specific value gained** ("Unlock real-time + 1-year history") — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[*].label`)
- [x] Show **price + 1-click trial** if eligible — apps/web/src/lib/paywall/upgrade-flow.ts (`ANTI_FRICTION_RULES.oneClickUpgradeForExistingCustomers`)
- [x] Don't show competitor comparisons in paywall (cheap) — apps/web/src/lib/paywall/gate-types.ts (`DarkPatternCheck` documentation)
- [x] Don't show urgency ("only today!") — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[3]`)

## Dark patterns — FORBIDDEN
- [x] No "trial auto-converts without warning". Always warn 72h before charge. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[0]`) + apps/web/src/lib/paywall/gate-types.ts (`DarkPatternCheck.noSilentTrialAutoConversion`)
- [x] No "downgrade requires call to sales" for self-serve tiers. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[1]`) + gate-types.ts (`DarkPatternCheck.noDowngradeRequiresSalesCall`)
- [x] No "you'll lose your data if you don't pay". Free tier keeps all user-created data (case files, AOIs) read-only. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[2]`) + gate-types.ts (`DarkPatternCheck.noDataLossThreat`)
- [x] No fake countdowns / fake urgency. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[3]`) + gate-types.ts (`DarkPatternCheck.noFakeUrgency`)
- [x] No pre-checked add-ons at checkout. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[4]`) + gate-types.ts (`DarkPatternCheck.noPreCheckedAddOns`)
- [x] No different prices based on detected device / OS without disclosure. — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[5]`) + gate-types.ts (`DarkPatternCheck.noPriceDiscriminationByDevice`)
- [x] No "speak to sales" requirement to see prices (Pro/Team/Business prices are public). — apps/web/src/lib/paywall/upgrade-flow.ts (`FORBIDDEN_DARK_PATTERNS[6]`) + gate-types.ts (`DarkPatternCheck.noSalesWallForPricing`)

## Upgrade trigger moments (high-intent)
- [x] User tries to export > free quota — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[0]: export_quota_exceeded`)
- [x] User tries to open AOI #2 — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[1]: aoi_second_create`)
- [x] User tries to scroll history past 7d — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[2]: history_beyond_7d`)
- [x] User asks Copilot about predictions / trends — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[3]: copilot_prediction_query`)
- [x] User invites 2nd seat — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[4]: second_seat_invite`)
- [x] User views "API" page (referral attribution) — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[5]: api_page_view`)
- [x] User views any Pro-only analytic preview ≥3× in 7 days — apps/web/src/lib/paywall/upgrade-flow.ts (`UPGRADE_TRIGGER_EVENTS[6]: pro_analytic_repeated_preview`)

## Anti-friction
- [x] All upgrades 1-click for existing Stripe customers — apps/web/src/lib/paywall/upgrade-flow.ts (`ANTI_FRICTION_RULES.oneClickUpgradeForExistingCustomers`)
- [x] Upgrade modal can be dismissed and never auto-shows the same modal twice in 24h — apps/web/src/lib/paywall/upgrade-flow.ts (`shouldShowUpgradeModal`)
- [x] After upgrade, deep-link back to the exact feature that triggered the gate — apps/web/src/lib/paywall/upgrade-flow.ts (`buildUpgradeDeepLink`)
- [x] Pricing page is open / no login required — apps/web/src/lib/paywall/upgrade-flow.ts (`ANTI_FRICTION_RULES.pricingPagePublic`)
- [x] Self-serve downgrade in 2 clicks — apps/web/src/lib/paywall/upgrade-flow.ts (`ANTI_FRICTION_RULES.selfServeDowngradeIn2Clicks`)

## Linked files
- [TODO_analytics_gating.md](TODO_analytics_gating.md)
- [TODO_freemium_strategy.md](TODO_freemium_strategy.md)
- [../design/TODO_notification_design.md](../design/TODO_notification_design.md)
- [../features/TODO_onboarding.md](../features/TODO_onboarding.md)

### Примітки
Гейт має продавати конкретну функцію, не «преміум». Generic-upgrade-banner — заборонено.
