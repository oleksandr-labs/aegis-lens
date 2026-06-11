# Map Style Guide

> **Status:** v1.0 — design specification. Review with each major Mapbox GL JS upgrade.
> **Stack:** Mapbox GL JS + custom style JSON served from Mapbox Studio (or self-hosted `style.json`).

Aegis Lens's map style must be instantly recognizable. A screenshot of our map should be identifiable in the wild — not mistaken for LiveUAmap, Google Maps, or a default Mapbox template. Every style decision is made in service of information legibility, not aesthetics.

---

## 1. Base Styles

### 1.1 Dark Tactical (default)

The primary map experience. Designed for extended night-time operational use.

| Element | Value |
|---|---|
| Background | `#0d1117` (deep navy-black) |
| Land fill | `#151c26` (dark slate, barely lighter than background) |
| Water fill | `#0a1220` (near-black blue) |
| National boundary | `#2e3a4a` 1px dashed |
| Admin-1 boundary | `#1e2a38` 0.5px |
| Road (motorway) | `#1f2b3c` 1.5px |
| Road (primary) | `#192231` 1px |
| Road (secondary/local) | omitted below zoom 10 |
| Labels (country) | `#4a6080` 11–14px uppercase, letter-spacing 0.15em |
| Labels (city) | `#5a7090` 10–12px |
| Labels (road) | omitted by default; shown zoom ≥ 13 |

**Why:** Dark backgrounds maximize contrast for our event markers (high-visibility orange/amber/red). Muted roads and boundaries prevent visual competition with intelligence data.

### 1.2 Light Tactical (daylight / field use)

For users in bright ambient conditions or on low-contrast displays.

| Element | Value |
|---|---|
| Background | `#f0f2f5` |
| Land fill | `#e8eaed` |
| Water fill | `#c8d8e8` |
| National boundary | `#a0b0c0` 1px |
| Labels | `#2a3a4a` — same font, higher contrast |
| Road (motorway) | `#c0c8d0` 2px |

Layer markers retain the same hue scheme but at 15% lower saturation (avoid harsh contrast on light).

### 1.3 Satellite Blend (raster + vector hybrid)

For verification and geolocation tasks where terrain context matters.

- **Base raster:** Mapbox Satellite (`mapbox://mapbox.satellite`) at 100% opacity.
- **Vector overlay:** road network + boundaries + labels at 60% opacity on a dark tint fill.
- **Label treatment:** white with 1px dark stroke for readability over any terrain.
- **Default zoom range:** available at all zooms, but satellite tiles load at zoom ≥ 10 (lower zooms show vector-only with satellite texture hint).

### 1.4 Print / Report Style (grayscale-safe)

For static map exports embedded in PDF reports.

| Element | Value |
|---|---|
| Land | `#e8e8e8` |
| Water | `#b0c8e0` |
| Roads | `#c0c0c0` / `#d8d8d8` hierarchy |
| Borders | `#808080` 1px |
| Labels | `#1a1a1a` — high-contrast for print |
| Markers | Use shape + label instead of color alone (colorblind + B&W print safe) |

Export resolution: minimum 300 DPI for print; 144 DPI for screen reports.

---

## 2. Label Hierarchy

### 2.1 Zoom-based label reveal

| Zoom | Labels shown |
|---|---|
| 0–2 | Continents only |
| 3–4 | Countries |
| 5–6 | Capital cities, major admin-1 centers |
| 7–8 | Admin-1 labels (oblasts / voivodeships) |
| 9–10 | Cities (population > 100,000) |
| 11–12 | Cities (population > 10,000), town names |
| 13–14 | Neighborhoods, road names (motorway + primary) |
| 15+ | Full road network, POIs |

### 2.2 Label density reduction at low zoom

At zoom ≤ 6, apply aggressive label collision detection:
- Minimum label separation: 150px.
- Prioritize capital cities and admin-1 centers; drop all others.
- Country names use `text-field` with translation fallback: `["coalesce", ["get", "name_en"], ["get", "name"]]`.

### 2.3 Bilingual labels (EN + local language stacked)

At zoom ≥ 7, render stacked bilingual labels for all named places:

```json
"text-field": [
  "format",
  ["coalesce", ["get", "name_en"], ["get", "name"]], {"font-scale": 1.0},
  "\n", {},
  ["coalesce", ["get", "name_uk"], ["get", "name_local"], ""], {"font-scale": 0.75, "text-color": "#6a8099"}
]
```

The English name is primary (larger). The local-language name (Ukrainian by default in the UA context) is 75% size, lighter color, directly below.

Font stack: `"DM Sans", "Noto Sans Ukrainian", "Arial Unicode MS"`.

