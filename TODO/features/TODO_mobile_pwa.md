# TODO — Mobile & PWA

## Goal
Mobile-first PWA for civilian + field-team use cases. Native apps deferred.

## Progress
- 8 / 13 done (Sprint 2.59 — app shortcuts, bottom-sheet inspector, one-thumb controls, mobile layer browser)

## Tasks

### PWA
- [x] Installable PWA with offline shell — `apps/web/public/manifest.json` (full PWA manifest with icons, shortcuts, share_target)
- [x] Service worker: tile cache, last-known events, offline read — `apps/web/public/sw.js` (shell/tile/api strategies + offline fallback)
- [x] Web push notifications (with consent flow) — push handler in sw.js (notification display + click routing)
- [x] Background sync for field reports — `sync` event handler in sw.js (posts message to open clients)
- [x] App shortcut actions ✓ Sprint 2.59 — PWA manifest shortcuts (Map/Alerts/Dashboard/Investigations)

### Mobile UX
- [x] Bottom-sheet event inspector ✓ Sprint 2.59 — BottomSheet + MobileEventInspector (touch drag)
- [x] One-thumb map controls ✓ Sprint 2.59 — MobileMapControls (48px FABs bottom-right)
- [x] Simplified mobile layer browser ✓ Sprint 2.59 — MobileLayerBrowser (scrollable chips + sheet)
- [ ] Voice search input
- [ ] Haptics on critical alerts

### Offline scenarios
- [ ] Low-bandwidth mode (text-only, no media)
- [ ] Resilient against intermittent connectivity
- [ ] Battery-aware update cadence

### Native apps (Phase 3+)
- [ ] iOS native (SwiftUI) — primarily for richer notifications + Live Activities
- [ ] Android native (Kotlin) — same
- [ ] Decide framework: React Native vs native swiftui/kotlin (lean native for perf)

## i18n
- PWA respects device locale.

### Примітки
Field-team users (NGO/journalist on the ground) are the killer mobile case. Design for them, not for casual scrollers.
