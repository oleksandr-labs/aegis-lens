# Data Visualization Design

> **Status:** v1.0 — design specification. Review semi-annually.
> **References:** FT Graphics team, Reuters Graphics, Edward Tufte's *The Visual Display of Quantitative Information*.
> **Not:** consumer-SaaS analytics dashboards. Intelligence-grade information displays.

---

## 1. Philosophy

Every visualization answers one question. If it answers none, it shouldn't exist. If it answers three, split it.

**Information density > decoration.** We do not add visual elements that don't encode data. No gradients on bars. No 3D. No chartjunk.

**Trust is built through honesty.** Every chart shows:
1. What the data represents.
2. Where it came from.
3. When it was last updated.
4. What we don't know (missing data, low confidence).

---

## 2. Chart Library Selection

**Chosen: D3 + thin React wrapper layer**

| Option | Pros | Cons | Decision |
|---|---|---|---|
| D3 + custom React | Full control; any chart type; SSR-compatible; no vendor lock-in | Higher implementation cost | **CHOSEN** |
| Visx (Airbnb) | D3 under the hood; React-native; good a11y primitives | Less mature; fewer examples | Reserve as secondary |
| Recharts | Fastest to ship; good defaults | Limited customization; animation-heavy defaults conflict with our needs | Use only for quick internal dashboards |
| Observable Plot | Elegant API; concise; Observable ecosystem | Less React-native; newer | Evaluate for analyst notebook embeds |

**Implementation approach:**
- `packages/charts/` — shared chart library.
- Each chart type is a React component: `<TimeSeriesChart>`, `<HeatmapChart>`, `<StackedAreaChart>`, etc.
- D3 used for scales, axes, and layouts; React used for rendering (SVG via JSX).
- No `useEffect` + D3 DOM manipulation — pure React rendering of SVG elements.

---

## 3. Token-Driven Theming

All chart colors, fonts, spacing, and stroke widths are driven by design tokens — never hardcoded.

```ts
// packages/design-tokens/src/chart-tokens.ts
export const CHART_TOKENS = {
  // Color scales per event class
  colors: {
    drone:       "#ff6b35",
    missile:     "#e63946",
    fire:        "#ff9f1c",
    infra:       "#8338ec",
    power:       "#f7b731",
    comms:       "#20c997",
    troop:       "#4ecdc4",
    aviation:    "#00b4d8",
    maritime:    "#0077b6",
    civilian:    "#e63946",
    weather:     "#90e0ef",
  },
  // Neutral scale for axes, gridlines, labels
  neutral: {
    gridline:    "#1e2a38",
    axis:        "#2e3a4a",
    label:       "#5a7090",
    labelStrong: "#8aaac0",
  },
  // Confidence opacity scale
  confidence: {
    confirmed:   1.0,
    likely:      0.8,
    possible:    0.6,
    unverified:  0.4,
  },
  // Typography
  font: {
    family: '"DM Sans", "Noto Sans", sans-serif',
    mono:   '"DM Mono", monospace',
    sizeXs: "10px",
    sizeSm: "11px",
    sizeMd: "12px",
  },
} as const;
```

**Print theme** overrides: `CHART_TOKENS_PRINT` with high-contrast colors and no glow/opacity effects.

---

## 4. Chart Types

### 4.1 Time Series (events/hour by class)

**Purpose:** Show event frequency over time, colored by event class.

- **X axis:** Time (UTC). Tick marks at sensible intervals (hours, days, weeks depending on zoom).
- **Y axis:** Event count. Starts at 0, always. Never truncated Y axis.
- **Mark:** Line + area fill (area fill at 15% opacity for the class color — avoids clutter when multiple classes overlap).
- **Multi-class:** Each class gets its own line + area, stacked mode optional.
- **Brushing:** D3 brush for selecting a time range (updates the map filter).
- **Missing data:** Shown as a dashed segment + tooltip note "Data gap: source outage 14:00–18:00 UTC".

### 4.2 Stacked Area (event class composition over time)

**Purpose:** Show the composition of event types over time — what portion of each day was missiles vs. drones vs. fires.

