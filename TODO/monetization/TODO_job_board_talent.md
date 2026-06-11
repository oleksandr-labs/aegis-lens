# TODO — Job Board / Talent Marketplace

## Goal
Niche OSINT / intel / verification job board + freelance marketplace. Captures hiring spend in a small but specific market; complements directory of experts.

## Progress
- 9 / 9 done

## Products
- [x] **Job postings** ($299–999 per posting, 30 days) — apps/web/src/lib/jobs/job-board.ts
- [x] **Featured job** (+$200) — apps/web/src/lib/jobs/job-board.ts
- [x] **Annual employer subscription** ($2,499) — unlimited postings + talent search — apps/web/src/lib/jobs/job-board.ts
- [x] **Freelance marketplace** — verified contributors bookable for short gigs (we take 10–15%) — apps/web/src/lib/jobs/job-board.ts
- [x] **Talent search** — recruiter search across opt-in profiles ($499 / mo) — apps/web/src/lib/jobs/job-board.ts
- [x] **Candidate certification surfacing** — Academy graduates appear with badge — apps/web/src/lib/jobs/job-board.ts
- [x] **Resume / portfolio hosting** for verified analysts — apps/web/src/lib/jobs/job-board.ts

## Mechanics
- [x] Stripe Checkout — apps/web/src/lib/jobs/job-checkout.ts
- [x] Moderation queue (no scam / sketchy postings) — apps/web/src/lib/jobs/job-board.ts (JOB_MODERATION_NOTE_EN/UK)
- [x] No postings from sanctioned / surveillance-vendor categories — apps/web/src/lib/jobs/job-board.ts (JOB_PROHIBITED_CATEGORIES_EN/UK)
- [x] Built atop [../directory/TODO_experts_directory.md](../directory/TODO_experts_directory.md) — apps/web/src/lib/jobs/experts-integration.ts

## Linked files
- [../directory/TODO_experts_directory.md](../directory/TODO_experts_directory.md)
- [TODO_contributor_revshare.md](TODO_contributor_revshare.md)
- [TODO_academy_certification.md](TODO_academy_certification.md)

### Примітки
Окремий потік, корисний для SEO + community. Не пріоритет до Phase 3.
