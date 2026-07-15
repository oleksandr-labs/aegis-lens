# TODO — Newsletter Public Archive

## Goal
Public archive of past newsletter issues — signup capture already exists (`apps/web/src/lib/growth/newsletter.ts`, `/api/subscribe`) but issues are not browsable/indexable, losing recurring SEO value each send.

## Progress
- 0 / 4 done

## URLs
- `/newsletter` (signup + archive index) · `/newsletter/<issue-slug>` (per-issue permalink)

## Tasks
- [ ] `/newsletter` index: signup form (reuse existing capture) + reverse-chronological list of past issues
- [ ] `/newsletter/<issue-slug>` permalink page per sent issue (rendered from the same content used for the email send — single source, dual output)
- [ ] RSS feed for the newsletter archive (feeds into `pages/TODO_feeds_index.md`)
- [ ] FAQPage JSON-LD is NOT required here (transactional/archive page, not a content pillar) — note exception in file per global-FAQ-standard scoping

## Notes
- Low effort / high leverage: content already exists per send, this is purely a "publish what you already write" gap.

## i18n
- EN + UK if newsletter is bilingual; otherwise EN-only with clear locale note in signup.
