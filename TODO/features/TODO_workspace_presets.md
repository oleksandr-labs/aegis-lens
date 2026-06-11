# TODO — Workspace Presets & Saved Views

## Goal
Freeze any combination of layers/filters/time/AOI/AI-state as a reusable, shareable view.

## Progress
- 8 / 10 done (Sprint 2.60 — preset→dashboard, public gallery, persona library, JSON import/export)

## Tasks
- [x] Save current workspace state (map view + filters + active layers + timeline window) — `WorkspacePreset` in `apps/web/src/lib/presets-store.ts`: mapView, filters, activeLayers, timelineWindow
- [x] Name + tag presets — `name`, `description`, `tags[]` in WorkspacePreset; filterable by tag via `GET /api/presets?tag=<slug>`
- [x] Per-user library + org library — `ownerId` + `orgId` + `isPublic` on preset; `GET /api/presets`, `PATCH /api/presets/:id`, `DELETE`
- [x] Share preset via signed URL (with optional expiry) — `POST /api/presets/:id/share`; generates share token + expiry; URL `/views/<shareToken>`
- [x] Preset → dashboard (one-click convert) ✓ Sprint 2.60 — Apply preset navigates to dashboard with widgets
- [ ] Preset → alert rule
- [ ] Preset → report subscription
- [x] Public preset gallery (curated, SEO surfaces — `/views/<slug>`) ✓ Sprint 2.60 — /presets gallery + /presets/[id] detail
- [x] Per-persona starter preset library ✓ Sprint 2.60 — 5 persona presets (analyst/journalist/ngo/maritime/cyber)
- [x] Import / export preset as JSON ✓ Sprint 2.60 — export/import buttons in DashboardClient

## i18n
- Preset titles/descriptions localizable; the underlying filter state is locale-agnostic.

### Примітки
Presets are the unit of expertise: senior analysts can package their workflow into one share-link.
