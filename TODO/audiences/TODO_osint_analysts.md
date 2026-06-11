# TODO — Persona: OSINT Analysts

## Goal
The power-user persona. Give them depth, raw access, scriptability — they will evangelize us.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P3](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not shipped except where marked ✓ Sprint.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/osint-analyst.ts](../../apps/web/src/lib/audiences/osint-analyst.ts)

## Tasks

### Core features
- [x] Advanced filters (every field, AND/OR/NOT, saved queries) — see [../features/TODO_filters_search.md](../features/TODO_filters_search.md) — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Raw event JSON view + JSON-Path queries — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Reverse image / video search — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Coordinate parsing + multi-format input (MGRS, UTM, DMS) — apps/web/src/lib/audiences/osint-analyst.ts (`CoordinateParser`, `COORDINATE_FORMATS`)
- [x] Geolocation workspace (drop pin, propose location, attach clues) — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Cross-source corroboration view — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Source reputation explorer — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Export to STIX 2.1, JSON, CSV, KML, GPX, GeoJSON — apps/web/src/lib/audiences/osint-analyst.ts (`STIX_EXPORT_CONFIG`)
- [x] CLI + Python + TS SDKs — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Jupyter notebook templates — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Webhook + Zapier / n8n integrations — apps/web/src/lib/audiences/osint-analyst.ts

### Community
- [x] Verified-contributor badges — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Public leaderboard (geolocations contributed) — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Bounties for verified geolocations — apps/web/src/lib/audiences/osint-analyst.ts

### SEO surfaces
- [x] Methodology pillar pages ✓ Sprint 1.9
- [x] Tutorial library (deep, technical) — apps/web/src/lib/audiences/osint-analyst.ts
- [x] Public dataset releases — apps/web/src/lib/audiences/osint-analyst.ts

> **Note:** Feature tasks above are implementation backlog items (tracked in Linear).
> The persona definition, JTBD, feature map, pricing, onboarding path, and SEO surfaces
> are fully documented in [docs/audiences/personas.md#p3--osint-analysts](../../docs/audiences/personas.md).

## i18n
- EN priority; OSINT community is largely English-speaking but expanding to UK/RU/PL.

### Done notes (2026-05-30)
Persona fully defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P3.
JTBD, feature map, pricing (Pro/Team + academic rate), onboarding path (API key → SDK → Jupyter),
SEO surfaces, and strategic note ("This persona finds our bugs — serve them first").
