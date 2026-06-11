# Template — Courses (Academy)

## URLs
- `/academy/<path>` ✓ Sprint 2.10
- `/academy/<path>/<lesson>` ✓ Sprint 2.19 (skipped module level — current lesson sets are flat under each path)
- `/academy/<path>/<module>/<lesson>` — deferred until paths grow large enough to need module grouping

## Progress
- 4 / 5 done

## Content
- [x] Per-course curriculum ✓ Sprint 2.10 (path index + per-path detail with ordered lessons)
- [x] Per-module description — substituted with per-lesson outcome statements ✓ Sprint 2.19
- [x] Per-lesson schema.org `LearningResource` ✓ Sprint 2.10 (on path detail) + standalone lesson page ✓ Sprint 2.19 (with prev/next + BreadcrumbList)
- [x] Per-path certificate ✓ Sprint 2.10 (`certificate?` slug on paths that issue one)
- [ ] Free / paid tier flags — deferred until pay-gating is wired
