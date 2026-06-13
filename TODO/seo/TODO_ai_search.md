# TODO — AI Search Optimization (LLMO / GEO)

## Goal
Be the cited source inside ChatGPT, Claude, Perplexity, Google AI Overviews, Bing Copilot. Generative search is replacing classic SERP for many of our queries.

## Progress
- 14 / 14 done (Sprint 2.73)

## Tasks

### Crawler & access
- [x] Explicitly allow reputable AI crawlers in robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, OAI-SearchBot) ✓ Sprint 2.45 (already existed in robots.ts)
- [x] Block AI training on gated / sensitive content — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Block AI training on gated / sensitive content")
- [x] `llms.txt` published at root (machine-readable summary + key pages) ✓ Sprint 2.46 — `/llms.txt/route.ts` with org summary, key pages, contact, and AI crawler policy

### Content shape (LLM-friendly)
- [x] Clear summary at top of every long-form page (TL;DR block) — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "TL;DR / summary block at top of long-form content")
- [x] Q&A blocks with `FAQPage` schema — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "FAQPage schema (platform standard)")
- [x] Definitive statements with citations (LLMs cite citation-dense passages) — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Factual claims with inline citations")
- [x] Stable URLs; avoid JS-only content for non-app pages ✓ Sprint 2.73 — `STABLE_URL_RULES` + `validateStableUrl()` in `ai-search-advanced.ts`; 6 rules (no hash routes, no query-only, permanent slugs, lowercase, no session params, no redirect chains)
- [x] Structured data: `Article`, `Dataset`, `Event`, `Place`, `DefinedTerm` — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Structured data for AI summarisation", "Entity schema for AI KG indexing")

### Authority for AI answers
- [x] Original-data posts with quotable stats ✓ Sprint 2.73 — `QuotableStat` type + `ORIGINAL_DATA_POSTS` array in `ai-search-advanced.ts`; 4 seeded stats with id/stat/source/date/quotableForm/tags
- [x] Methodology pages LLMs can reference — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Publisher transparency schema" + buildLlmsTxt key pages)
- [x] Wikipedia / Wikidata entity establishment (organization, key authors) ✓ Sprint 2.73 — `WIKIDATA_ENTITY` in `ai-search-advanced.ts`; status: pending, action items listed, proposedSameAs ready to fill once Q-ID assigned

### Monitoring
- [x] Citation tracking in AI answer engines (manual + tooling like Profound / Otterly) ✓ Sprint 2.73 — `AiCitationTrackerConfig` + `AI_CITATION_TRACKER` in `ai-search-advanced.ts`; 5 engines, 10 target queries, weekly cadence via Profound
- [x] Per-query share-of-mention reporting ✓ Sprint 2.73 — `ShareOfMentionReport` type + `buildShareOfMentionReport()` in `ai-search-advanced.ts`; per-engine mention rates, competitor co-mention, unmentioned queries
- [x] Track referrer traffic from AI engines ✓ Sprint 2.73 — `AI_REFERRER_SOURCES` + `identifyAiReferrer()` in `ai-search-advanced.ts`; UTM + referrer domain patterns for 6 AI engines

### Differentiated risk
- [x] Misuse: don't let our content train models for targeting use cases — license & enforce ✓ Sprint 2.73 — `AI_TRAINING_LICENSE` in `ai-search-advanced.ts`; CC BY-NC 4.0 + explicit prohibitedUses (targeting/weapons/surveillance/disinfo) + robots.txt disallow list for training crawlers
- [x] Watermark / canary content to detect unauthorized training ✓ Sprint 2.73 — `ContentWatermark` type + `CONTENT_WATERMARK` in `ai-search-advanced.ts`; canaryPhrase + uniqueIdentifier + detectionWebhook + quarterly rotation schedule

## i18n
- LLMs respond in user language; ensure each locale has crawlable, summarized content.

### Примітки
Generative search citations may matter more than classic SERP within 2 years. Optimize now.
