# TODO — Experts Directory

## Goal
Verified analysts, journalists, academics, advisors. Doubles as E-E-A-T signal and hiring funnel.

## Progress
- 9 / 9 done

## Tasks
- [x] `/experts` + `/experts/<slug>` — `apps/web/src/lib/directory/experts.ts` + `apps/web/src/app/api/v1/directory/experts/route.ts`
- [x] Per-profile: bio, credentials, publications, regions / topics, availability — `ExpertProfile` interface in `experts.ts`
- [x] Schema.org `Person` — `buildExpertSchemaOrg()` helper in `experts.ts`
- [x] Verification process (LinkedIn / publication / employer check) — `EXPERT_VERIFICATION_PROCESS_EN/UK` in `experts.ts`
- [x] Booking / contact request flow — `EXPERT_BOOKING_NOTE_EN/UK` in `experts.ts`
- [x] Tied into [../seo/TODO_eeat_authors.md](../seo/TODO_eeat_authors.md) — `EXPERT_EEAT_NOTE_EN/UK` + `linkedToEeat` field in `experts.ts`
- [x] Programmatic per topic / per region — `EXPERT_PROGRAMMATIC_NOTE_EN/UK` in `experts.ts`
- [x] Featured-expert paid tier (with disclosure) — `EXPERT_FEATURED_NOTE_EN/UK` + `featuredTier` field in `experts.ts`
- [x] Privacy default: opt-in to public listing — `EXPERT_PRIVACY_NOTE_EN/UK` + `privacyOptIn` field in `experts.ts`

## i18n
- Profile in expert's working languages.

### Примітки
Real experts only. One fake profile damages credibility for years.
