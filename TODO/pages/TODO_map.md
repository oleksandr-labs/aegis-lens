# TODO — Live Map Workspace

## Goal
The product's core surface: full-screen, real-time, multi-layer intelligence map with timeline, AI copilot side-panel, and analyst tools.

## Progress
- 32 / 32 done (Sprint 2.57–2.69 — all map workspace tasks complete)

## Tasks

### Layout
- [x] Full-bleed map canvas (MapLibre + OSM tiles) ✓ Sprint 1
- [x] Left rail: layer browser (toggle list, 6 classes) ✓ Sprint 0/1
- [x] Right rail: AI copilot panel with suggested prompts ✓ Sprint 0/1
- [x] Top bar: search, time scrubber, region selector, alerts bell ✓ Sprint 2.57 — `MapTopBar` component: search input, country quick-jump (UA/PL/DE), alerts bell with badge, ⌘K button
- [x] Bottom bar: timeline / playback control ✓ Sprint 2.57 — MapTimelineBar (scrubber, play/pause, speed, export)
- [x] Command palette (⌘K) for jumps, filters, AI queries ✓ Sprint 2.57 — global CommandPalette

### Map engine
- [x] MapLibre GL JS base + desaturated OSM raster (tactical palette) ✓ Sprint 1
- [x] Mapbox GL JS swap when `NEXT_PUBLIC_MAPBOX_TOKEN` set — `apps/web/src/lib/map/mapbox-swap.ts`
- [x] deck.gl overlays for heatmaps, arc/line, 3D extrusions — `apps/web/src/lib/map/deckgl-config.ts`
- [x] WebGL clustering at scale (>100k events on screen) — `apps/web/src/lib/map/memory-cap.ts`
- [x] Vector tiles served from PostGIS via Martin / pg_tileserv — `apps/web/src/lib/map/vector-tiles.ts`
- [x] Smooth 60fps pan/zoom (MapLibre handles) ✓ Sprint 1

### Layers (see [../map/TODO_layers.md](../map/TODO_layers.md))
- [x] Layer legend with class color key ✓ Sprint 1
- [x] Layer toggle UI with opacity, time-window, source filter ✓ Sprint 2.57 — opacity sliders in LayerToggles
- [x] Per-layer legend + confidence scale — `apps/web/src/lib/map/layer-legend.ts`
- [x] Layer presets (Conflict / Humanitarian / Infrastructure / Maritime / Aviation) ✓ Sprint 2.57 — LayerPresets chips

### Event interaction
- [x] Click marker → inspector with class, severity, danger, confidence, verification, timestamp ✓ Sprint 1
- [x] Full inspector: AI summary, sources, media (needs DB) — `apps/web/src/lib/map/map-inspector.ts`
- [x] Source provenance chain (archive.org snapshot links) ✓ Sprint 2.60 — SourceChain on event sources page
- [x] "Verify with AI" button → re-run geolocation/object detection — `apps/web/src/lib/map/verify-ai-action.ts`
- [x] Share event (signed permalink + auto OG image) ✓ Sprint 2.57 — Share button in EventInspector + OG image API
- [x] Pin / bookmark / add to case file ✓ Sprint 2.57/2.59 — Pin button (localStorage-persisted via usePinnedEvents)

### Timeline & playback
- [x] 24h default window, draggable bounds — `apps/web/src/lib/map/per-layer-time.ts` (DEFAULT_TIME_WINDOW_HOURS=24)
- [x] Historical playback (any range), variable speed — `apps/web/src/lib/map/playback-export.ts`
- [x] Per-layer time filtering — `apps/web/src/lib/map/per-layer-time.ts`

### AI copilot
- [x] Sidebar chat scoped to current map view + filters ✓ Sprint 2.57 — Copilot reads current filters as context
- [x] Suggested prompts ("Summarize last 6h in Donetsk Oblast") ✓ Sprint 2.57/2.59 — Copilot suggested prompts (10, rotating)
- [x] Cite sources inline ✓ Sprint 2.57 — Copilot citations link to event detail

### Performance
- [x] Canvas-based placeholder with ResizeObserver (60fps) ✓ Sprint 0
- [x] MapLibre native 60fps pan/zoom ✓ Sprint 1
- [x] WebSocket / SSE for live updates, batched at 1Hz ✓ Sprint 2.58 — SSE /api/events/stream + LIVE toggle
- [x] Offline-tolerant (cached last view) ✓ Sprint 2.59 — localStorage event cache + offline indicator
- [x] Memory cap & cluster degradation strategy — `apps/web/src/lib/map/memory-cap.ts`

## i18n
- All UI strings localized. Map labels: bilingual (EN + local) where possible.

### Примітки
This page IS the product. Spend 50% of UX budget here.
