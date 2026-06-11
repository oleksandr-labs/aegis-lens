# TODO — Cognitive Accessibility

## Goal
Plain language, predictable patterns, manageable cognitive load — especially for civilians under stress.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.54)

## Tasks
- [x] Plain-language policy (8th-grade reading level for civilian surfaces) → [docs/a11y/accessibility.md §2.1](../../docs/a11y/accessibility.md)
- [x] Consistent layouts + iconography → [docs/a11y/accessibility.md §2.2](../../docs/a11y/accessibility.md)
- [x] Predictable interactions (no surprise modals) → [docs/a11y/accessibility.md §2.3](../../docs/a11y/accessibility.md)
- [x] Stress-tolerant flows (clear, single-task screens during alerts) → [docs/a11y/accessibility.md §2.4](../../docs/a11y/accessibility.md)
- [x] Undo where possible; confirm where destructive → [docs/a11y/accessibility.md §2.5](../../docs/a11y/accessibility.md)
- [x] No timeouts on critical actions → [docs/a11y/accessibility.md §2.6](../../docs/a11y/accessibility.md)
- [x] Animation budget for cognitive-load-heavy surfaces (low) → [docs/a11y/accessibility.md §2.7](../../docs/a11y/accessibility.md)
- [x] User testing with diverse cognitive profiles → [docs/a11y/accessibility.md §2.8](../../docs/a11y/accessibility.md)

### Done notes (2026-05-30)
Full cognitive accessibility policy in `docs/a11y/accessibility.md §Part 2`. Plain-language policy: Flesch-Kincaid Grade ≤ 8 for civilian surfaces (Hemingway Editor + readability npm), professional surfaces 10th–12th grade acceptable. Consistent layouts: 4 navigation rules (same position/order/labels) + iconography rules (text label on all interactive icons, same icon = same meaning, Lucide Icons). Predictable interactions: 5 rules (no auto-open modals, new-tab warnings, form feedback, keyboard cheat sheet, hover-triggered tooltips). Stress-tolerant alert flows: 1 task per screen, ≤ 80 words, shape+color+text status, ≥ 48px targets, Ukrainian primary, civilian user test required. Undo/confirm table: 6 actions with required behaviors (soft-delete 30-day recovery, API key no recovery). No-timeout rules: 6 specific flows. Animation budget: ambient animations reduced on workspace, page transitions ≤ 200ms, entrance-only chart animations, "Reduce animations" server-side preference. User testing: 4 participant profiles, think-aloud protocol, severity classification (blocking/frustrating/minor).

## i18n
- Plain-language standard per locale (Hemingway-equivalent).

### Примітки
Civilian persona may use this under air-raid stress. Design for that.
