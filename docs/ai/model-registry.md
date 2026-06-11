# AI Model Registry — Aegis Lens

All deployed models must be registered here before production deployment.
Update on every version bump; mark status clearly.

## Model Card Template

```
Model ID:       [unique slug, e.g. "nlp-classifier-v1.2"]
Purpose:        [what problem it solves]
Architecture:   [e.g. DeBERTa-v3-base, fine-tuned]
Training data:  [description + data cutoff; no PII in training]
License:        [Apache 2.0 / MIT / CC BY 4.0 / commercial]
Owner:          @team or @person
Status:         development | staging | production | deprecated
Deployed:       YYYY-MM-DD
Last eval:      YYYY-MM-DD
Eval suite:     [link to eval results]

Known limitations:
- [e.g. Lower recall for Russian-language military slang]
- [e.g. Tested on UA events only; accuracy lower for non-UA context]

EU AI Act risk class:  minimal | limited | high | unacceptable
```

---

## Registered Models

### nlp-classifier-v0.3
```
Model ID:       nlp-classifier-v0.3
Purpose:        Event class + subclass classification (30 classes)
Architecture:   KeywordClassifier (regex ensemble) + REST ModelClassifier fallback
Training data:  N/A (keyword rules hand-crafted from OSINT corpus)
License:        Internal
Owner:          @nlp-team
Status:         production
Deployed:       2024-03-01
Last eval:      2024-03-01
Eval suite:     TBD

Known limitations:
- Rule-based; brittle for novel terminology
- EN/UK only; no RU support yet

EU AI Act risk class:  limited
```

### nlp-ner-v0.2
```
Model ID:       nlp-ner-v0.2
Purpose:        Named entity recognition (equipment, units, locations)
Architecture:   RegexNER + EnsembleNER
Training data:  N/A (pattern-based)
License:        Internal
Owner:          @nlp-team
Status:         production
Deployed:       2024-03-01
Last eval:      2024-03-01
Eval suite:     TBD

Known limitations:
- Pattern-based; misses novel model names
- Transliteration coverage: UA cities only

EU AI Act risk class:  minimal
```

### anomaly-baseline-v0.1
```
Model ID:       anomaly-baseline-v0.1
Purpose:        Time-series Z-score anomaly detection per region × event class
Architecture:   Rolling 7-day ring buffer + EWMA
Training data:  N/A (statistical baseline, no ML model)
License:        Internal
Owner:          @data-team
Status:         production
Deployed:       2024-03-15
Last eval:      2024-03-15
Eval suite:     TBD

Known limitations:
- Requires ≥7 days of history per region×class; cold-start period
- No seasonal decomposition; may generate false positives on Mondays

EU AI Act risk class:  minimal
```

### vision-exif-v0.1
```
Model ID:       vision-exif-v0.1
Purpose:        EXIF extraction + GPS/timestamp consistency check
Architecture:   Rule-based parser
Training data:  N/A
License:        Internal
Owner:          @vision-team
Status:         production
Deployed:       2024-04-01
Last eval:      N/A

Known limitations:
- Does not validate EXIF on non-JPEG formats
- GPS accuracy depends on device

EU AI Act risk class:  minimal
```

---

## Promotion Checklist (staging → production)

- [ ] Eval suite passing on held-out test set (not training data)
- [ ] Shadow comparison with current production model (≥1 week)
- [ ] Model card complete (purpose, limitations, EU AI Act class)
- [ ] Security review if model processes user-provided content
- [ ] Latency p95 within SLA (< 500ms for inline, < 5s for batch)
- [ ] Rollback plan documented (previous version tagged in registry)
- [ ] Cost estimate per prediction reviewed by tech lead
- [ ] Per-locale eval run (EN + UK at minimum)
