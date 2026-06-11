# `@ua-map/nlp` — Compliance, Licensing & Operational Notes

NLP service: language detection, translation, NER, classification, sentiment/stance,
summarization, embeddings, OCR, STT, batch reprocessing, and the human-review queue.
This document records the third-party models/APIs the service can call, their license
and ToS constraints, and the environment variables that configure them. **No secrets
are hardcoded — all credentials and endpoints are read from `process.env`.**

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `summarizer.ts` (LLMSummarizer) | Claude API key for summarization. |
| `OPENAI_API_KEY` | `summarizer.ts`, `embedder.ts` | OpenAI summaries / embeddings. |
| `DEEPL_API_KEY` | `translator.ts` | DeepL translation (commercial). |
| `NLLB_ENDPOINT` | `translator.ts` | Self-hosted NLLB (on-prem sovereignty fallback). |
| `LANG_DETECT_ENDPOINT` | `language-detect.ts` | fastText `lid.176` REST server. |
| `NER_ENDPOINT` | `ner.ts` | Self-hosted fine-tuned NER server. |
| `CLASSIFIER_ENDPOINT` | `classifier.ts` | Self-hosted event-classifier server. |
| `EMBEDDING_ENDPOINT` | `embedder.ts` (LocalEmbedder) | bge-m3 / OpenAI-compatible embeddings. |
| `OCR_ENDPOINT` | `ocr.ts` (RestOcrEngine) | Self-hosted Tesseract / PaddleOCR server. |
| `WHISPER_ENDPOINT` | `stt.ts` (WhisperTranscriber) | Self-hosted Whisper-large-v3 server. |
| `DIARIZATION_ENDPOINT` | `stt.ts` (RestDiarizer) | Self-hosted pyannote diarization server. |

## Model / API licensing

- **Claude (Anthropic)** — commercial API. House default is the latest Claude models
  (Opus 4.x / Sonnet 4.x / Haiku 4.x); the summarizer's default id is configurable,
  do not hardcode deprecated ids. Subject to Anthropic Usage Policies; do not send
  PII that has not been redacted (`services/ingest/src/pii.ts` runs pre-storage).
- **OpenAI** — commercial API (summaries + embeddings). OpenAI Business Terms apply.
- **DeepL** — commercial translation API. Output may be stored/republished per DeepL
  API terms; attribution not required but source provenance is retained on events.
- **NLLB-200 (Meta)** — CC-BY-NC-4.0 weights. **Non-commercial only.** Use the on-prem
  NLLB path for internal sovereignty processing; do NOT use NLLB output in a paid
  commercial offering without a separate license. DeepL is the commercial path.
- **fastText `lid.176`** — CC-BY-SA-3.0 / MIT code. Redistribution requires attribution.
- **bge-m3 (BAAI)** — MIT license. Self-hostable, commercial use permitted.
- **Whisper-large-v3 (OpenAI)** — MIT license. Self-hostable, commercial use permitted.
- **Tesseract** — Apache-2.0. **PaddleOCR** — Apache-2.0. Both commercial-OK, self-hosted.
- **pyannote.audio (diarization)** — MIT code; some pretrained pipelines require accepting
  Hugging Face gated terms (non-commercial for certain checkpoints). Verify the specific
  checkpoint license before commercial deployment; the diarizer degrades gracefully if
  the endpoint is absent.

## Codeable-contract status (no bundled weights)

`ocr.ts` and `stt.ts` are typed interfaces + REST clients + offline stubs. No model
weights are bundled. With no endpoint configured the stubs return empty, zero-confidence
results so OCR/STT are optional enrichment stages, never hard dependencies.

## Data handling

- PII is redacted pre-storage upstream (`services/ingest/src/pii.ts`) before any text is
  sent to a third-party API.
- Low-confidence and toxicity/disinfo-flagged outputs are routed to the human-review
  queue (`review-queue.ts`) rather than auto-published — a moderation control for YMYL
  conflict reporting.
- Batch reprocessing (`batch.ts`) reuses the same pipeline; no separate data path or
  retention rule.
