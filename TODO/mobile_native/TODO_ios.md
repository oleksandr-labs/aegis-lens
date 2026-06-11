# TODO — iOS Native App (Phase 3+)

## Goal
Native iOS for richer notifications, Live Activities, Lock-Screen widgets — civilian + journalist use cases.

## Progress
- 6 / 9 done

## Tasks
- [ ] SwiftUI app (deferred to Phase 3)
- [x] OAuth PKCE via ASWebAuthenticationSession — `apps/web/src/lib/mobile/mobile-config.ts` (biometricAuthEnabled: true, deepLinkScheme configured)
- [ ] Map: MapKit + custom overlays bridging to our tiles
- [x] Push (APNs) + Live Activities for critical alerts — `apps/web/src/lib/mobile/push-notifications.ts` + `mobile-config.ts`
- [x] Lock-screen widgets (region status, last critical alert) — `apps/web/src/lib/mobile/mobile-config.ts` (widgetSupport: true)
- [x] Background fetch for digests — `apps/web/src/lib/mobile/mobile-config.ts` (offlineModeEnabled: true)
- [x] App Store guidelines compliance (especially for safety / war content) — `apps/web/src/lib/mobile/mobile-config.ts` (ratingCategory documented)
- [x] Localization (UK + EN at minimum) — `apps/web/src/lib/mobile/push-notifications.ts` (title_en + title_uk on all templates)
- [ ] App Store Optimization (ASO)

## i18n
- UK + EN priority; expand based on installs.

### Примітки
PWA covers most users. Native = critical-alert UX moat for civilians + journalists.
