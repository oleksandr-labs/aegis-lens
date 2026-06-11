# TODO — Screen Reader Support

## Goal
Every flow works with NVDA, JAWS, VoiceOver, TalkBack.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.54)

## Tasks
- [x] ARIA patterns audit for all custom widgets → [docs/a11y/accessibility.md §3.1](../../docs/a11y/accessibility.md) — 8-widget ARIA patterns table (map marker, layer toggle, filter combobox, confidence badge, severity indicator, alert rule builder, data table)
- [x] Live regions for real-time event arrivals (with politeness levels) — `apps/web/src/lib/a11y-announcer.ts`: polite + assertive regions, `announceEventBatch()` (count-batched to avoid flooding), debounced polite queue
- [x] Map workspace: tabular alternative + ARIA navigation → [docs/a11y/accessibility.md §3.2](../../docs/a11y/accessibility.md) — toggle via "Switch to table view" button + keyboard `T`; grid pattern; Enter opens detail panel; returns focus to last selected marker; default for SR users
- [x] Filter sidebar: combobox / listbox / treegrid patterns → [docs/a11y/accessibility.md §3.3](../../docs/a11y/accessibility.md) — ARIA combobox pattern with code example; ↑↓ navigate, Enter select, Escape close; multi-select uses `role="group"` + `role="checkbox"`
- [x] Charts: data-table fallback or accessible description → [docs/a11y/accessibility.md §7](../../docs/a11y/accessibility.md) — `role="img"` + `aria-label`; sr-only `<table>` fallback; keyboard navigation; screen reader fallback table shown as "View as table" toggle
- [x] Dialogs: focus trap + return focus → [docs/a11y/accessibility.md §3.4](../../docs/a11y/accessibility.md) — `inert` attribute on `<main>` while dialog open; focus returns to trigger on close; never destroy trigger element while dialog open
- [x] Toasts announced (polite) — critical announced (assertive) — `announceToast()` routes error/critical → assertive, info/success → polite
- [x] Per-screen-reader test matrix in QA → [docs/a11y/accessibility.md §1.3](../../docs/a11y/accessibility.md) — NVDA/JAWS/VoiceOver/TalkBack × browser matrix; test script format; results logged in `manual-audit-log.md`

### Done notes (2026-05-30)
All 6 remaining doc-type tasks spec'd in `docs/a11y/accessibility.md §Part 3`. ARIA patterns table for 8 custom widgets. Map tabular alternative: toggle button + keyboard `T`, grid pattern, keyboard navigation, SR-default. Filter combobox: full ARIA combobox code pattern. Charts: `role="img"` + sr-only table fallback + "View as table" toggle. Dialog: `inert` attribute on `<main>` while open, return focus on close. SR test matrix: 4 screen readers × browser combinations with test script template.

## i18n
- Lang attribute correct so SR pronounces locale text right.

### Примітки
Live regions over-announcing = WORSE than under. Tune politeness.
