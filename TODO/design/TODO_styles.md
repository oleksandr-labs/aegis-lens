# TODO — Styles & Design Tokens

## Goal
Token-based design system; single source of truth shared between Figma, Tailwind, and code.

## Progress
- 0 / 10 done

## Tasks
- [ ] Color tokens (semantic): bg.base / bg.elevated / surface / border / text / accent / danger / warning / success / info
- [ ] Map-layer color palette (colorblind-safe, deconflicted across 20+ layers)
- [ ] Confidence color scale (low → high)
- [ ] Danger / threat color scale
- [ ] Spacing, radius, shadow, z-index scales
- [ ] Typography tokens (size, weight, line-height, tracking)
- [ ] Motion tokens (durations, easings)
- [x] Theme: dark default, optional "tactical light" for daylight outdoor use ✓ Sprint 0
- [ ] Token export pipeline (Style Dictionary → Tailwind + CSS vars + Figma)
- [ ] Visual regression tests (Chromatic / Playwright)

## i18n
- Font stack must support Cyrillic glyphs (Inter / Geist do).

### Примітки
Lock the palette early — refactoring map colors later is painful.