### 2.4 Disputed territory display policy

Disputed territories are displayed **without political assertion**:

- Crimea, Donetsk, Luhansk, Zaporizhzhia, Kherson oblasts (Russian-occupied areas): displayed with Ukrainian administrative naming + a `*` notation on the label.
- Boundary lines in disputed areas rendered as dashed `#6a8099` rather than solid.
- No "Republic of X" labeling for Russian-declared entities — these regions are labeled under Ukrainian administrative names only.
- A persistent disclaimer in the map footer: *"Map boundaries are for informational purposes and do not represent a political position."*
- Implement via a separate `disputed-boundaries` layer with its own paint rules, toggled independently from the base boundary layer.

---

## 3. Layer Styling Defaults

All event layers share a common color system. Data type (drone, missile, fire, etc.) determines **hue**; verification state and severity determine **visual weight**.

### 3.1 Per-layer hue + stroke + glow rules

| Layer | Marker hue | Stroke | Glow |
|---|---|---|---|
| Drone | `#ff6b35` (amber-orange) | 1px `#cc4400` | Soft 8px orange glow on dark style |
| Missile | `#e63946` (red) | 1px `#a0001c` | 12px red glow |
| Fire / thermal | `#ff9f1c` (fire amber) | 1px `#cc6600` | 16px warm glow, animated pulse |
| Infrastructure damage | `#8338ec` (violet) | 1px `#5200b8` | 6px violet glow |
| Power outage | `#f7b731` (yellow) | 1px `#c98b00` | 8px yellow glow |
| Comms outage | `#20c997` (teal) | 1px `#0a8060` | No glow (lower priority) |
| Civilian alert | `#e63946` (red) + siren icon | 2px stroke | 16px blinking glow (max severity) |
| Troop movement | `#4ecdc4` (cyan) | 1px `#228880` | 4px subtle glow, animated direction arrow |
| Aviation (ADS-B) | `#00b4d8` (sky blue) | 0.5px | No glow; aircraft icon |
| Maritime (AIS) | `#0077b6` (navy blue) | 0.5px | No glow; vessel icon |
| Weather | `#90e0ef` (pale blue) | 0 | No glow; semi-transparent fill |
| Thermal satellite | `#ff4800` → `#ffff00` gradient | 0 | No glow; raster layer |
| Social media activity | `#a8dadc` (pale teal) | 0.5px | No glow |
| AI prediction | `#b5838d` (muted rose) | 1px dashed | 4px glow, always dashed outline |

### 3.2 Confidence visualization rule

Confidence is always visualized through **opacity + outline**, never through color alone (colorblind constraint):

| Confidence | Marker opacity | Outline style |
|---|---|---|
| ≥ 0.85 (confirmed) | 1.0 | Solid |
| 0.65–0.84 (likely) | 0.8 | Solid |
| 0.40–0.64 (possible) | 0.6 | Dashed |
| < 0.40 (unverified) | 0.4 | Dashed + `?` label |

Never show high-opacity markers for unverified events. Users must be able to distinguish verification state at a glance without reading a tooltip.

### 3.3 Severity visualization rule

Severity (1–5 scale) controls **size + glow intensity**:

| Severity | Marker size (px) | Glow radius (px) | Animation |
|---|---|---|---|
| 1 (minimal) | 8 | 0 | None |
| 2 (low) | 10 | 4 | None |
| 3 (moderate) | 14 | 8 | None |
| 4 (high) | 18 | 12 | Slow pulse (3s cycle) |
| 5 (critical) | 24 | 20 | Fast pulse (1s cycle) |

### 3.4 Decay over time

Events visually fade as they age. Implemented via `marker-opacity` driven by `hours_since_event`:

| Age | Opacity multiplier |
|---|---|
| 0–2h | 1.0 |
| 2–6h | 0.85 |
| 6–24h | 0.65 |
| 24–72h | 0.4 |
| 72h+ | 0.2 (barely visible; use historical layer toggle to hide) |

Decay can be disabled by the user via the "Show historical" toggle.

---

## 4. Implementation Notes

- Style JSON version-controlled in `packages/map-style/style.json`.
- Style served from Mapbox Styles API (primary) or a Cloudflare R2 fallback (self-hosted).
- Automated visual regression tests: `percy` snapshots of each base style at zoom levels 4, 7, 10, 13 run on every PR touching `packages/map-style/`.
- Accessibility: all layer palettes tested with `Coblis` (color-blindness simulator) before merge. Protanopia and deuteranopia are the priority cases.

---

## 5. Style Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-05-30 | Initial spec — 4 base styles, label hierarchy, per-layer rules, confidence/severity/decay system |
