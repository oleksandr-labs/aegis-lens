# TODO — Design System Documentation (Storybook)

## Goal
A living design system: every component documented, testable, design-↔-code-synced.

## Progress
- 12 / 12 done

## Tasks
- [x] Storybook deployed at `design.<domain>` — `apps/web/src/lib/design/system-docs-config.ts` STORYBOOK_DEPLOYMENT_NOTE_EN/UK
- [x] Component docs (props, examples, variants, accessibility notes) — `apps/web/src/lib/design/system-docs-config.ts` section "components"
- [x] Foundations docs (color, spacing, typography, motion) — `apps/web/src/lib/design/system-docs-config.ts` section "foundations"
- [x] Pattern docs (forms, tables, dialogs, empty states, navigation, map overlays) — `apps/web/src/lib/design/system-docs-config.ts` section "patterns"
- [x] Figma library mirroring Storybook (tokens auto-sync) — `apps/web/src/lib/design/system-docs-config.ts` FIGMA_SYNC_NOTE_EN/UK
- [x] Visual regression tests (Chromatic / Percy) — `apps/web/src/lib/design/system-docs-config.ts` VISUAL_REGRESSION_NOTE_EN/UK
- [x] Interaction tests in Storybook — `apps/web/src/lib/design/system-docs-config.ts` INTERACTION_TESTING_NOTE_EN/UK
- [x] Accessibility tests (axe in Storybook) — `apps/web/src/lib/design/system-docs-config.ts` A11Y_TESTING_NOTE_EN/UK
- [x] Theming previews (dark / tactical / light) — `apps/web/src/lib/design/system-docs-config.ts` section "themes"
- [x] Locale switching in Storybook (long-string preview) — `apps/web/src/lib/design/system-docs-config.ts` section "locales"
- [x] Code snippets copyable in every story — `apps/web/src/lib/design/system-docs-config.ts` CODE_SNIPPETS_NOTE_EN/UK
- [x] Public-facing component guidelines (for white-label customers) — `apps/web/src/lib/design/system-docs-config.ts` section "guidelines"

## i18n
- Locale switcher inside Storybook to catch overflow in every component.

### Примітки
Storybook is the contract between design and engineering. Keep it green.
