# TODO — Map Style Guide

## Goal
A bespoke, defensible map style — instantly recognizable, optimized for our data layers, multilingual labels.

## Progress
- 12 / 12 done ✅ COMPLETE (Sprint 2.53)

## Tasks

### Base styles
- [x] Dark tactical (default) — deep navy, desaturated greens, high-contrast roads → [docs/design/map-style-guide.md §1.1](../../docs/design/map-style-guide.md)
- [x] Light tactical (daylight outdoor field use) → [docs/design/map-style-guide.md §1.2](../../docs/design/map-style-guide.md)
- [x] Satellite-blend (raster + vector hybrid) → [docs/design/map-style-guide.md §1.3](../../docs/design/map-style-guide.md)
- [x] Print / report style (paper-friendly, grayscale-safe) → [docs/design/map-style-guide.md §1.4](../../docs/design/map-style-guide.md)

### Style spec
- [x] Label hierarchy (country → admin1 → city → road) → [docs/design/map-style-guide.md §2.1](../../docs/design/map-style-guide.md)
- [x] Bilingual label rules (EN + local-language stacked) → [docs/design/map-style-guide.md §2.3](../../docs/design/map-style-guide.md)
- [x] Reduced label density at low zoom → [docs/design/map-style-guide.md §2.2](../../docs/design/map-style-guide.md)
- [x] Disputed-territory display policy → [docs/design/map-style-guide.md §2.4](../../docs/design/map-style-guide.md)
- [x] Colorblind-safe terrain palette → [docs/design/map-style-guide.md §4](../../docs/design/map-style-guide.md)

### Layer styling defaults
- [x] Per-layer hue + stroke + glow rules → [docs/design/map-style-guide.md §3.1](../../docs/design/map-style-guide.md)
- [x] Confidence visualization rule (opacity / dashed) → [docs/design/map-style-guide.md §3.2](../../docs/design/map-style-guide.md)
- [x] Severity visualization rule (size / glow intensity) → [docs/design/map-style-guide.md §3.3](../../docs/design/map-style-guide.md)
- [x] Decay over time (fade after N hours) → [docs/design/map-style-guide.md §3.4](../../docs/design/map-style-guide.md)

### Done notes (2026-05-30)
Full map style guide in `docs/design/map-style-guide.md`. 4 base styles spec'd (Dark Tactical / Light Tactical / Satellite Blend / Print) with exact hex color values. Zoom-based label reveal table (zoom 0–15+), bilingual label implementation with Mapbox `format` expression (EN primary + local language 75% size), disputed territory policy (Ukrainian administrative names, dashed boundaries, footer disclaimer). 18-layer hue/stroke/glow table. Confidence via opacity+dashes (4 tiers). Severity via size+glow+animation (5 tiers). Decay table (0–2h → 72h+). Implementation notes: style.json version-controlled in `packages/map-style/`, percy visual regression, Coblis colorblind CI check.

## i18n
- Bilingual labels everywhere; CJK preparedness for future locales.

### Примітки
A unique map style is brand. People should recognize a screenshot of our map in the wild.
