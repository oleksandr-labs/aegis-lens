# Hub — Sanctions

## Progress
- 5 / 5 done

## URLs
- `/sanctions` · `/sanctions/<jurisdiction>` · `/sanctions/<jurisdiction>/<list>`

## Content
- [x] Pillar overview ✓ Sprint 2.72 — `sanctionsPillarNarrative` (EN+UK) + `SANCTIONS_HUB_URLS` in `apps/web/src/lib/hubs/sanctions.ts`
- [x] Per-jurisdiction list status ✓ Sprint 2.72 — `SanctionsJurisdiction` type + `JURISDICTIONS_STATUS` typed list (UN/EU/US-OFAC/UK-HMRC/UA) in `apps/web/src/lib/hubs/sanctions.ts`
- [x] Per-entity sanctions history (KG) ✓ Sprint 2.72 — `SanctionedEntity` interface with `entityId`, `name`, `aliases`, `jurisdiction`, `listed`, `reason`, `kgSlug` in `apps/web/src/lib/hubs/sanctions.ts`
- [x] Compliance use-cases ✓ Sprint 2.72 — `COMPLIANCE_USE_CASES` (4: due-diligence/KYC/supply-chain/investment-screening, EN+UK) + `SANCTIONS_FAQ` (10 Q&As) in `apps/web/src/lib/hubs/sanctions.ts`
- [x] Updates feed ✓ Sprint 2.72 — `SANCTIONS_UPDATES_FEED` config const (url, format JSON, updateInterval PT15M) in `apps/web/src/lib/hubs/sanctions.ts`
