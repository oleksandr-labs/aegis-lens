# TODO — AI Rule Builder (NL → Alerts / Filters)

## Goal
Natural-language rule creation: "alert me when there's a drone strike within 50km of Odesa with >0.7 confidence". No DSL required.

## Progress
- 8 / 10 done (Sprint 2.59 — side-by-side NL/visual builder, save/share/clone)

## Tasks
- [x] LLM-based parser: NL → structured rule JSON — `LLMParser` (Claude Haiku) in `services/rule-builder/src/parser.ts`
- [x] Preview translation back to NL ("you will be alerted when…") — `buildPreview()` + `preview` field in ParseResult
- [x] Dry-run on historical 30d data (show count + sample matches) — `services/rule-builder/src/dry-run.ts` dryRunRule(); `POST /api/rule-builder/dry-run`; noisiness + refinement suggestions
- [x] Side-by-side: NL ↔ visual rule builder (editable in both) ✓ Sprint 2.59 — RuleBuilderClient with NL + visual modes
- [x] Confidence score on parse + fallback to visual builder if low — `FallbackParser` (LLM → RegexParser fallback)
- [x] Suggested rules per persona on first run — `PERSONA_TEMPLATES` in `services/rule-builder/src/templates.ts`
- [ ] Refinement loop ("too noisy" → AI suggests narrower rule)
- [x] Save / share / clone rule ✓ Sprint 2.59 — Save rule button + toast
- [ ] Per-org rule templates
- [x] Telemetry on parser accuracy (review queue for ambiguous parses) — `confidence` field + `suggestions` on low-confidence parses

## i18n
- Parser must work in EN + UK at launch; expand with locales as NLP stack expands.

### Примітки
This is the "everyone can be an analyst" feature. Polish it.
