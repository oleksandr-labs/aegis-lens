# TODO — AI Usage Disclosure

## Goal
Clear public statement: which AI models we use, where, on what data, with what guardrails.

## Progress
- 9 / 9 done

## Tasks
- [x] Per-feature AI model disclosure (Claude / OpenAI / open-weights) — apps/web/src/lib/transparency/ai-disclosure.ts (AI_FEATURE_DISCLOSURES)
- [x] Training-data posture (we don't train on user / source data without consent) — apps/web/src/lib/transparency/ai-disclosure.ts (TRAINING_DATA_POSTURE)
- [x] Per-model evaluation scores public — apps/web/src/lib/transparency/ai-disclosure.ts (AI_FEATURE_DISCLOSURES)
- [x] Per-feature known limitations — apps/web/src/lib/transparency/ai-disclosure.ts (AI_FEATURE_DISCLOSURES)
- [x] AI-generated content visibly labeled — apps/web/src/lib/transparency/ai-disclosure.ts (AI_CONTENT_LABELING_RULE)
- [x] User opt-out of AI features (where reasonable) — apps/web/src/lib/transparency/ai-disclosure.ts (AI_OPT_OUT_POLICY)
- [x] Annual model-card publication per major model — apps/web/src/lib/transparency/ai-disclosure.ts (MODEL_CARD_PUBLICATION_POLICY)
- [x] EU AI Act risk classification declared — apps/web/src/lib/transparency/ai-disclosure.ts (AI_FEATURE_DISCLOSURES)
- [x] Per-locale availability of AI features documented — apps/web/src/lib/transparency/ai-disclosure.ts (AI_LOCALE_AVAILABILITY)

## i18n
- Disclosure localized.

### Примітки
EU AI Act + customer trust = both depend on this. Build the page early.
