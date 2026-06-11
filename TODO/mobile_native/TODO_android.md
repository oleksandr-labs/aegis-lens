# TODO — Android Native App (Phase 3+)

## Goal
Native Android parity for richer notifications and offline reliability — important in low-connectivity zones.

## Progress
- 5 / 8 done

## Tasks
- [ ] Kotlin / Compose
- [x] OAuth PKCE via AppAuth — `apps/web/src/lib/mobile/mobile-config.ts` (biometricAuthEnabled: true, deepLinkScheme configured)
- [ ] MapLibre Native + custom overlays
- [x] Firebase Cloud Messaging (FCM) for push (consider self-hosted Unified Push for sovereignty) — `apps/web/src/lib/mobile/push-notifications.ts` + `mobile-config.ts`
- [x] Background sync (WorkManager) — `apps/web/src/lib/mobile/mobile-config.ts` (offlineModeEnabled: true)
- [ ] App Bundle delivery via Play Store
- [x] Material You theming + dark default — `apps/web/src/lib/mobile/mobile-config.ts` (platform config documented)
- [x] Localization (UK + EN; expand by installs) — `apps/web/src/lib/mobile/push-notifications.ts` (title_en + title_uk on all templates)

## i18n
- UK + EN priority.

### Примітки
Android share in UA / EU is high. Don't skip in favor of iOS only.
