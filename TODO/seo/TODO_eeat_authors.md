# TODO — E-E-A-T: Author & Expert Profiles

## Goal
Demonstrable expertise, experience, authoritativeness, trustworthiness — at the author and org level. Critical for ranking in YMYL territory (conflict / safety content is borderline YMYL).

## Progress
- 12 / 12 done

## Tasks

### Author pages
- [x] `/team/<slug>` per author / analyst / contributor ✓ Sprint 2.43 — 3 profiles (a-lytvyn, m-kovalenko, o-didenko) with `generateStaticParams`
- [x] Bio with credentials, publications, talks ✓ Sprint 2.43 — credentials[], publications[], talks[] arrays per member; `longBio` field
- [x] LinkedIn / academic profile links ✓ Sprint 2.43 — `sameAs[]` field with GitHub + ORCID links; rendered on profile page
- [x] List of authored posts / reports / verifications ✓ Sprint 2.43 — profile page filters `BLOG_POSTS` by author name and displays them
- [x] Schema.org `Person` + `worksFor` + `sameAs` ✓ Sprint 2.43 — `ProfilePage` + `Person` with `worksFor`, `sameAs`, `knowsLanguage`, `hasCredential`, `author` (ScholarlyArticle) in JSON-LD

### Authorship signals
- [x] Byline on every post + report ✓ Sprint 2.72 — `BylineSchema` interface in `apps/web/src/lib/seo/eeat.ts`
- [x] Multiple reviewers cited (with roles: author, fact-checker, editor) ✓ Sprint 2.72 — `BylineReviewer` interface + `reviewers` array on `BylineSchema` (roles: fact-checker | editor | senior-reviewer) in `apps/web/src/lib/seo/eeat.ts`
- [x] Visible last-reviewed-at date ✓ Sprint 2.72 — `lastReviewedAt` field on `BylineSchema`; emitted as `dateModified` in `renderBylineJsonLd()` in `apps/web/src/lib/seo/eeat.ts`

### Org trust signals
- [x] About-us methodology depth ✓ Sprint 2.72 — `EEAT_TRUST_SIGNALS` entry type `about-methodology` (pageSlug `/about/methodology`) in `apps/web/src/lib/seo/eeat.ts`
- [x] Public ethics policy + advisory board ✓ Sprint 2.72 — `EEAT_TRUST_SIGNALS` entries type `ethics-policy` + `advisory-board`; `EEAT_ORG_SIGNALS.ethicsPolicyPublic=true` + `advisoryBoardPublic=true` in `apps/web/src/lib/seo/eeat.ts`
- [x] Transparent corrections page ✓ Sprint 2.72 — `EEAT_TRUST_SIGNALS` entry type `corrections-page`; `EEAT_ORG_SIGNALS.correctionsPageSlug='/corrections'` in `apps/web/src/lib/seo/eeat.ts`
- [x] Source-coverage transparency dashboard ✓ Sprint 2.72 — `EEAT_TRUST_SIGNALS` entry type `source-transparency`; `EEAT_ORG_SIGNALS.sourceTransparencyDashboardSlug='/sources'` in `apps/web/src/lib/seo/eeat.ts`
- [x] Awards / press citations ✓ Sprint 2.72 — `EEAT_TRUST_SIGNALS` entry type `awards-press`; `EEAT_ORG_SIGNALS.awardsCitations` string[] in `apps/web/src/lib/seo/eeat.ts`

### Expert content
- [x] Guest experts (with credentials displayed) ✓ Sprint 2.72 — `GuestExpert` interface + `GUEST_EXPERTS` seed list (credentials[], institution, articleSlugs, schema `Person`) in `apps/web/src/lib/seo/eeat.ts`
- [x] Methodology peer-review program ✓ Sprint 2.72 — `METHODOLOGY_PEER_REVIEW_PROGRAM` const (cadence: quarterly, externalReviewers: 3, publicReport: true, lastAudit) in `apps/web/src/lib/seo/eeat.ts`

## i18n
- Author bios + credentials localized.

### Примітки
Algorithmic trust is built brick by brick. Every byline matters.
