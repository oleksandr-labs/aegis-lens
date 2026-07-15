# Programmatic Template — Deepfake Case-Study Showcase

## Goal
Visual-evidence-first gallery of documented deepfakes caught and debunked ("here's a deepfake we caught and how") — distinct from the internal detection service (`apps/web/src/lib/ai/deepfake-detection.ts`, a scoring-contract stub with no case examples) and the round-3 fact-check database (`programmatic/TODO_template_fact_check.md`, claim-text-centric, not visual-evidence-first). Lower urgency than the space-domain/climate-conflict gaps this round since it can partially piggyback on the fact-check template rather than requiring a fully separate build.

## Progress
- 0 / 4 done

## URLs
- `/deepfakes` (showcase index) · `/deepfakes/<case-slug>` (per-case breakdown)

## Tasks
- [ ] `/deepfakes/<slug>` page: side-by-side original-vs-synthetic (or annotated single asset where no original exists), detection signals explained in plain language (recycled-media score, synthetic-face score, metadata-consistency score — reuse the scoring contract already defined in `apps/web/src/lib/ai/deepfake-detection.ts`), verification methodology, publication/spread context
- [ ] `/deepfakes` index: chronological gallery, filterable by conflict/technique (face-swap/voice-clone/full-synthetic)
- [ ] Data model: `DeepfakeCaseSeed` (caseSlug, conflictSlug?, technique, detectionScores (reuse existing type), narrativeEN/UK, mediaAssets[], sourceUrls[]) in `apps/web/src/lib/programmatic/deepfake-cases.ts` — extends the existing detection-service types rather than duplicating them
- [ ] Cross-link each case to a corresponding `/fact-check/<slug>` entry where the deepfake was tied to a specific false claim; `ImageObject`/`VideoObject` + `ClaimReview` schema.org + FAQPage JSON-LD

## Notes
- Treat as an extension of round 3's fact-check database rather than a from-scratch build — share the review workflow and editorial bar (`features/TODO_review_queue.md`).

## i18n
- EN + UK.
