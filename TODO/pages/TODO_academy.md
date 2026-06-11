# TODO — Academy / Learning Paths

## Goal
Structured learning: OSINT 101 → advanced geolocation, verification, AI-for-intel. Lead-gen + brand authority.

## Progress
- 8 / 10 done

## Tasks
- [x] `/academy` index with paths (Beginner / Journalist / Analyst / NGO worker) ✓ Sprint 2.10 (4 seed paths: osint-101, geolocation-fundamentals, verification-workflow, ai-for-analysts)
- [x] Per-path: modules → lessons → quizzes → certificate (badge) ✓ Sprint 2.10 (lessons + certificate slug per path; quiz UI deferred)
- [x] Video + text + interactive map exercises ✓ Sprint 2.58 — text lessons + interactive placeholder per lesson
- [x] Progress tracking per user ✓ Sprint 2.58 — LessonProgress (localStorage per course)
- [ ] Certificates with verification URL — slug exposed in JSON-LD `Course`, but verification endpoint not built
- [x] Free tier (basics) + paid tier (deep) ✓ Sprint 2.58 — free/locked lesson gating UI
- [x] Per-lesson schema.org `Course` / `LearningResource` ✓ Sprint 2.10 (Course + N LearningResource nodes per lesson with `timeRequired`)
- [x] Discoverable from `/use-cases/*` ✓ Sprint 2.52 — `academyPathSlugs?: string[]` field added to `UseCaseTask` type; 4 tasks seeded with Academy path slugs (`verify-a-photo`, `investigation-research`, `documenting-civilian-harm`, `geolocation`); "Academy learning paths" section rendered on task detail pages (`use-cases/[vertical]/[task]/page.tsx`) with level badge, summary, hours + lesson count
- [ ] Programmatic course → topic landing
- [x] hreflang per locale ✓ Sprint 2.10 (buildMetadata pathFor on index + detail)

## i18n
- EN + UK launch; expand by demand.

### Примітки
Academy doubles as recruiting funnel (top students = hiring leads).
