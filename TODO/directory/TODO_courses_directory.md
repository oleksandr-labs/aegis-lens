# Directory — Courses (OSINT / Intel / Cyber)

## Progress
4/4 done — Sprint 2.68 (2026-06-10)

## URLs
- `/courses-directory` · `/courses-directory/<slug>` · `/courses-directory/<category>`

## Content
- [x] Per-course: provider · price · format · level · syllabus · reviews — `apps/web/src/lib/directory/courses.ts` (CourseProfile interface with provider_en/uk, priceUsd, format, ratingAvg, COURSE_CERTIFICATION_NOTE)
- [x] Schema.org `Course` — COURSE_SCHEMA_NOTE_EN/UK + `apps/web/src/app/api/v1/directory/courses/route.ts`
- [x] Filter by level / language / format / price — CourseFormat type, CourseTopic type, free/priceUsd/language fields, COURSE_TOPIC_CONFIG
- [x] "Best OSINT courses" listicle programmatic — COURSE_PROGRAMMATIC_NOTE_EN/UK (/courses-directory/<topic> and /courses-directory/<format> routes)
