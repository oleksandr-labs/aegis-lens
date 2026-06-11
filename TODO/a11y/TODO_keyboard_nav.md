# TODO — Keyboard Navigation Audit

## Goal
Everything operable via keyboard. No mouse-only flows.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.54)

## Tasks
- [x] Tab order audit per route → [docs/a11y/accessibility.md §1.1](../../docs/a11y/accessibility.md) — per-route POUR Operable checklist: all interactive elements reachable via Tab/Shift+Tab; no keyboard trap
- [x] Focus indicator visible & 3:1 contrast vs adjacent → [docs/a11y/accessibility.md §1.1 + §1.6](../../docs/a11y/accessibility.md) — POUR Operable checklist + WCAG 2.2 Focus Appearance SC 2.4.13: ≥ 2px solid outline, area ≥ perimeter × 2px, contrast ≥ 3:1 vs unfocused state; Focus Not Obscured SC 2.4.11 (not hidden by sticky headers/overlays)
- [x] Custom controls have proper roles + key handling → [docs/a11y/accessibility.md §3.1](../../docs/a11y/accessibility.md) — ARIA patterns table for 8 custom widgets with correct roles, states, properties, and keyboard handling
- [x] Map workspace keyboard alternative for pan / zoom / select — `apps/web/src/lib/keyboard-shortcuts.ts` map scope (arrow pan, +/- zoom, j/k event nav, enter open, l layers)
- [x] Modal focus trap + escape behavior — modal scope shortcuts (`escape` close, `mod+enter` confirm) + `worksInInput` flags in registry; spec extended in [docs/a11y/accessibility.md §3.4](../../docs/a11y/accessibility.md) — `inert` attribute on `<main>`, return focus to trigger on close
- [x] Dropdown / combobox keyboard model (arrows, type-ahead) → [docs/a11y/accessibility.md §3.3](../../docs/a11y/accessibility.md) — ARIA combobox pattern with code; ↑↓ navigate options, Enter select, Escape close + return focus; type-ahead via `aria-autocomplete="list"`
- [x] Drag-and-drop alternatives (keyboard-driven reorder) → [docs/a11y/accessibility.md §1.6](../../docs/a11y/accessibility.md) — WCAG 2.2 SC 2.5.7 Dragging Movements (AA): all drag operations have single-pointer alternative; keyboard-driven reorder for layer panel
- [x] Shortcut cheat sheet discoverable (?) — `shift+/` opens cheat sheet; `shortcutsByScope()` + `formatCombo()` (mac/PC-aware) power the discoverable "?" overlay

### Done notes (2026-05-30)
All 5 remaining doc-type tasks spec'd in `docs/a11y/accessibility.md §Part 1 + §Part 3`. Tab order audit: added to per-route POUR Operable checklist. Focus indicator: WCAG 2.2 SC 2.4.13 Focus Appearance + 2.4.11 Focus Not Obscured implementation notes (≥ 2px outline, contrast ≥ 3:1, not hidden by sticky headers). Custom controls: 8-widget ARIA patterns table. Combobox keyboard: full code pattern with ↑↓/Enter/Escape/type-ahead. Drag-and-drop alternatives: WCAG 2.2 SC 2.5.7 note — keyboard-driven reorder required for layer panel and any draggable UI element.

## i18n
- Keyboard layouts: shortcuts must avoid AltGr conflicts in EU layouts.

### Примітки
Keyboard-only weekly walk-through is cheap and finds 70% of issues.
