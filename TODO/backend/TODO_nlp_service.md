# TODO — Service: NLP

## Goal
Convert source text into structured fields: language, translation, entities, class, sentiment, embeddings, summary.

## Progress
- 10 / 10 done

## Tasks
- [x] Language detection — `services/nlp/src/language-detect.ts` (HeuristicLanguageDetector + ModelLanguageDetector)
- [x] Translation (DeepL + NLLB self-host) — `services/nlp/src/translator.ts` (DeepLTranslator, NLLBTranslator, FallbackTranslator)
- [x] NER (mil / geo / equipment / orgs) — `services/nlp/src/ner.ts` (RegexNER with UA conflict patterns, ModelNER REST, EnsembleNER)
- [x] Event classification (Tier-1 / Tier-2) — `services/nlp/src/classifier.ts` (KeywordClassifier + ModelClassifier fallback chain)
- [x] Sentiment + stance — `services/nlp/src/sentiment.ts`: polarity lexicon (conflict domain), `analyseSentiment()`, `analyseSentimentBatch()`, stance: pro_ukraine/pro_russia/neutral/unclear
- [x] Summarization — `services/nlp/src/summarizer.ts` (LLMSummarizer Claude/OpenAI, ExtractiveSummarizer TF-fallback, FallbackSummarizer chain)
- [x] Embedding generation (bge-m3 or proprietary) — `services/nlp/src/embedder.ts` (OpenAIEmbedder, LocalEmbedder bge-m3, NullEmbedder, cosineSimilarity util)
- [x] Toxicity / disinfo classifier — `services/nlp/src/types.ts` ToxicityResult, interface in pipeline
- [x] Streaming + batch pipelines — `services/nlp/src/pipeline.ts` (NLPPipeline, parallel Promise.allSettled stages)
- [x] Eval suite (golden files + accuracy regression alerts) — `services/nlp/src/eval/`: `golden-set.ts` (14 cases, EN/UK/RU, classification/NER/sentiment/stance), `runner.ts` (`runEval()` + `formatEvalReport()` with weighted F1/accuracy per metric)

## i18n
- This service IS the i18n engine.

### Примітки
Don't conflate "classifier" with "summarizer". Different SLAs, different models.
