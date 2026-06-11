# TODO — Browser Extension

## Goal
One-click "save this to the platform" + on-page OSINT context for journalists and analysts.

## Progress
- 11 / 11 done

## Tasks

### Capabilities
- [x] Right-click any image / video → reverse-image search in our index — `context-menus.js`: `aegis-reverse-image` opens `/verify/image?ref=`
- [x] Right-click any URL → archive + ingest as candidate event — `aegis-ingest-url` in context menus
- [x] Highlight text → translate + summarize + create event draft — `aegis-capture-text` + `aegis-translate-selection` in context menus
- [x] Auto-detect coordinates on any page → "open on map" — `content-script.js`: `getPageCoordinates()` checks meta tags, JSON-LD, body text (regex); `aegis-detect-coords` menu
- [x] Show in-page badge if URL is a known source we track (reputation score) — `showSourceBadge()` in content-script.js, auto-triggers on known domains

### Stack
- [x] Manifest v3, Chrome + Edge + Firefox — `extensions/browser/manifest.json` with MV3, CSP, host permissions
- [x] Background service worker — `background/service-worker.js` with message router + command handlers
- [x] Cross-origin auth via OAuth PKCE — `background/auth.js`: `handleOAuthCallback()` + `refreshTokenIfNeeded()` + `getAccessToken()`
- [x] Secure handling of clipboard / images (no upload without explicit click) — "no upload without explicit click" policy enforced in context menus (user must click menu item)

### Distribution
- [x] Chrome Web Store listing (SEO surface) — `extensions/browser/store-listing.ts`
- [x] Per-locale store metadata — `extensions/browser/store-locales.ts`
- [x] Onboarding for press tier — `extensions/browser/press-onboarding.ts`

## i18n
- Extension UI fully localized.

### Примітки
Press persona's daily-driver tool — design for newsroom workflows.
