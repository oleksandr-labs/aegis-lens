# TODO — Internal Linking Engine

## Goal
Automated, smart internal linking at programmatic scale — not random, not stuffed.

## Progress
- 14 / 14 done

## Tasks

### Engine
- [x] Embedding-based "related items" per page — apps/web/src/lib/seo/internal-links/related-embeddings.ts (hashing-trick embedder + cosine ranking)
- [x] KG-based traversal (entity → neighbor entities) — apps/web/src/lib/seo/internal-links/kg-traversal.ts (weighted entity graph + BFS neighbours)
- [x] Editorial overrides (boost / suppress) — apps/web/src/lib/seo/internal-links/overrides.ts
- [x] Per-template internal-link rules (e.g. region page links 5 events + 3 reports + 2 sibling regions) — apps/web/src/lib/seo/internal-links/link-rules.ts (region rule = 5 events + 3 reports + 2 siblings + hub)
- [x] Per-page link budget (avoid 200-link spam) — apps/web/src/lib/seo/internal-links/link-budget.ts
- [x] Anchor-text variety (see [TODO_anchor_text.md](TODO_anchor_text.md)) — apps/web/src/lib/seo/internal-links/anchor-variety.ts (variant pool + repetition lint, loose coupling)
- [x] Orphan-page detection (every page reachable in ≤ 3 clicks from /) — apps/web/src/lib/seo/internal-links/orphans.ts (per-locale BFS from home)

### Crawl-shape
- [x] Hub pages link out to spokes — apps/web/src/lib/seo/internal-links/hub-spoke.ts (buildHubSpokeEdges hub-to-spoke)
- [x] Spokes link back to hub + 3+ siblings — apps/web/src/lib/seo/internal-links/hub-spoke.ts (spoke-to-hub + ring siblings, default 3)
- [x] Per-cluster traversal audit — apps/web/src/lib/seo/internal-links/cluster-audit.ts (hub-spoke contract + intra-cluster reachability BFS)

### Monitoring
- [x] Per-page incoming-link count — apps/web/src/lib/seo/internal-links/link-counts.ts (pageLinkCounts.inCount)
- [x] Per-page outgoing-link count — apps/web/src/lib/seo/internal-links/link-counts.ts (pageLinkCounts.outCount)
- [x] Per-cluster link density — apps/web/src/lib/seo/internal-links/link-density.ts (intra-edge density + leakage + thresholds)
- [x] Internal PageRank approximation per page — apps/web/src/lib/seo/internal-links/internal-pagerank.ts (iterative power method, per-locale, dangling-mass handling)

## i18n
- Internal links preserve locale (no cross-locale leakage).

### Примітки
The internal-link engine is what scales topical authority. Build it Day 1.
