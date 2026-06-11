# TODO — UI System

## Goal
Dark, cinematic, intelligence-grade UI system. Premium feel, high information density, no consumer-SaaS cliches.

## Progress
- 13 / 18 done

## Tasks

### Foundations
- [ ] Component library on shadcn/ui + Radix primitives
- [x] Tailwind config with custom design tokens (see [TODO_styles.md](TODO_styles.md)) ✓ Sprint 0
- [x] Icon set: Lucide + custom mil/intel glyphs ✓ Sprint 2.60 — custom SVG event-class marker icons (CLASS_ICON_PATH)
- [ ] Typography scale (Inter / Geist for UI, JetBrains Mono for data)

### Components
- [x] Data table (virtualized, 10k+ rows, sortable, sticky cols) ✓ Sprint 2.59 — DataTable component (sortable, paginated, sticky header)
- [x] Event card (compact + expanded) ✓ Sprint 2.59 — IncidentCard (compact + full modes)
- [x] Confidence / danger score chips ✓ Sprint 2.59 — ConfidenceChip + DangerChip + VerificationChip + SeverityBar
- [x] Source provenance pill with archive link ✓ Sprint 2.59 — SourcePill component
- [x] Time scrubber / range picker ✓ Sprint 2.57 — MapTimelineBar scrubber
- [x] Layer toggle with opacity slider ✓ Sprint 2.57 — LayerToggles opacity sliders
- [x] Command palette (⌘K) ✓ Sprint 2.57 — CommandPalette
- [x] Toast + alert system ✓ Sprint 2.58 — Toast + ToastProvider + showToast
- [x] Modal + drawer + popover patterns ✓ Sprint 2.59 — Modal + Drawer components
- [x] Chart primitives (line, bar, heatmap, sparkline) ✓ Sprint 1
- [x] Map overlay panels (glassmorphic but readable) ✓ Sprint 2.57 — FilterBar, legend, copilot panels (backdrop-blur)
- [x] AI chat panel (streaming, citations, follow-ups) ✓ Sprint 2.57 — Copilot streaming SSE with citations

### A11y
- [ ] WCAG 2.2 AA contrast everywhere
- [ ] Keyboard nav for every interactive element
- [x] Reduced-motion variants ✓ Sprint 2.60 — prefers-reduced-motion CSS + useMotionPreference

## i18n
- All components must accept RTL-safe and long-string-tolerant layouts (German/UK strings are longer than EN).

### Примітки
Density > whitespace. Analysts hate scrolling.
