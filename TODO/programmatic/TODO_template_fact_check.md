# Programmatic Template — Fact-Check / Debunk Database

## Goal
Standalone public per-claim page (e.g. `/fact-check/<claim-slug>` — "Is it true that X?") distinct from the internal misinformation-detection AI service (`ai/TODO_misinformation.md`) and the narrative-level `topical_hubs/TODO_hub_disinformation.md`. High-volume "is it true that..." search intent, near-zero net-new infrastructure — reuses the already-built `NarrativeClusterTracker`/`SourceReputationTracker`/`DisputedBadgeStore` machinery in `apps/web/src/lib/hubs/disinformation.ts`.

## Progress
- 0 / 5 done

## URLs
- `/fact-check` (index, filterable by conflict/topic/verdict) · `/fact-check/<claim-slug>` (per-claim page)

## Tasks
- [ ] Data model: `FactCheckSeed` (claimText, verdict: false/misleading/unproven/true, conflictSlug?, sourcesCitedByClaim[], counterEvidence[], relatedNarrativeClusterId) in `apps/web/src/lib/programmatic/fact-checks.ts` — reuse existing `DisputedBadgeStore` entries as seed data where already flagged
- [ ] `/fact-check/<slug>` page: claim statement, verdict badge, evidence-based rebuttal, original source(s), cross-reference to StopFake/VoxCheck/EUvsDisinfo/Bellingcat where those orgs also covered it
- [ ] `/fact-check` index: filterable list, verdict distribution stat
- [ ] `ClaimReview` schema.org markup (Google's fact-check structured data — required for the Fact Check panel in search results) + FAQPage JSON-LD
- [ ] Cross-link to `topical_hubs/TODO_hub_disinformation.md` (narrative-level context) and relevant `/conflicts/<slug>`

## Notes
- Cheapest spec of the round-3 gap pass (2026-07-12) — the detection/scoring backend already exists; this is purely a public presentation layer that was missing.
- Editorial bar: publish only claims with a documented evidence trail, never publish based on AI-detection confidence alone without human review (reuse review workflow from `features/TODO_review_queue.md`).

## i18n
- EN + UK; claim text and rebuttal both require native-quality translation (this is a defamation/precision-sensitive content type).
