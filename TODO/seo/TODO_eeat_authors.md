# TODO — E-E-A-T: Author & Expert Profiles

## Goal
Demonstrable expertise, experience, authoritativeness, trustworthiness — at the author and org level. Critical for ranking in YMYL territory (conflict / safety content is borderline YMYL).

## Progress
- 5 / 12 done

## Tasks

### Author pages
- [x] `/team/<slug>` per author / analyst / contributor ✓ Sprint 2.43 — 3 profiles (a-lytvyn, m-kovalenko, o-didenko) with `generateStaticParams`
- [x] Bio with credentials, publications, talks ✓ Sprint 2.43 — credentials[], publications[], talks[] arrays per member; `longBio` field
- [x] LinkedIn / academic profile links ✓ Sprint 2.43 — `sameAs[]` field with GitHub + ORCID links; rendered on profile page
- [x] List of authored posts / reports / verifications ✓ Sprint 2.43 — profile page filters `BLOG_POSTS` by author name and displays them
- [x] Schema.org `Person` + `worksFor` + `sameAs` ✓ Sprint 2.43 — `ProfilePage` + `Person` with `worksFor`, `sameAs`, `knowsLanguage`, `hasCredential`, `author` (ScholarlyArticle) in JSON-LD

### Authorship signals
- [ ] Byline on every post + report
- [ ] Multiple reviewers cited (with roles: author, fact-checker, editor)
- [ ] Visible last-reviewed-at date

### Org trust signals
- [ ] About-us methodology depth
- [ ] Public ethics policy + advisory board
- [ ] Transparent corrections page
- [ ] Source-coverage transparency dashboard
- [ ] Awards / press citations

### Expert content
- [ ] Guest experts (with credentials displayed)
- [ ] Methodology peer-review program

## i18n
- Author bios + credentials localized.

### Примітки
Algorithmic trust is built brick by brick. Every byline matters.
