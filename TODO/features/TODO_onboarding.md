# TODO — Onboarding

## Goal
Get every persona to a "wow moment" in their first session — and to a saved-search / watchlist before they leave.

## Progress
- 12 / 12 done (Sprint 2.69 — alert seeds, activation nudge emails, re-engagement campaign)

## Tasks

### Signup → first session
- [x] Persona picker on signup — `GET /api/onboarding/personas`; 9 personas in `services/onboarding/src/personas.ts`
- [x] Per-persona default dashboard + watchlist seeds — `Persona.defaultActiveLayers`, `defaultMapView`, `defaultAlertFilters` per persona
- [x] Per-persona onboarding checklist (5 steps max) — `Persona.onboardingSteps[]` with completionEvent tracking; bilingual EN+UK
- [x] In-product tour (driver.js / Shepherd) for map workspace ✓ Sprint 2.58 — OnboardingTour (6-step modal, localStorage-gated)
- [x] First-run AI copilot prompt ("Ask me what's happening in…") — `Persona.copilotPrompt` + `copilotPromptUk` per persona
- [x] Sample saved searches per persona — `Persona.savedSearches[]` with query + filters per persona
- [x] Sample alerts pre-configured — `services/onboarding/src/alert-seeds.ts`

### Activation milestones
- [x] Track: first map interaction, first filter, first alert created, first share, first export ✓ Sprint 2.58 — OnboardingChecklist (5 activation steps)
- [x] Email nudge on stalled activation (day 1, 3, 7) — `services/onboarding/src/activation-emails.ts`
- [x] Re-engagement campaign (day 14, 30) — `services/onboarding/src/reengagement.ts`

### Empty states
- [x] Every empty state has a "do this next" CTA ✓ Sprint 2.58 — EmptyState presets with action CTAs
- [x] Skeleton loaders, never blank flash ✓ Sprint 2.58 — Skeleton components + shimmer (Sprint 2.60)

## i18n
- Onboarding content fully localized; tour copy short to ease translation.

### Примітки
Time-to-wow target: < 60 seconds for civilians, < 3 min for analysts.
