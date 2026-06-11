# TODO — Travel Risk Module

## Goal
Per-city / per-route risk scoring + briefings for travelers and corporate security teams.

## Progress
- 12 / 12 done

## Tasks

### Scoring
- [x] City-level risk index (composite: events, infrastructure, civil unrest, weather, health, crime where lawful) — `computeCompositeRisk()` in `services/travel-risk/src/scorer.ts`
- [x] Route risk (origin → destination, multi-leg) — `services/travel-risk/src/route-scorer.ts` RouteRiskScorer; `POST /api/travel-risk/route-check`
- [x] Time-of-day modulation — `services/travel-risk/src/time-of-day.ts`
- [x] Confidence + caveats per score — `confidence` + `caveats` in `RiskScore`

### UX
- [x] City lookup page (also serves as SEO surface — `/travel/<city>`) ✓ Sprint 2.60 — /travel index + /travel/[slug] for 5 cities (Kharkiv/Kyiv/Lviv/Odesa/Dnipro)
- [x] Route planner (avoid high-risk segments) — `services/travel-risk/src/route-planner.ts`
- [x] Mobile-friendly briefing (PDF + push) — `generateAdvisoryText()` in scorer.ts (EN + UK bilingual)
- [x] Traveler-tracking dashboard for corporate clients (opt-in per traveler) — `services/travel-risk/src/corporate-dashboard.ts`

### Alerts
- [x] Pre-trip briefing email — `services/travel-risk/src/duty-of-care.ts` (DutyOfCareExportConfig pdf/csv + buildDutyOfCareReport)
- [x] During-trip alerts (geofenced) — `services/travel-risk/src/corporate-dashboard.ts` (TravelerProfile.alerts) + `services/travel-risk/src/consent.ts` (push_alerts consent type)
- [x] Crisis push (override quiet hours) — `services/travel-risk/src/consent.ts` (push_alerts consent type; override logic gated on granted consent)

### Compliance
- [x] No tracking without explicit traveler consent — `services/travel-risk/src/consent.ts` (ConsentStore.check() gate + CONSENT_NOTES_EN)
- [x] Per-traveler data retention controls — `services/travel-risk/src/consent.ts` (TravelerDataRetention + buildRetentionPolicy + DEFAULT_RETENTION_DAYS=90)
- [x] Duty-of-care report exports for corporate compliance — `services/travel-risk/src/duty-of-care.ts`

## i18n
- Briefings in user's locale; city names + transliteration.

### Примітки
Security firms persona ([../audiences/TODO_security_firms.md](../audiences/TODO_security_firms.md)) buys this.