- **Stacking:** D3 `stack()` with `stackOffsetNone` (zero baseline).
- **Normalization option:** "100% stacked" mode shows proportional composition.
- **Color:** Each class gets its token color.
- **Hover:** Tooltip shows all class values at the hovered timestamp.
- **Legend:** Horizontal strip below the chart; click to toggle a class.

### 4.3 Heatmap (region × event-class intensity)

**Purpose:** At a glance — which regions are hottest for which event types over a given period.

- **Rows:** Regions (oblasts or countries).
- **Columns:** Time buckets (days, weeks) or event classes (in a "region × class" variant).
- **Fill:** Color scale from the region's event intensity. Diverging scale not used (no negative events).
- **Sequential scale:** white → class hue (light → saturated), 7-stop.
- **Empty cells:** `#0d1117` — clearly different from low-intensity; tooltip clarifies "0 events".
- **Labels:** Region names (Ukrainian + English bilingual).

### 4.4 Sankey (source → topic flow)

**Purpose:** Show which sources contribute to which event classes — useful for editorial trust audits and OSINT methodology viz.

- **Nodes (left):** Source channels (Telegram, NASA FIRMS, etc.).
- **Nodes (right):** Event classes.
- **Links:** Flow volume proportional to contribution count.
- **Color:** Link inherits the source node's color fading to the target node's color.
- **Implementation:** `d3-sankey` plugin.
- **A11y:** SVG role="img" with a full text description of the flow in aria-label.

### 4.5 Sparklines (inline in tables)

Implemented in Sprint 1. Spec:
- Width: 80px, height: 24px.
- Line only, no axes, no labels.
- Color: context color (event class, or `#4a90e2` for generic metrics).
- Trend arrow (▲/▼) appended as text after the sparkline.

### 4.6 Radar (region risk profile)

**Purpose:** Multi-dimensional risk comparison for a single region (or comparing two regions).

- **Axes:** 6–8 risk dimensions (strike frequency, infrastructure damage, power outage rate, civilian displacement, air alert frequency, confidence-weighted severity index).
- **Fill:** Polygon fill at 20% opacity; stroke at 100%.
- **Multi-region:** 2–3 regions overlaid with distinct hues.
- **Legend:** Inline.
- **Normalization:** All axes normalized 0–1 against historical max (labeled in tooltip).

### 4.7 Choropleth (region severity index)

**Purpose:** Map-adjacent chart showing severity distribution by region without the geographic map.

- **Geography:** Ukraine oblasts (26 + Crimea with disputed styling).
- **Fill:** Sequential color scale (class token hue, 7 stops, lightest = min severity, darkest = max).
- **Tooltip:** Oblast name, current severity index, 7-day trend (▲/▼ with %), top event class.
- **Interaction:** Click → zooms to region on the main map.
- **A11y:** Pattern fills + data table below the chart for screen readers.

### 4.8 Connection Arcs (cross-region links)

**Purpose:** Show event propagation — e.g., a missile launched from region A struck region B, or a drone corridor from A through B to C.

- **Implementation:** D3 `d3-chord` or custom arc paths over an SVG map base.
- **Arc color:** Launch origin's class color.
- **Arc width:** Proportional to event count over the period.
- **Direction:** Arrow tip on the destination end.
- **Use case:** Missile trajectory analysis, supply route mapping (aggregated, never individual routes that could compromise OpSec).

---

## 5. Map Visualizations

### 5.1 Pulsing event markers

Already defined in `docs/design/map-style-guide.md §3.3`. Implemented via CSS `@keyframes pulse` on map markers, severity-driven pulse speed.

### 5.2 Decay heatmaps

Events fade over time — defined in `docs/design/map-style-guide.md §3.4`. Additional heatmap implementation:
- Mapbox `heatmap` layer type for high-density event clusters.
- Intensity driven by event count + recency weight.
- Heatmap radius increases at lower zoom levels.
- Color ramp: `#0d1a28` (cold, old) → `#e63946` (hot, recent).

### 5.3 3D extrusions for damage intensity

- Mapbox `fill-extrusion` layer on admin-1 regions.
- Extrusion height: proportional to cumulative damage score over the selected time window.
- Color: severity hue (from token).
- Performance: disable at zoom < 8 (too many polygons).
- Toggle: "3D view" button in map controls (off by default).

