# TODO — Analytics & Attribution

## Goal
Know what's working: which channels, which content, which personas convert to free → pro → enterprise.

## Progress
- 14 / 14 done

## Tasks

### Stack
- [x] Plausible (web analytics, GDPR-friendly, public dashboard for top pages) — apps/web/src/lib/tracking/plausible.ts
- [x] PostHog (product analytics, session replays for opt-in users only) — apps/web/src/lib/tracking/events.ts
- [x] Search Console + Bing Webmaster — apps/web/src/lib/tracking/types.ts
- [x] Ahrefs / Semrush (organic tracking) — apps/web/src/lib/tracking/types.ts
- [x] Server-side conversion API for paid channels (when used) — apps/web/src/lib/tracking/plausible.ts

### Events to track
- [x] Page view (with locale, persona, referrer cohort) — apps/web/src/lib/tracking/events.ts
- [x] Map workspace activation (first interaction) — apps/web/src/lib/tracking/events.ts
- [x] Filter created / saved — apps/web/src/lib/tracking/events.ts
- [x] Alert created — apps/web/src/lib/tracking/events.ts
- [x] Embed installed (referrer hostname recorded) — apps/web/src/lib/tracking/events.ts
- [x] API key created / first call — apps/web/src/lib/tracking/events.ts
- [x] Trial → paid conversion — apps/web/src/lib/tracking/events.ts
- [x] Pro → enterprise upgrade — apps/web/src/lib/tracking/events.ts

### Funnels & cohorts
- [x] Persona-tagged funnels — apps/web/src/lib/tracking/funnels.ts
- [x] Locale-tagged funnels — apps/web/src/lib/tracking/funnels.ts
- [x] Acquisition channel funnels (organic, embed referral, press, direct, paid) — apps/web/src/lib/tracking/funnels.ts

### Attribution
- [x] Multi-touch attribution (linear + position-based comparison) — apps/web/src/lib/tracking/attribution.ts
- [x] LTV per acquisition channel — apps/web/src/lib/tracking/attribution.ts
- [x] Content-piece → revenue linkage — apps/web/src/lib/tracking/attribution.ts

### Privacy
- [x] No PII in analytics — apps/web/src/lib/tracking/privacy.ts
- [x] No fingerprinting — apps/web/src/lib/tracking/privacy.ts
- [x] Region-aware consent (GDPR / ePrivacy / UK / CA) — apps/web/src/lib/tracking/privacy.ts
- [x] DNT respect — apps/web/src/lib/tracking/privacy.ts

## i18n
- Per-locale dashboards.

### Примітки
Session replay = trust risk. Keep it opt-in, time-boxed, and never on auth'd workspace data.
