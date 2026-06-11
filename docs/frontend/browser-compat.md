# Browser Compatibility

> Modern evergreen support without sacrificing UX for tail users.
> **The map workspace requires WebGL2 — gate gracefully when it's missing.**

## 1. Target baseline

We support **Baseline 2024** (the set of features available in all major
evergreen browsers as of 2024):

| Browser | Versions supported | Notes |
| --- | --- | --- |
| **Chrome / Edge** | Last 2 stable | Primary; WebGL2 + WebTransport + all Baseline APIs |
| **Firefox** | Last 2 stable | Full support; verify WebGL2 performance on Linux |
| **Safari** | Last 2 stable | Highest friction; see §7 for known quirks |
| **Mobile Chrome** (Android) | Last 2 | Key for field use (humanitarian) |
| **Mobile Safari** (iOS) | Last 2 iOS versions | Strict WKWebView limits; see §7 |
| **IE / legacy Edge** | **Not supported** | Zero effort; polyfills not added |
| **Old WebView / in-app browsers** | Minimal effort | Show upgrade prompt; no feature-parity commitment |

**Rule:** if a feature requires a polyfill to support a browser outside this
matrix, it ships without the polyfill and degrades gracefully (§6).

## 2. No IE; minimal WebView

- No IE-targeting code (`var`, `function()` declarations, `XMLHttpRequest`,
  `-ms-` prefixes). ESLint rule enforces no IE-only APIs.
- Old in-app browsers (WeChat, some gov apps): we show a "please open in Chrome
  or Safari" banner via feature detection. No regressions chased here.

## 3. Cross-browser CI (Playwright + BrowserStack)

- **Playwright** runs the full E2E suite on **Chrome, Firefox, and WebKit**
  (Safari engine) on every PR via GitHub Actions.
- **BrowserStack** runs a weekly scheduled job on:
  - Real iOS Safari (last 2 iOS versions), real Android Chrome.
  - Edge (latest) as a sanity check beyond WebKit.
- Any cross-browser failure in Playwright blocks the PR. BrowserStack failures
  create a tracked issue (not a block, to avoid flaky-test burnout).
- Visual regression: **Chromatic** runs component-level diffs across Chrome and
  Safari to catch rendering differences.

## 4. Polyfills — selective use only

- **No blanket `core-js/stable`**. This would balloon bundle size for modern
  browsers that need nothing.
- Polyfills are added individually when:
  1. A specific API is needed.
  2. The target browser in the matrix doesn't support it.
  3. There's no graceful degradation alternative.
- Use `@babel/preset-env` with `useBuiltIns: 'usage'` + the browserslist matrix
  above to auto-include only what's actually needed.
- Each polyfill is documented (which API, which browser, bundle-size impact).

## 5. Feature detection (not UA sniffing)

- **Never use `navigator.userAgent` to branch behavior.** UA strings are
  unreliable, spoofed, and break on new versions.
- Use `typeof`, `'feature' in object`, or the `CSS.supports()` API.
- WebGL2 detection example:
  ```ts
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  const hasWebGL2 = gl !== null;
  ```

## 6. Reduced-experience mode (non-WebGL2 devices)

When WebGL2 is unavailable (older GPU drivers, some cloud/virtual browsers):
- Show a **static map fallback** (server-rendered tile image via Mapbox Static
  Tiles API) instead of the interactive deck.gl workspace.
- The data table / event list view remains fully functional.
- A banner informs the user: "For the full interactive map, use Chrome, Firefox,
  or Safari on a modern device."
- This is gated at the route level with a `useWebGL2()` hook; never silently
  broken.

## 7. Mobile Safari quirks audit

Known issues tracked and tested on every release:

| Issue | Status | Mitigation |
| --- | --- | --- |
| **`position: sticky` + `overflow: hidden` on parent** | Active quirk | Avoid the combination; use `overflow: clip` |
| **WebGL context loss on backgrounding** | Known | Handle `webglcontextlost` event; restore on `webglcontextrestored` |
| **`100vh` includes browser chrome on iOS** | Known | Use `dvh` units (Baseline 2024 supported) or JS `window.innerHeight` |
| **WKWebView limits for in-app browsers** | Won't fix | Upgrade prompt (§2) |
| **Passive event listeners required for scroll** | Resolved | Enforced via ESLint `no-non-passive-event-listener` |
| **IndexedDB quota under storage pressure** | Watch | Graceful quota-exceeded handling; data re-fetches from server |

Safari quirks are audited after every major Safari release and after every iOS
major update.

## 8. PWA install behavior

The workspace ships as a **Progressive Web App** (manifest + service worker for
offline shell). Install behavior is tested per browser:

| Browser | Install method | Test |
| --- | --- | --- |
| Chrome (desktop) | Address-bar chip / menu | Playwright: check `beforeinstallprompt` fired |
| Chrome (Android) | Bottom sheet prompt | BrowserStack real device |
| Safari (iOS) | Add to Home Screen (manual) | BrowserStack: verify manifest icons + splash |
| Firefox | No native install prompt | Verify app functions; suppress missing-prompt errors |
| Edge | Address-bar chip | Same as Chrome |

PWA install must not break in any supported browser; it simply doesn't appear in
Firefox (that's expected, not a bug).

## i18n

Cyrillic + Latin + diacritics rendering is explicitly tested per browser/OS in
BrowserStack (UA, PL, DE, AR glyph sets). Any font fallback gap is a P2 bug.
