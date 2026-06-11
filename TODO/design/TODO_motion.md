# TODO — Motion & Cinematic UX

## Goal
Subtle, purposeful motion: information-revealing, not decorative.

## Progress
- 5 / 8 done

## Tasks
- [ ] Motion principles doc (no easter eggs in workspace; cinematic only on landing)
- [x] Map: smooth pan/zoom, layer fade-in, time-scrubber inertia ✓ Sprint 2.60 — layer-fade-in CSS + MapLibre native pan/zoom
- [x] Live event arrival: pulse + ripple + sound (opt-in) ✓ Sprint 2.60 — pulse-ring + event-ripple animations (sound pending)
- [x] Alert escalation animations (color + motion) ✓ Sprint 2.60 — alert-critical pulsing box-shadow
- [x] Page transitions (View Transitions API where supported) ✓ Sprint 2.60 — View Transitions API + PageLoader + fade-out/in
- [ ] Landing hero animations (deck.gl globe, particle event stream)
- [x] Reduced-motion strict compliance ✓ Sprint 2.60 — @media prefers-reduced-motion disables all
- [ ] Performance budget per surface (no jank in map workspace)

## i18n
- N/A directly; motion is locale-agnostic.

### Примітки
Workspace = restraint. Landing = cinematic. Do not confuse the two.
