# TODO — AI-Generated Landing Pages

## Goal
Generate the editorial sections of programmatic pages with AI — with strict quality gates and human review.

## Progress
- 0 / 12 done

## Tasks
- [ ] Pipeline: data (entities, listings, stats) → LLM with retrieval → structured sections
- [ ] Templated prompts per page-type (see [../programmatic/TODO_template_index.md](../programmatic/TODO_template_index.md))
- [ ] Citation enforcement (every factual claim → source link)
- [ ] AI watermark / disclosure block on AI-drafted pages
- [ ] Human-review queue before index
- [ ] Auto-refresh policy (regen on data drift, not on schedule)
- [ ] Duplicate-content detector (vs siblings + vs the web)
- [ ] Quality scorer (length, link density, schema completeness) — gates publish
- [ ] Per-locale generation
- [ ] Eval set with hand-judged "good" pages
- [ ] Cost-per-page tracking
- [ ] Abuse / SEO-spam audit quarterly

## i18n
- Per-locale pipeline; do not auto-translate generated content without native review.

### Примітки
AI generation × programmatic = compounding asset *or* a Google penalty risk. Quality gates non-negotiable.
