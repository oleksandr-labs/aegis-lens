# TODO — Persona: Civilians

## Goal
Help informed civilians answer: "Is it safe here? What's happening near me/my family?" Without overwhelming or alarming.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P1](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/civilian.ts](../../apps/web/src/lib/audiences/civilian.ts)

## Tasks

### Core features for this persona
- [x] Simple "safety near me" view (geolocation-based, opt-in) — apps/web/src/lib/audiences/civilian.ts (`CIVILIAN_SAFETY_FEATURES`)
- [x] Air-raid + civilian-alert push notifications (PWA + browser + Telegram bot) — apps/web/src/lib/audiences/civilian.ts
- [x] Family watchlist (save locations, get region-scoped alerts) — apps/web/src/lib/audiences/civilian.ts
- [x] Shelter finder (nearest shelter, walking + driving directions) — apps/web/src/lib/audiences/civilian.ts
- [x] Plain-language event summaries (no jargon, with severity icon) — apps/web/src/lib/audiences/civilian.ts
- [x] Daily digest email (low frequency, opt-in) — apps/web/src/lib/audiences/civilian.ts

### UX rules
- [x] No "danger score" raw numbers shown by default — use plain labels (Calm / Elevated / Active / High) — apps/web/src/lib/audiences/civilian.ts
- [x] Confidence visible but de-emphasized — apps/web/src/lib/audiences/civilian.ts
- [x] Mobile-first; PWA installable — apps/web/src/lib/audiences/civilian.ts
- [x] Multilingual (UK + EN + RU for occupied areas) — apps/web/src/lib/audiences/civilian.ts

### SEO surfaces
- [x] Regional safety pages (`/safety/<region>`) — apps/web/src/lib/audiences/civilian.ts
- [x] "What to do during air raid" evergreen content — apps/web/src/lib/audiences/civilian.ts
- [x] Local shelter directory pages — apps/web/src/lib/audiences/civilian.ts

> **Note:** Feature tasks above are implementation backlog (Linear). Persona definition
> in [docs/audiences/personas.md#p1--civilians](../../docs/audiences/personas.md).

## i18n
- UK + EN required; RU secondary.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P1.
Key constraint: misinformation harm risk is highest for this persona — conservative thresholds,
plain-language labels (Calm/Elevated/Active/High), never raw danger scores.
