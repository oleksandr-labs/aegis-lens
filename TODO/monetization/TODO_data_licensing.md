# TODO — Data Licensing

## Goal
License bulk / historical / derived data for redistribution, academic research, or ML training. Distinct from SaaS API which is for end-application use; this is for downstream redistribution and dataset products.

## Progress
- 17 / 17 done

## Products
- [x] **Historical event archive bulk** — full event corpus, daily snapshots, Parquet/JSONL on S3 — `apps/web/src/lib/data/data-licensing.ts`
- [x] **Geocoded incidents dataset** — verified-only, with confidence + sources — `apps/web/src/lib/data/data-licensing.ts`
- [x] **Entity / KG dump** — knowledge graph snapshot — `apps/web/src/lib/data/data-licensing.ts`
- [x] **Verified-media corpus** — for academic CV / multimodal ML (subject to source licenses) — `apps/web/src/lib/data/data-licensing.ts`
- [x] **Custom slice** — by date / region / category, priced per slice — `apps/web/src/lib/data/data-licensing.ts`
- [x] **ML-training license** (special) — explicit grant for model training; carve-outs for upstream source licenses; abuse clauses — `apps/web/src/lib/data/data-licensing.ts`

## Pricing models
- [x] One-off snapshot ($2k–50k depending on slice) — `apps/web/src/lib/data/data-licensing.ts`
- [x] Annual feed subscription ($25k–250k) — `apps/web/src/lib/data/data-licensing.ts`
- [x] Per-row metered (for small slices, $0.001–0.01 / row) — `apps/web/src/lib/data/data-licensing.ts`
- [x] Academic discount: 90% off with EDU verification + non-commercial clause — `apps/web/src/lib/data/data-licensing.ts`
- [x] Non-profit: free for cited research, requires takedown cooperation — `apps/web/src/lib/data/data-licensing.ts`

## Legal / ethics
- [x] Upstream source license check — do not relicense what we don't own — `apps/web/src/lib/data/data-licensing.ts`
- [x] PII scrub for all dataset products (faces / names of civilians) — `apps/web/src/lib/data/data-licensing.ts`
- [x] Retraction propagation — buyers receive delta updates — `apps/web/src/lib/data/data-licensing.ts`
- [x] Audit trail of who bought what slice — `apps/web/src/lib/data/data-licensing.ts`
- [x] No re-sale to sanctioned entities (export control) — `apps/web/src/lib/data/data-licensing.ts`
- [x] → see [../security/TODO_compliance.md](../security/TODO_compliance.md), [../security/TODO_osint_ethics.md](../security/TODO_osint_ethics.md), [../legal_docs/TODO_takedown_licensing.md](../legal_docs/TODO_takedown_licensing.md)

## Linked files
- [../pages/TODO_datasets.md](../pages/TODO_datasets.md)
- [../seo/TODO_open_data_seo.md](../seo/TODO_open_data_seo.md)
- [TODO_white_label.md](TODO_white_label.md)

### Примітки
Це не той самий API — це redistribution rights. Ціна на порядки вища.
