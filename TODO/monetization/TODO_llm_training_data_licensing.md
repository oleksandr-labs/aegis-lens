# TODO — LLM / AI Training Data Licensing

## Goal
License curated, verified, geo-tagged corpora to LLM / multimodal-AI labs for training and evaluation. Distinct from data licensing for end-applications: this is bulk corpus + ML-rights.

## Progress
- 18 / 18 done

## Products
- [x] **Verified-OSINT training corpus** — text, captions, geolocations, source attributions — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Multimodal image+text pairs** — verified photos with location, time, context — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Audio + transcript pairs** — STT-grade with multilingual coverage (RU, UK, PL) — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Geolocation eval set** — gold-labelled benchmark for vision/text geolocation models — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Disinformation / misinformation labelled set** — for safety/classifier training — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Knowledge-graph dump** — entities + relations for KG-RAG — `apps/web/src/lib/data/llm-training-corpus.ts`

## Commercials
- [x] One-time corpus license: $100k–$5M depending on scope — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] Annual updating feed: $250k–$1M — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] Per-token / per-row pricing for incremental — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Pay-with-credits-for-training-data**: lab uses corpus → we get model-output / fine-tuned model rights or revshare on derived products — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] Eval-only license (cheaper) vs training license (full rights) — `apps/web/src/lib/data/llm-training-corpus.ts`

## Ethics / legal
- [x] **PII scrub** — faces, names of civilians, victims — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Upstream source licenses honored** — don't relicense scraped content the source forbids — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Provenance metadata** — each row carries source, license, scrub-method — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Opt-out registry** — sources / individuals can request removal — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **No-training-by-default policy** — explicit license required; no scraping our own data for training others — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Robots.txt + AI-bot policy** for our public surface (allow indexing, deny training without license) — `apps/web/src/lib/data/llm-training-corpus.ts`
- [x] **Contractual no-misuse** clause — buyer cannot train models for surveillance against civilians — `apps/web/src/lib/data/llm-training-corpus.ts`

## Linked files
- [TODO_data_licensing.md](TODO_data_licensing.md)
- [../security/TODO_osint_ethics.md](../security/TODO_osint_ethics.md)
- [../research/TODO_model_governance.md](../research/TODO_model_governance.md)
- [../legal_docs/TODO_takedown_licensing.md](../legal_docs/TODO_takedown_licensing.md)

### Примітки
Training-data — найвища маржинальність, найвищий ethical risk. Одна помилка стирає роки brand-trust.
