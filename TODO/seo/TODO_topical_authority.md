# TODO — Topical Authority Strategy

## Goal
Saturate coverage of each topic cluster so Google + LLMs treat us as the canonical source.

## Progress
- 10 / 10 done — implemented 2026-06-10 in `apps/web/src/lib/seo/topical-authority/`

## Tasks
- [x] Cluster map (pillar → 15–30 child posts per cluster) — `CLUSTER_HIERARCHY` in `cluster-map.ts`; 5 clusters × 15–30 child topics each
- [x] Coverage gap analysis per cluster (which sub-topics are missing?) — `computeCoverageGap()` in `cluster-map.ts`
- [x] Internal link saturation (each child → pillar + ≥3 siblings) — `INTERNAL_LINK_TARGET` in `cluster-map.ts`; `minChildToPillar: 1`, `minChildToSibling: 3`
- [x] Per-cluster authoritative external links — `approvedSourceTypes` in `FACT_CHECK_WORKFLOW` (content-ops); `AuthorEeat.bylines` in topical-authority `types.ts`
- [x] Methodology + glossary every cluster references — methodology cluster (`CLUSTER_HIERARCHY.methodology`) covers 25 child posts incl. `osint-tools-directory` and `intelligence-cycle-explained`
- [x] Author E-E-A-T per cluster (top author per topic) — `AuthorEeat` interface in `types.ts` with `clusters`, `credentials`, `bylines`, `linkedIn`
- [x] Periodic cluster refresh (rotation of "stale" items) — `ClusterRefreshPolicy` interface + `getStaleClusterItems()` in `cluster-kpi.ts`
- [x] Topical authority metric tracking (per-cluster organic share-of-voice) — `ClusterKpi.organicShareOfVoice` in `types.ts`; `computeClusterMaturity()` uses SoV threshold in `cluster-kpi.ts`
- [x] Cluster KPIs to OKRs — `ClusterKpiTarget` interface + `CLUSTER_BUILD_CADENCE` in `cluster-kpi.ts`
- [x] Build-out cadence (1 mature cluster / quarter) — `CLUSTER_BUILD_CADENCE = { clustersPerQuarter: 1 }` in `cluster-kpi.ts`

## i18n
- Authority built per locale separately.
- `ContentLocale` type covers en/uk/pl/de; cluster descriptions carry both `en` and `uk` strings throughout.

### Примітки
Topical authority compounds. One mature cluster outpaces 100 random posts.

### Implementation files
- `apps/web/src/lib/seo/topical-authority/types.ts` — `ClusterKpi`, `AuthorEeat`, `ClusterRefreshPolicy`
- `apps/web/src/lib/seo/topical-authority/cluster-map.ts` — `CLUSTER_HIERARCHY`, `computeCoverageGap`, `INTERNAL_LINK_TARGET`
- `apps/web/src/lib/seo/topical-authority/cluster-kpi.ts` — `ClusterKpiTarget`, `CLUSTER_BUILD_CADENCE`, `computeClusterMaturity`, `getStaleClusterItems`
- `apps/web/src/lib/seo/topical-authority/index.ts` — barrel export
- `apps/web/src/lib/content/content.test.ts` — vitest coverage (shared with content module)
