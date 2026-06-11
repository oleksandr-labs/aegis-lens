# TODO — Accessibility (a11y)

## Goal
WCAG 2.2 AA across all public surfaces; AAA where reasonable. A11y is also SEO.

## Progress
- 14 / 14 done

## Tasks
- [x] WCAG 2.2 AA audit baseline — apps/web/src/lib/a11y/audit-baseline.ts
- [x] Keyboard nav for every interactive element (incl. map workspace) — apps/web/src/lib/a11y/keyboard-nav.ts
- [x] Screen-reader labels on every icon-only button — apps/web/src/lib/a11y/aria-patterns.ts
- [x] ARIA patterns for menus, dialogs, comboboxes, listboxes — apps/web/src/lib/a11y/aria-patterns.ts
- [x] Focus management on route + modal transitions — apps/web/src/lib/a11y/keyboard-nav.ts
- [x] Skip-to-content links — apps/web/src/lib/a11y/keyboard-nav.ts
- [x] Color contrast 4.5:1 text / 3:1 large (verified in CI) — apps/web/src/lib/a11y/color-contrast.ts
- [x] Non-color cues for status (icon + label, not just hue) — apps/web/src/lib/a11y/audit-baseline.ts
- [x] Reduced-motion alternative styles — apps/web/src/lib/marketing/lcp-optimization.ts
- [x] Caption + transcript for every video — apps/web/src/lib/a11y/audit-baseline.ts
- [x] Alt text policy for images (auto + manual) — apps/web/src/lib/a11y/alt-text-policy.ts
- [x] Map a11y: tabular fallback view of current map state — apps/web/src/lib/a11y/map-a11y.ts
- [x] Form errors: associated, programmatically announced — apps/web/src/lib/a11y/form-errors.ts
- [x] axe-core in CI; failing builds on serious violations — apps/web/src/lib/a11y/axe-ci-config.ts

## i18n
- Lang attribute correct per locale; screen reader pronunciation tested for UK content.

### Примітки
A11y is non-negotiable for gov procurement (Section 508 / EN 301 549).
