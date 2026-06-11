# TODO — Misinformation Detection

## Goal
Flag suspected disinformation, recycled / mis-located media, and coordinated narrative campaigns — without becoming an arbiter of truth.

## Progress
- 10 / 10 done

## Tasks
- [x] Recycled-media detection (image/video hash + perceptual hash + embeddings) — `detectRecycledMedia()` + `MediaProvenanceIndex`/`InMemoryMediaProvenanceIndex` in `services/misinfo/src/media-recycling.ts` (SHA-256 exact, pHash Hamming, embedding cosine; neutral signal, time-gated, conservative confidence ≤ 0.85)
- [x] Geolocation contradiction detection (claimed location vs visual cues) — `detectGeoContradiction()` in `services/misinfo/src/geo-contradiction.ts` (country + haversine-distance mismatch vs structured `VisualGeoCue`s; confidence ≤ 0.8)
- [x] Temporal contradiction detection (claimed time vs metadata / sun position) — `detectTemporalContradiction()` + `solarElevationDeg()` in `services/misinfo/src/temporal-contradiction.ts` (EXIF gap + NOAA solar day/night mismatch)
- [x] Narrative cluster tracking (which talking points are propagating, where) — `NarrativeClusterTracker` in `services/misinfo/src/narrative-clusters.ts` (cosine sim + online centroid updates)
- [x] Coordinated-behavior heuristics (account age, posting cadence, source-graph) — `detectCoordinatedBehavior()` in `services/misinfo/src/coordinated-behavior.ts` (fresh-account share, burst cadence, text Jaccard near-dup, re-share concentration; transparent `CoordinationBreakdown`, confidence ≤ 0.8)
- [x] Source reputation scoring (transparent, appealable) — `SourceReputationTracker` with Laplace-smoothed score in `source-reputation.ts`
- [x] "Disputed" badge on events with caveats + reasons — `createDisputedBadge()` + `DisputedBadgeStore` in `disputed-badge.ts`
- [x] Public methodology page (transparency requirement) — `MISINFO_METHODOLOGY` + `renderMethodologyMarkdown()` in `services/misinfo/src/methodology.ts` (EN/UK principles, per-detector docs, appeals); single source of truth, also encoded in `services/misinfo/COMPLIANCE.md`
- [x] Human review queue for high-impact flags — `requiresHumanReview` field + `getPendingReview()` in DisputedBadgeStore
- [x] Avoid auto-takedown — surface caveats, never censor — `caveatText` only, no deletion; conservative thresholds (score < 0.25 = no badge)

## i18n
- Tier-1 languages: EN, UK, RU. Tier-2: PL, RO, BG, DE.

### Примітки
This is reputationally explosive. Conservative thresholds + transparent appeals only.
