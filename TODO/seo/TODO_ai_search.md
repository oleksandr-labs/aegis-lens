# TODO — AI Search Optimization (LLMO / GEO)

## Goal
Be the cited source inside ChatGPT, Claude, Perplexity, Google AI Overviews, Bing Copilot. Generative search is replacing classic SERP for many of our queries.

## Progress
- 9 / 14 done

## Tasks

### Crawler & access
- [x] Explicitly allow reputable AI crawlers in robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, OAI-SearchBot) ✓ Sprint 2.45 (already existed in robots.ts)
- [x] Block AI training on gated / sensitive content — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Block AI training on gated / sensitive content")
- [x] `llms.txt` published at root (machine-readable summary + key pages) ✓ Sprint 2.46 — `/llms.txt/route.ts` with org summary, key pages, contact, and AI crawler policy

### Content shape (LLM-friendly)
- [x] Clear summary at top of every long-form page (TL;DR block) — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "TL;DR / summary block at top of long-form content")
- [x] Q&A blocks with `FAQPage` schema — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "FAQPage schema (platform standard)")
- [x] Definitive statements with citations (LLMs cite citation-dense passages) — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Factual claims with inline citations")
- [ ] Stable URLs; avoid JS-only content for non-app pages
- [x] Structured data: `Article`, `Dataset`, `Event`, `Place`, `DefinedTerm` — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Structured data for AI summarisation", "Entity schema for AI KG indexing")

### Authority for AI answers
- [ ] Original-data posts with quotable stats
- [x] Methodology pages LLMs can reference — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES "Publisher transparency schema" + buildLlmsTxt key pages)
- [ ] Wikipedia / Wikidata entity establishment (organization, key authors)

### Monitoring
- [ ] Citation tracking in AI answer engines (manual + tooling like Profound / Otterly)
- [ ] Per-query share-of-mention reporting
- [ ] Track referrer traffic from AI engines

### Differentiated risk
- [ ] Misuse: don't let our content train models for targeting use cases — license & enforce
- [ ] Watermark / canary content to detect unauthorized training

## i18n
- LLMs respond in user language; ensure each locale has crawlable, summarized content.

### Примітки
Generative search citations may matter more than classic SERP within 2 years. Optimize now.
