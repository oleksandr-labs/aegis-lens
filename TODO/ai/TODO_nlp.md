# TODO — NLP, OCR, STT, Translation

## Goal
Convert any text/audio/image artifact in any language into structured, queryable, embedded intelligence.

## Progress
- 17 / 17 done

## Tasks

### Text
- [x] Language detection (fastText / fasttext-lang) — `services/nlp/src/language-detect.ts` (HeuristicLanguageDetector + ModelLanguageDetector via REST)
- [x] Translation (DeepL + on-prem NLLB for sovereignty) — `services/nlp/src/translator.ts` (DeepLTranslator, NLLBTranslator, FallbackTranslator chain)
- [x] NER tuned for mil/geo entities (units, equipment, regions, equipment models) — `services/nlp/src/ner.ts` (RegexNER: military units, weapons, UA/EU cities + Cyrillic patterns; ModelNER REST; EnsembleNER merging both)
- [x] Event classification (Tier 1: ~30 classes — strike, drone, missile, fire, outage, troop-move, cyber, civil-alert, etc.) — `services/nlp/src/classifier.ts` (KeywordClassifier with UA/EN rules + ModelClassifier fallback)
- [x] Sentiment / stance for misinfo signals — `services/nlp/src/sentiment.ts`: `analyseSentiment()` with polarity lexicon (conflict-domain), stance detection (pro_ukraine/pro_russia/neutral/unclear), `analyseSentimentBatch()`
- [x] Summarization (per event, per cluster, per region/day) — `services/nlp/src/summarizer.ts` (LLMSummarizer Claude/OpenAI, ExtractiveSummarizer TF-fallback, FallbackSummarizer chain)
- [x] Embeddings (multilingual; bge-m3 or proprietary) → Qdrant — `services/nlp/src/embedder.ts` (OpenAIEmbedder, LocalEmbedder bge-m3, NullEmbedder, cosineSimilarity util)

### OCR
- [x] Image OCR (Tesseract + PaddleOCR for Cyrillic) — `services/nlp/src/ocr.ts` (`OcrEngine` interface, `RestOcrEngine` for Tesseract/PaddleOCR, `EnsembleOcrEngine` keeping higher-confidence regions, `StubOcrEngine` offline fallback; ukr+rus+eng `langHint`, per-region confidence + bbox + script)
- [x] Video frame OCR sampling — `services/nlp/src/ocr.ts` (`VideoFrameOcr` over pre-extracted frames, `sampleTimestamps()` cadence, min-confidence + consecutive-dedupe for persistent chyrons → `VideoOcrResult`)
- [x] Document OCR (PDFs from press releases / leaks) — `services/nlp/src/ocr.ts` (`DocumentOcr` over rendered PDF page images → page-ordered `DocumentOcrResult` with mean page confidence)

### STT
- [x] Whisper-large-v3 + diarization — `services/nlp/src/stt.ts` (`WhisperTranscriber` REST engine w/ logprob→0-1 confidence, `RestDiarizer` + `attachSpeakers()` time-overlap merge, `transcribeWithSpeakers()`, `StubTranscriber` offline fallback)
- [x] Per-language calibration (UK, RU, EN priority) — `services/nlp/src/stt.ts` (`DECODE_PROFILES` uk/ru/en w/ domain `initialPrompt`, temperature, beamSize, minSegmentConfidence; `resolveDecodeProfile()` default fallback)
- [x] PII redaction pre-storage — `services/ingest/src/pii.ts` (redactPII: phone, email, UA passport, GPS coords)

### Pipelines
- [x] Streaming inference path (low-latency, partial results) — `services/nlp/src/pipeline.ts` (NLPPipeline, parallel Promise.allSettled, per-stage error isolation)
- [x] Batch path (cheap nightly reprocessing) — `services/nlp/src/batch.ts` (`BatchProcessor` over async `BatchSource`, bounded concurrency, checkpoint/resume via `resumeAfterId`, per-record error isolation, `onProgress`/`onResult` sinks; reuses the streaming `NLPPipeline`)
- [x] Human-review queue UI for low-confidence outputs — `services/nlp/src/review-queue.ts` (`ReviewQueue` + `evaluateForReview()` routing on low language/classification/NER confidence, ambiguous stance, toxicity; `computePriority()`, en+uk reason strings, reviewer-decision tracking — data/triage layer the web UI binds to)
- [x] Evaluation set + regression dashboard per model — `services/nlp/src/eval/` (`golden-set.ts` labelled EN/UK/RU cases, `runner.ts` `runEval()` + per-metric class/NER-F1/sentiment/stance accuracy + `formatEvalReport()`)

## i18n
- This module is the i18n engine. EN/UK/RU are tier-1 today; PL/DE/RO tier-2; others scale-up.

### Примітки
Don't ship a single closed LLM for everything — keep an open-weights fallback for sovereignty/cost.
