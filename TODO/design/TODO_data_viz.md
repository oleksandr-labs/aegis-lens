# TODO — Data Visualization Design

## Goal
Visualizations that make complex intelligence *legible at a glance* — beautiful, but always information-first.

## Progress
- 14 / 14 done ✅ COMPLETE (Sprint 2.53)

## Tasks

### Chart library
- [x] Pick base (Visx / Recharts / D3 + custom) — favor D3 + thin React layer for control → [docs/design/data-viz.md §2](../../docs/design/data-viz.md) — **D3 + thin React wrapper chosen**
- [x] Token-driven theming → [docs/design/data-viz.md §3](../../docs/design/data-viz.md)
- [x] Responsive + a11y from day one → [docs/design/data-viz.md §7](../../docs/design/data-viz.md) + §8

### Chart types
- [x] Time series (events/hour by class) → [docs/design/data-viz.md §4.1](../../docs/design/data-viz.md)
- [x] Stacked area (event class composition over time) → [docs/design/data-viz.md §4.2](../../docs/design/data-viz.md)
- [x] Heatmap (region × event-class intensity) → [docs/design/data-viz.md §4.3](../../docs/design/data-viz.md)
- [x] Sankey (source → topic flow) → [docs/design/data-viz.md §4.4](../../docs/design/data-viz.md)
- [x] Sparklines (inline in tables) ✓ Sprint 1 → [docs/design/data-viz.md §4.5](../../docs/design/data-viz.md)
- [x] Radar (region risk profile) → [docs/design/data-viz.md §4.6](../../docs/design/data-viz.md)
- [x] Choropleth (region severity index) → [docs/design/data-viz.md §4.7](../../docs/design/data-viz.md)
- [x] Connection arcs (cross-region links) → [docs/design/data-viz.md §4.8](../../docs/design/data-viz.md)

### Map visualizations
- [x] Pulsing event markers → [docs/design/data-viz.md §5.1](../../docs/design/data-viz.md)
- [x] Decay heatmaps (events fade over time) → [docs/design/data-viz.md §5.2](../../docs/design/data-viz.md)
- [x] 3D extrusions for damage intensity → [docs/design/data-viz.md §5.3](../../docs/design/data-viz.md)
- [x] Animated trajectory arcs (drones, missiles) → [docs/design/data-viz.md §5.4](../../docs/design/data-viz.md)

### Principles
- [x] Colorblind-safe everywhere (test with simulators in CI) → [docs/design/data-viz.md §6.1](../../docs/design/data-viz.md)
- [x] Confidence visualization (opacity / hatching, never just color) → [docs/design/data-viz.md §6.2](../../docs/design/data-viz.md)
- [x] No 3D pie charts, no chartjunk → [docs/design/data-viz.md §6.3](../../docs/design/data-viz.md)
- [x] Sources / "as of" timestamp on every chart → [docs/design/data-viz.md §6.4](../../docs/design/data-viz.md)
- [x] Export each viz as PNG / SVG / data CSV → [docs/design/data-viz.md §6.5](../../docs/design/data-viz.md)

### Done notes (2026-05-30)
Full data visualization spec in `docs/design/data-viz.md`. Library decision: D3 + thin React wrapper (pure JSX SVG, no useEffect DOM manipulation). Token system with CHART_TOKENS covering colors per event class, neutral palette, confidence opacity, typography. 8 chart types spec'd (time series with missing-data treatment, stacked area with 100% normalization option, heatmap, Sankey with d3-sankey, sparklines, radar 6-8 axes, choropleth 26 UA oblasts, connection arcs). 4 map visualization specs (pulsing markers, decay heatmap, 3D fill-extrusion toggle, trajectory arc with privacy constraint). 5 design principles (Coblis CI, colorblind-safe, no chartjunk prohibited list, source/timestamp footer requirement, 3-format export with filename convention). A11y: role=img, keyboard navigation, sr-only table fallback. Responsive breakpoints: desktop/tablet/mobile with fallback table on mobile for complex types.

## i18n
- Number / date formats locale-aware; chart titles + axis labels translated.

### Примітки
Reference: FT graphics team, Reuters Graphics, Edward Tufte. NOT consumer-SaaS analytics dashboards.
