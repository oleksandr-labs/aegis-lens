# TODO — Persona: NGOs & Humanitarian Orgs

## Goal
Empower humanitarian targeting: where to send aid, where civilians are at risk, where corridors are open.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P4](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/ngo-humanitarian.ts](../../apps/web/src/lib/audiences/ngo-humanitarian.ts)

## Tasks

### Core features
- [x] Humanitarian layer set: displaced populations, critical infrastructure damage, civilian-impact events, medical facilities, evacuation corridors, border crossings — apps/web/src/lib/audiences/ngo-humanitarian.ts (`HUMANITARIAN_LAYERS`)
- [x] Population-at-risk estimator (modeled, with uncertainty) — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Aid-route planner (avoiding active conflict zones) — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Field-team check-in (lightweight mobile app + offline cache) — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Encrypted incident reporting from field — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Shared organizational dashboard (multi-seat) — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Coordination with UN OCHA / ReliefWeb feeds — apps/web/src/lib/audiences/ngo-humanitarian.ts

### Compliance
- [x] Data-handling agreement template for sensitive humanitarian data — apps/web/src/lib/audiences/ngo-humanitarian.ts (`NGO_DATA_EXPORT_POLICY`)
- [x] PII-zero mode (default for NGO tier) — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Audit log access — apps/web/src/lib/audiences/ngo-humanitarian.ts

### SEO surfaces
- [x] `/humanitarian` hub — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Per-crisis humanitarian briefs — apps/web/src/lib/audiences/ngo-humanitarian.ts
- [x] Partnership case studies (UN, MSF-style) — apps/web/src/lib/audiences/ngo-humanitarian.ts

> **Note:** Feature tasks above are implementation backlog (Linear). Persona definition
> in [docs/audiences/personas.md#p4--ngos--humanitarian-orgs](../../docs/audiences/personas.md).

## i18n
- EN, UK, RU, PL, RO required for refugee-corridor coverage.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P4.
Revenue model: free/discounted tier for field orgs; grant-funded institutional purchases
(UN/ICRC type) are the actual revenue path.
