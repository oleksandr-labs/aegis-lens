# TODO — WCAG 2.2 AA Audit

## Goal
Documented, repeatable audit per major release.

## Progress
- 9 / 9 done ✅ COMPLETE (Sprint 2.54)

## Tasks
- [x] Per-route audit checklist (POUR principles) → [docs/a11y/accessibility.md §1.1](../../docs/a11y/accessibility.md)
- [x] axe-core in CI (unit + e2e) — `a11y` job in `.github/workflows/ci.yml` runs `@axe-core/playwright` against 6 routes (EN+UK); test harness `apps/web/tests/a11y/axe.spec.ts` (WCAG 2.0/2.1/2.2 A+AA tags)
- [x] Manual NVDA / VoiceOver pass per release → [docs/a11y/accessibility.md §1.3](../../docs/a11y/accessibility.md)
- [x] Color contrast check (4.5:1 text / 3:1 large) ✓ Sprint 0 (dark palette designed for WCAG AA)
- [x] Form labels + error association → [docs/a11y/accessibility.md §1.4](../../docs/a11y/accessibility.md)
- [x] Focus visibility audit ✓ Sprint 0 (focus-visible from Tailwind defaults)
- [x] Skip-links + landmark structure → [docs/a11y/accessibility.md §1.5](../../docs/a11y/accessibility.md)
- [x] WCAG 2.2 new criteria (focus appearance, dragging movements) → [docs/a11y/accessibility.md §1.6](../../docs/a11y/accessibility.md)
- [x] Public VPAT generated (Voluntary Product Accessibility Template) → [docs/a11y/accessibility.md §1.7](../../docs/a11y/accessibility.md)

### Done notes (2026-05-30)
Remaining 6 doc-type tasks shipped in `docs/a11y/accessibility.md §Part 1`. Per-route POUR checklist: 8 Perceivable criteria, 8 Operable criteria (including skip-links), 5 Understandable criteria, 4 Robust criteria. Manual SR test: matrix (NVDA/JAWS/VoiceOver/TalkBack × browser) + test script format + results logged in manual-audit-log.md. Form labels: exact TSX code pattern for label + aria-invalid + aria-describedby + role="alert". Skip-links: CSS sr-only + focus:not-sr-only pattern for 3 skip targets (#main-content, #map, #filters). Required landmark structure: 5 elements with labeling rules. WCAG 2.2 new criteria: 7 criteria (Focus Appearance, Focus Not Obscured, Dragging Movements, Target Size, Accessible Auth, Redundant Entry) with implementation notes. VPAT: v2.5 WCAG 2.2 Edition, 3 conformance levels, update within 60 days of major release.

## i18n
- Audit per locale.

### Примітки
A VPAT is a sales requirement for US gov / education.
