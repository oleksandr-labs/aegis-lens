# TODO — Academy & Certification

## Goal
Monetize education: paid courses, exams, and "Certified OSINT Analyst" credential. Builds talent pipeline + drives SaaS attach.

## Progress
- 14 / 14 done

## Products
- [x] **Free courses** (intro / explainer) — top-of-funnel SEO — `apps/web/src/lib/academy/course-catalog.ts`
- [x] **Paid courses** ($99–499) — verification, geolocation, advanced Copilot, vertical playbooks — `apps/web/src/lib/academy/course-catalog.ts`
- [x] **Cohort-based bootcamp** ($999–2,999) — instructor-led, 4–8 weeks, with TA, real cases — `apps/web/src/lib/academy/course-catalog.ts`
- [x] **Certification exam** ($199–399) — proctored, time-boxed — `apps/web/src/lib/academy/certification.ts`
- [x] **Re-certification** ($99 / yr) — keeps credential current — `apps/web/src/lib/academy/certification.ts`
- [x] **Corporate training** ($5–25k) — private cohort for an org → also [TODO_professional_services.md](TODO_professional_services.md) — `apps/web/src/lib/academy/course-catalog.ts`
- [x] **For partners** — required for partner program tiers; free for active partners — `apps/web/src/lib/academy/course-catalog.ts`

## Mechanics
- [x] LMS (build or buy) — `apps/web/src/lib/academy/lms-config.ts`
- [x] Stripe Checkout — `apps/web/src/lib/academy/lms-config.ts`
- [x] Digital credential (Open Badges / Credly) — `apps/web/src/lib/academy/certification.ts`
- [x] Public credential verification page → LinkedIn share — `apps/web/src/lib/academy/certification.ts`
- [x] Cohort scheduling, calendars, Slack/Discord-of-cohort — `apps/web/src/lib/academy/lms-config.ts`
- [x] Free retake within 30 days — `apps/web/src/lib/academy/certification.ts`
- [x] SCORM / xAPI for enterprise LMS integration — `apps/web/src/lib/academy/lms-config.ts`

## Linked files
- [../pages/TODO_academy.md](../pages/TODO_academy.md)
- [../pages/TODO_guides_library.md](../pages/TODO_guides_library.md)
- [TODO_partner_resell.md](TODO_partner_resell.md)
- [TODO_contributor_revshare.md](TODO_contributor_revshare.md)

### Примітки
Сертифікація — найсильніший community/brand lever, не самий грошовий. Не намагатись робити «грошову мийку» зі студентів.
