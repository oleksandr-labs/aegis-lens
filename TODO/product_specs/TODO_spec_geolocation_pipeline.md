# SPEC — Geolocation Pipeline

## Status
In Progress

## Goal
End-to-end geolocation from text + image → coordinate + uncertainty + provenance.

## Tasks
- [x] Stages: clue extract → candidate generate → cross-ref → confidence — `services/geo/src/visual-geolocation.ts` (`geolocateFromImage()` orchestrates all 4 stages)
- [ ] LLM-assisted clue extraction prompt + eval
- [x] Candidate gazetteer queries with disambiguation — `generateCandidates()` + `disambiguate()` in `services/geo/src/disambiguation.ts`
- [ ] Visual cross-reference (Sentinel / OSM imagery)
- [x] Uncertainty quantification (radius) — `GeoCandidate.radiusM`, tightened on clue fusion
- [x] HITL escalation thresholds — `requiresReview` gate (best score < 0.7 OR top-2 margin < 0.15) in `geolocateFromImage()`
- [x] Per-stage latency budget — `timingMs: { clueExtraction, candidateGen, crossRef, total }` returned per call
- [ ] Per-stage cost budget
- [ ] Eval on historical hand-geolocated events

## i18n
- Multilingual clue extraction tier-1 (EN / UK / RU).

### Примітки
Geolocation is moat. Spec it carefully.
