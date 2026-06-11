# TODO — AI for SEO Generation

## Goal
Use AI to draft SEO assets at scale — metadata, FAQs, intros, internal-link suggestions — under strict editorial gates.

## Progress
- 11 / 11 done

## Tasks
- [x] Title + meta description drafter (per template) with brand voice — services/ai-seo/src/metadata.ts (grounded, SERP-length windows, brand voice via system guardrail)
- [x] FAQ generator per page-template — services/ai-seo/src/faq.ts (Q/A pairs, citation-required, feeds FAQPage schema)
- [x] Intro paragraph generator (factual, citation-required) — services/ai-seo/src/intro.ts (requireCitation gate, number/date grounding check)
- [x] Internal-link suggester (based on KG + semantic similarity) — services/ai-seo/src/internal-links.ts (deterministic KG-overlap + embedding cosine + keyword blend)
- [x] Schema.org generator (per page-type) — services/ai-seo/src/schema-org.ts (page-type→type map, JSON-LD, FAQ mainEntity, source citations)
- [x] OG image alt-text generator — services/ai-seo/src/alt-text.ts (length-bounded, grounded, gated)
- [x] Per-locale variant generator (not raw MT — adapted) — services/ai-seo/src/locale-variants.ts (adaptation score, tier-1 native-reviewer routing)
- [x] Per-piece confidence score — services/ai-seo/src/confidence.ts (grounding + source-confidence + quality-penalty blend, 0–1)
- [x] Editorial review gate before index — services/ai-seo/src/review-gate.ts (routeForReview + ReviewQueue; YMYL/tier-1 force native sign-off)
- [x] Plagiarism / near-duplicate guard — services/ai-seo/src/dedup.ts (shingled Jaccard + embedding cosine vs existing pages)
- [x] Cost-per-page tracking — services/ai-seo/src/cost-tracking.ts (token→USD estimate, CostLedger per page/kind)

## i18n
- Per-locale prompts + native-reviewer sign-off in tier-1 locales.

### Примітки
AI SEO content without human review trends toward indistinguishable mediocrity. Reviewer time is the moat.
