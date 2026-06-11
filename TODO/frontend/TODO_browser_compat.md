# TODO — Browser Compatibility

## Goal
Modern evergreen support without sacrificing UX for tail users.

## Progress
- 8 / 8 done

## Tasks
- [x] Target Baseline 2024 (Chrome / Edge / Safari / Firefox last 2 versions) → [browser-compat.md §1](../../docs/frontend/browser-compat.md)
- [x] No IE; minimal effort for old WebView versions → §2 (upgrade prompt via feature detection)
- [x] BrowserStack / Playwright cross-browser CI → §3 (Playwright: Chrome+Firefox+WebKit per PR; BrowserStack: iOS/Android weekly; Chromatic visual regression)
- [x] Polyfills only when needed (use `core-js` selectively) → §4 (useBuiltIns: 'usage'; each polyfill documented)
- [x] Feature detection (no UA sniffing) → §5 (typeof / 'feature' in object / CSS.supports(); WebGL2 example)
- [x] Reduced-experience mode for non-WebGL devices → §6 (static Mapbox tile fallback; banner; route-level hook)
- [x] Mobile Safari quirks audit → §7 (known issues table; audited after every major Safari release)
- [x] PWA install behavior tested per major browser → §8 (Chrome/Android/iOS Safari/Firefox/Edge matrix)

## i18n
- Test Cyrillic + diacritics rendering per browser/OS.

### Примітки
Map workspace requires WebGL2. Gate gracefully on missing.

### Done notes (2026-05-30)
[docs/frontend/browser-compat.md](../../docs/frontend/browser-compat.md). Cyrillic/diacritics
rendering explicitly tested in BrowserStack (UA/PL/DE/AR). PWA install non-appearance in
Firefox is expected, not a bug.
