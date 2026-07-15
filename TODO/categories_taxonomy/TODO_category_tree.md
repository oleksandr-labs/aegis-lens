# TODO — Category Tree (Master)

## Goal
Hierarchical category taxonomy — top → sub → micro. SEO + filter + KG simultaneously.

## Top-level (10)
- [x] Military & Defense ✓ Sprint 0
- [x] Infrastructure ✓ Sprint 0
- [x] Cyber ✓ Sprint 0
- [x] Humanitarian ✓ Sprint 0
- [x] Maritime ✓ Sprint 0
- [x] Aviation ✓ Sprint 0
- [x] Politics & Diplomacy ✓ Sprint 0
- [x] Economy & Sanctions ✓ Sprint 0
- [x] Information Environment ✓ Sprint 0
- [x] Environment & Climate ✓ Sprint 0

## Per-top: 5–10 sub-categories; per-sub: 5–15 micro

## Tasks
- [x] Full tree exported to YAML (machine-readable) — `data/taxonomy/category-tree.yaml` (10 top-level + subs + micros, versioned)
- [x] Per-node: slug, EN/UK name, parent, synonyms — every YAML node has slug/name_en/name_uk/parent/synonyms; typed loader + `validateTree()` in `services/auto-tagging/src/category-tree.ts`
- [x] Governance: rename / merge / deprecate workflow — `services/auto-tagging/src/governance.ts` (`TagRenameOp`/`TagMergeOp`/`TagDeprecateOp` + `proposeOp()`)
- [x] Per-node page auto-generated (programmatic) ✓ Sprint 0

### Примітки
Taxonomy = filter UI + URL structure + KG facets. Lock early.

### Gaps flagged 2026-07-12 (content-gap analysis pass)
Existing "Politics & Diplomacy" sub-categories (Treaties/Sanctions/Visits/Statements/Recognition/Elections/Coups) have no entry for negotiation processes. Existing top-level tree also has no accountability/recovery branch. Proposed additions:
- [ ] Add sub-category `negotiations` / `ceasefire_talks` under **Politics & Diplomacy** — feeds [topical_hubs/TODO_hub_peace_diplomacy.md](../topical_hubs/TODO_hub_peace_diplomacy.md)
- [ ] Add sub-category `war_crimes_accountability` under **Politics & Diplomacy** (or new top-level `Accountability & Justice` if node count under Politics grows past 10) — feeds [topical_hubs/TODO_hub_war_crimes.md](../topical_hubs/TODO_hub_war_crimes.md)
- [ ] Add sub-category `reconstruction_recovery` under **Infrastructure** — feeds [topical_hubs/TODO_hub_reconstruction.md](../topical_hubs/TODO_hub_reconstruction.md)
- [ ] Add sub-category `international_aid` under **Economy & Sanctions** — feeds [topical_hubs/TODO_hub_international_aid.md](../topical_hubs/TODO_hub_international_aid.md)
- [ ] Add micro-category `pow_detainee_exchange` under **Humanitarian** — feeds [topical_hubs/TODO_hub_pow_exchange.md](../topical_hubs/TODO_hub_pow_exchange.md)
