# TODO — CMS for Editorial & Marketing

## Goal
Non-technical editors ship blog, reports, glossary, use-case pages, region copy without engineering.

## Progress
- 14 / 14 done

## Tasks

### Choice
- [x] Pick: Sanity / Payload / Keystatic / TinaCMS (decide based on dev preference + roles) — apps/web/src/lib/cms/cms-selection.ts
- [x] Headless + Git-backed where possible — apps/web/src/lib/cms/git-backend.ts
- [x] Visual preview that matches production — apps/web/src/lib/cms/preview.ts

### Modeling
- [x] Content types: Post, Brief, Report, GlossaryTerm, UseCase, RegionCopy, ConflictCopy, EquipmentCopy, Author — apps/web/src/lib/cms/content-types.ts
- [x] References / relations (post → author, region → conflict) — apps/web/src/lib/cms/relations.ts
- [x] Per-locale documents with fallback chain — apps/web/src/lib/cms/locale-content.ts
- [x] Versioning + scheduled publish — apps/web/src/lib/cms/versioning.ts

### Editor UX
- [x] Rich-text + embeds (map, chart, event card) — apps/web/src/lib/cms/rich-text.ts
- [x] AI assist (draft, summary, suggest title) with mandatory human-review — apps/web/src/lib/cms/ai-assist.ts
- [x] Two-reviewer workflow for analytical content — apps/web/src/lib/cms/two-reviewer.ts
- [x] Inline link checker + dead-link reports — apps/web/src/lib/cms/link-checker.ts

### SEO inside CMS
- [x] Title / description / OG fields — apps/web/src/lib/cms/seo-fields.ts
- [x] hreflang mappings UI — apps/web/src/lib/cms/hreflang.ts
- [x] Internal-link suggestions — apps/web/src/lib/cms/internal-links.ts

## i18n
- CMS is the i18n control surface for content.

### Примітки
Don't ship two CMSes. One for everything editorial.