### 5.4 Animated trajectory arcs

- Source: missile / drone trajectory data from the events layer (when trajectory data is available — not all events have this).
- Implementation: Mapbox `LineLayer` with animated dasharray (gives the appearance of a moving dashed line).
- Direction: arrow head at terminal point using a symbol layer.
- Fade: trajectory fades 2h after the event.
- Color: drone = amber, missile = red.
- Privacy: trajectories shown only at the event-reporting resolution — not interpolated to precise flight paths (avoids targeting concerns).

---

## 6. Design Principles

### 6.1 Colorblind-safe everywhere

All color palettes tested with:
- **Deuteranopia** (red-green blindness, most common)
- **Protanopia** (red blindness)
- **Tritanopia** (blue-yellow blindness)

Tool: `Coblis` color-blindness simulator (CI step on every PR touching chart tokens).

**Rules:**
- Never use red + green as the only distinguishing pair.
- Always pair color with a second visual variable: shape, pattern, label, or position.
- Radar and choropleth use sequential (single-hue) scales — not diverging red-green.

### 6.2 Confidence visualization

Defined in `docs/design/map-style-guide.md §3.2`:
- Opacity encodes confidence (1.0 → confirmed, 0.4 → unverified).
- Dashed outlines for < 0.65 confidence.
- Never encode confidence via color alone.
- Tooltip always states confidence numerically ("Confidence: 78% — Likely verified").

### 6.3 No 3D pie charts, no chartjunk

Forbidden:
- 3D pie charts, 3D bars (except the intentional 3D extrusion map layer which is geographic, not quantitative).
- Unnecessary drop shadows on flat chart elements.
- Decorative gradients on bars or areas.
- Animated transitions that serve no data-encoding purpose.
- Background images behind charts.

Allowed:
- Functional animations (brushing, zoom, tooltip appear/disappear).
- Area fills at low opacity (data-encoding — shows volume).
- Confidence-encoding opacity.
- Pulse animations on live/critical markers (severity-encoding).

### 6.4 Sources and timestamp on every chart

Every chart includes a footer row:

```
Source: {source_list} | Last updated: {timestamp} UTC | Aegis Lens
```

- `source_list`: comma-separated, linked to `/sources/{slug}` (in digital; plain text in print).
- `timestamp`: ISO 8601 in metadata; human-readable in display ("Updated 3h ago" with exact time on hover).
- Static: never disappears on interaction (pinned below the chart, outside the interactive area).

### 6.5 Export each chart (PNG / SVG / CSV)

Every chart renders an "Export" button (overflow menu `⋯`) with three options:
- **PNG:** `<svg>` → `<canvas>` → `toDataURL()` → download. Minimum 2× resolution.
- **SVG:** Serialize the chart's `<svg>` element, add XML declaration, trigger download.
- **CSV:** The underlying data array, formatted as RFC 4180 CSV with headers. Timestamp column always in ISO 8601 UTC.

Export filenames: `aegis-{chart-type}-{region}-{date-range}.{ext}` (e.g., `aegis-timeseries-ukraine-2026-05-01-2026-05-30.csv`).

---

## 7. Accessibility (A11y)

- All SVG charts: `role="img"`, `aria-label` with a human-readable description of what the chart shows.
- Interactive charts: keyboard navigation — Tab to select data points, arrow keys to move between, Enter to trigger tooltip, Escape to dismiss.
- Color contrast: labels and tick text ≥ 4.5:1 on dark background (WCAG AA).
- Screen reader fallback: a `<table>` element with the chart data, visually hidden (`sr-only` class) but accessible. Shown as a "View as table" toggle for sighted keyboard users.
- No autoplay animations (respect `prefers-reduced-motion`).

---

## 8. Responsive Behavior

- **Desktop (≥ 1280px):** Full chart with all labels, legend, source footer.
- **Tablet (768–1279px):** Simplified axes (fewer tick marks); legend moved below chart.
- **Mobile (< 768px):** Simplified chart; complex types (Sankey, Radar) shown as a data table fallback with "View full chart on desktop" note.
- **Print:** `theme="print"` prop always applied (see §2 and `docs/design/print-pdf-styling.md §2.5`).
