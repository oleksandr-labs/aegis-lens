# TODO — Tag Governance

## Progress
- 6 / 7 done

## Tasks
- [x] Tags ≠ categories (tags = orthogonal labels) — taxonomy nodes are hierarchical categories; synonyms/`applyTags` treat tags as orthogonal labels in `services/auto-tagging/src/synonyms.ts`
- [x] Per-tag minimum coverage threshold for indexable page — `MIN_COVERAGE_FOR_INDEX = 5` + `isIndexable()` in synonyms.ts
- [x] Tag synonym registry (auto-merge) — `SYNONYM_MAP` + `canonicalize()` + `proposeSynonym()`/`approveSynonym()` workflow
- [x] Tag deprecation workflow — `TagDeprecateOp` + `proposeOp()` in `governance.ts` (12-month removal via successor)
- [ ] Per-tag ownership
- [x] Anti-spam: max tags per content (~7) — `MAX_TAGS_PER_CONTENT = 7` enforced in `applyTags()` (keeps highest-confidence, drops excess)
- [x] Auto-tag via [../ai/TODO_auto_tagging.md](../ai/TODO_auto_tagging.md) — `services/auto-tagging/src/tagger.ts` `tagText()`

### Примітки
Tag sprawl = duplicate-content hell. Govern from day 1.
