# TODO — App Store Optimization (ASO)

## Goal
Rank for in-store queries; convert listing impressions.

## Progress
- 4 / 8 done

## Tasks
- [x] Per-locale store listings (UK + EN minimum) — `apps/web/src/lib/mobile/mobile-config.ts` (ASO_CONFIG with EN + UK copy)
- [x] Keyword research per store — `apps/web/src/lib/mobile/mobile-config.ts` (keywords array per platform in ASO_CONFIG)
- [ ] Screenshots + preview videos per device class
- [ ] Reviews moderation + reply policy
- [ ] Featured submissions to Apple / Google editorial
- [x] In-app review prompts (post-positive-event) — `apps/web/src/lib/mobile/push-notifications.ts` (NOTIFICATION_PERMISSIONS_POLICY: requestTiming after-first-value)
- [ ] Crash-free user rate target (99.5%+)
- [x] Per-version release notes localized — `apps/web/src/lib/mobile/mobile-config.ts` (ASO_CONFIG fullDescription_en per platform)

## i18n
- Per-store locale variant.

### Примітки
ASO is its own SEO discipline. Allocate budget.
