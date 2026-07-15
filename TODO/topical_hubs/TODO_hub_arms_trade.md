# Hub — Arms Trade & Weapons Proliferation Tracker

## Goal
Who-sells-what-to-whom transfer tracking — distinct from per-item equipment spec pages (`pages/TODO_equipment.md`) and the sanctions hub's "arms embargo" sanction *type* (`topical_hubs/TODO_hub_sanctions.md`, which tracks embargoes as one of three sanction categories, not transfers themselves). Highest-effort item of round 5 — no data-sourcing plan exists yet anywhere in the repo (SIPRI/UN Comtrade-style feed), same shape as round 3's cultural-heritage tracker.

## Progress
- 0 / 5 done

## URLs
- `/arms-trade` (pillar) · `/arms-trade/<country-slug>` (per-supplier/recipient breakdown)

## Tasks
- [ ] Pillar page: methodology citing SIPRI Arms Transfers Database / UN Register of Conventional Arms as primary sources, scope note (only publicly documented transfers, no operational/classified inference)
- [ ] Per-country page: known supplier relationships, transfer volumes/types (where publicly reported), sanctions-embargo cross-reference
- [ ] Data model: `ArmsTransferSeed` (supplierCountry, recipientCountry, category, year, sourceUrls[]) in `apps/web/src/lib/hubs/arms-trade.ts`
- [ ] **Data-source integration required before content can be built** — scope a `TODO/integrations/` spec for SIPRI/UN Comtrade access (this hub should not proceed to content production until that integration exists, same sequencing as round 3's cultural-heritage tracker)
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Defer behind `topical_hubs/TODO_hub_cultural_heritage.md` and any other data-source-integration-gated item — do not prioritize by traffic potential alone given the missing data pipeline.

## i18n
- EN + UK.
