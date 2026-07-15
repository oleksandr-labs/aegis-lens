# Programmatic Template — Conflict-vs-Conflict Comparison

## Goal
Cross-conflict comparison content (casualties, displacement, territory, duration, aid $) across the 8 tracked conflicts — distinct from `pages/TODO_comparisons.md`/`programmatic/TODO_template_compare.md`, which are exclusively platform-vs-platform ("Aegis Lens vs Palantir"). Data-journalism-style comparison content is highly linkable/shareable and has near-zero direct competitor coverage in this exact cross-conflict form.

## Progress
- 0 / 5 done

## URLs
- `/conflicts/compared` (matrix overview, all 8) · `/conflicts/compared/<a>-vs-<b>` (pairwise deep dive, e.g. `/conflicts/compared/ua-ru-vs-sudan`)

## Tasks
- [ ] `/conflicts/compared` matrix page: sortable table across all 8 conflicts (`conflicts/TODO_conflict_framework.md` list) — casualties, displaced, duration, territory contested, active aid $, verification status
- [ ] `/conflicts/compared/<a>-vs-<b>` pairwise page: side-by-side stat cards + shared timeline overlay + narrative context (scale disparity caveats — avoid false-equivalence framing)
- [ ] Reuse existing `keyStats[]` fields already defined per-conflict in `pages/TODO_conflicts.md` — no new data pipeline required, purely a presentation/aggregation layer
- [ ] Cross-link to `topical_hubs/TODO_hub_international_aid.md` (aid $ column) and `topical_hubs/TODO_hub_reconstruction.md`
- [ ] FAQPage JSON-LD (10 Q&A) + `Dataset`/`Table` structured data; editorial disclaimer on comparing incommensurable conflicts (methodology note, avoid clickbait "worst conflict" framing)

## Notes
- Highest-confidence, lowest-effort finding of the round-2 gap pass (2026-07-12) — pure presentation reuse of existing per-conflict stats.

## i18n
- EN + UK; comparison framing requires extra editorial care in translation (avoid amplifying one conflict over another through word choice).
