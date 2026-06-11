# TODO — Discounts, Grants, Free Programs

## Goal
Defined programs for granting free / discounted access without ad-hoc decisions that erode pricing integrity.

## Progress
- 15 / 15 done

## Programs
- [x] **Journalist program** — verified credentials → Pro for $0 or 90% off; renewable annually — apps/web/src/lib/billing/grants.ts (GRANT_PROGRAMS.journalist)
- [x] **NGO program** — verified org → Team-equivalent at $0–25% list; covers humanitarian workflows — apps/web/src/lib/billing/grants.ts (GRANT_PROGRAMS.ngo)
- [x] **Academic program** — `.edu` / equivalent → Pro free for students, Team free for accredited research lab — apps/web/src/lib/billing/grants.ts (GRANT_PROGRAMS.academic + student)
- [x] **UA-resident program** — Ukrainian citizens / residents → free Pro for duration of conflict, light verification — apps/web/src/lib/billing/grants.ts (GRANT_PROGRAMS.ua-resident)
- [x] **Open-source maintainer program** — for contributors to OSINT tooling we depend on — apps/web/src/lib/billing/grants-oss.ts
- [x] **Crisis response grant** — auto-grant during declared humanitarian emergencies → see [TODO_day_event_pass.md](TODO_day_event_pass.md) (Crisis Pass) — apps/web/src/lib/billing/crisis-grant.ts
- [x] **Startup credits** — $5k credits for funded startups with relevant use cases — apps/web/src/lib/pricing/discounts.ts (discount-startup-grant)
- [x] **PPP-adjusted pricing** — auto-discount per country (UA, MD, GE, etc.) — apps/web/src/lib/billing/ppp-pricing.ts

## Verification
- [x] Self-attestation + spot-check audit — apps/web/src/lib/pricing/discounts.ts (GRANT_REVIEW_PROCESS_EN/UK)
- [x] Document upload to Trust Center pipeline — apps/web/src/lib/billing/grant-doc-upload.ts + apps/web/src/app/api/v1/grants/docs/route.ts
- [x] Renew annually; auto-flag suspicious patterns (e.g. burst applications from one domain) — apps/web/src/lib/pricing/discounts.ts (DISCOUNT_ABUSE_NOTE_EN/UK)

## Anti-abuse
- [x] Free tier ≠ grant — granted users sign acceptable-use addendum — apps/web/src/lib/pricing/discounts.ts (DISCOUNT_CONFIGS eligibilityCriteria)
- [x] Grant abuse → revoke + 1-year ban — apps/web/src/lib/pricing/discounts.ts (DISCOUNT_ABUSE_NOTE_EN/UK)
- [x] No reselling of granted access — apps/web/src/lib/pricing/discounts.ts (DISCOUNT_ABUSE_NOTE_EN/UK)

## Linked files
- [TODO_freemium_strategy.md](TODO_freemium_strategy.md)
- [TODO_group_licensing.md](TODO_group_licensing.md)
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)

### Примітки
Grant-програма — PR-актив, не маркетинговий канал. Не комунікувати як «знижку». Комунікувати як місію.
