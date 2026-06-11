# TODO — Anchor Text Strategy

## Goal
Anchors that help search + users. Avoid keyword stuffing; avoid "click here".

## Progress
- 11 / 11 done

## Rules
- [x] Descriptive: anchor describes target ("verify a photo" not "click here") — apps/web/src/lib/seo/anchor-rules.ts (ruleDescriptive, en+uk generic-phrase lists)
- [x] Variety: don't anchor every link the same way (over-optimization signal) — apps/web/src/lib/seo/anchor-rules.ts (ruleVariety: same text → multiple targets)
- [x] Natural keyword inclusion (not stuffing) — apps/web/src/lib/seo/anchor-rules.ts (ruleNaturalKeyword: over-length + repeated-token detection)
- [x] Internal anchors: align with target page's primary keyword (where natural) — apps/web/src/lib/seo/anchor-rules.ts (ruleKeywordAlignment, locale-aware token overlap)
- [x] External anchors: clearly contextualized — apps/web/src/lib/seo/anchor-rules.ts (ruleExternalContext)
- [x] Per-page anchor-text variety lint — apps/web/src/lib/seo/anchor-rules.ts (rulePerPageVariety) + apps/web/src/lib/seo/anchor-lint.ts (varietyScore floor)
- [x] No raw URLs as anchor text — apps/web/src/lib/seo/anchor-rules.ts (ruleNoRawUrl)
- [x] Image alt-text serves as anchor when image is link — apps/web/src/lib/seo/anchor-rules.ts (ruleImageAltAnchor) + apps/web/src/lib/seo/anchor-a11y.ts (imageLinkAlt/accessibleName)
- [x] `aria-label` for icon-only links — apps/web/src/lib/seo/anchor-rules.ts (ruleIconAriaLabel) + apps/web/src/lib/seo/anchor-a11y.ts (iconLinkProps/ICON_LINK_LABELS en+uk)

## Tooling
- [x] Anchor-text audit per template — apps/web/src/lib/seo/anchor-audit.ts (auditTemplate/auditCorpus/isFlagged, thresholds)
- [x] Anchor-text recommender in CMS (suggests natural variants) — apps/web/src/lib/seo/anchor-recommender.ts (recommendAnchors, en+uk lead-in templates, excludes used anchors)

## i18n
- Anchors translated, not transliterated.

### Примітки
Anchor diversity = healthier link profile. Boring sameness flags over-optimization.
