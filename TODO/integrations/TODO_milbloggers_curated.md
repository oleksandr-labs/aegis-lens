# TODO — Integration: Curated Milblogger Allow-List

## Goal
A vetted list of high-signal OSINT / milblogger accounts on Telegram + X — both UA-supporting and RU-side (for narrative tracking).

## Progress
- 12 / 12 done

## Tasks

### Curation
- [x] UA-side allow-list (Khorne Group, Tryzub, OSINT-аналітики, war correspondents) — integrations/milbloggers/src/registry.ts (side:"ua" entries: Khorne Group, Tryzub, DeepState UA, war correspondent)
- [x] RU-side allow-list (for opposite-narrative tracking ONLY — labeled clearly) — integrations/milbloggers/src/registry.ts (side:"ru" entries with mandatory oppositionLabel)
- [x] International OSINT accounts (Bellingcat, ConflictNews, GeoConfirmed, etc.) — integrations/milbloggers/src/registry.ts (side:"int": Bellingcat, ConflictNews, GeoConfirmed)
- [x] Per-account reputation score — integrations/milbloggers/src/reputation.ts (editorial-prior-seeded, Laplace-smoothed, logged)
- [x] Per-account specialty tags — integrations/milbloggers/src/tags.ts (SpecialtyTag catalog, en/uk/ru)
- [x] Editorial vetting before adding (no anonymous accounts without track record) — integrations/milbloggers/src/vetting.ts (vetAccount gate + DEFAULT_CRITERIA)

### Pipeline
- [x] Per-account ingest with content classification — integrations/milbloggers/src/ingest.ts (ingestAccount + classifyContent + demoFetcher)
- [x] Side-label clearly preserved (no false equivalence) — integrations/milbloggers/src/side-label.ts (assertSideLabel invariant; mayCorroborate forbids cross-side corroboration)
- [x] Cross-reference between accounts for confidence boost — integrations/milbloggers/src/cross-reference.ts (same-camp-only, reputation-weighted, bounded boost)
- [x] Auto-flag accounts that propagate confirmed misinfo (downgrade reputation) — integrations/milbloggers/src/misinfo-flag.ts (applyMisinfoVerdict → reputation strike; references services/misinfo)

### Use in product
- [x] Side-by-side narrative comparison (UA-side vs RU-side framing of same event) — integrations/milbloggers/src/narrative-compare.ts + apps/web/src/app/api/integrations/milbloggers/route.ts (?view=compare, with no-false-equivalence disclaimer)
- [x] Editorial review queue for high-impact posts — integrations/milbloggers/src/review-queue.ts (ReviewQueue, impact-weighted)

## i18n
- UK + RU + EN; transliteration on entities mentioned.

### Примітки
This list is editorially curated, not algorithmic. Quality > quantity. Public methodology page.
